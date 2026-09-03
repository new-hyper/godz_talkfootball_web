-- 회원 테이블과 가입 처리
--
-- 이메일과 비밀번호는 Supabase가 관리하는 auth.users 에만 둔다.
-- 여기에는 커뮤니티가 쓰는 정보(닉네임·역할)만 담는다.
-- 이메일을 이쪽으로 복사하면 새어 나갈 통로가 하나 더 생기므로 복사하지 않는다.
--
-- 이름이 auth.users 와 겹치지만 스키마가 달라 충돌하지 않는다.
-- 다만 SQL을 쓸 때 어느 쪽인지 헷갈리기 쉬우므로, 이 파일의 함수는 전부
-- search_path 를 비우고 public.users / auth.users 로 또박또박 적는다.

create table public.users (
  -- 사용자별 고유 문자열. auth.users 가 발급한 값을 그대로 쓴다.
  -- 따로 만들지 않는 이유는, 두 벌이 되면 어긋났을 때 누가 맞는지 알 수 없기 때문이다.
  uid                 uuid primary key references auth.users (id) on delete cascade,

  nickname            text        not null,

  -- 역할은 둘뿐이다. 원본 시안의 회원 구분(지도자·학부모·선수·심판)은 쓰지 않는다.
  -- 어드민은 가입으로 만들 수 없고 최초 1명만 SQL로 지정한다.
  role                text        not null default 'user'   check (role   in ('user', 'admin')),
  status              text        not null default 'active' check (status in ('active', 'suspended')),

  -- 닉네임 변경은 30일에 한 번. 마지막으로 바꾼 시각을 남겨 두고 아래 트리거가 검사한다.
  nickname_changed_at timestamptz,

  -- 나중에 약관이 바뀌었을 때 누가 어느 버전에 동의했는지 따질 수 있어야 한다.
  terms_agreed_at     timestamptz not null default now(),
  terms_version       text        not null default 'v1',
  age_confirmed       boolean     not null default false,

  created_at          timestamptz not null default now()
);

comment on table  public.users     is '회원 공개 정보. 이메일·비밀번호는 auth.users 에 있다.';
comment on column public.users.uid is 'auth.users.id 와 같은 값. 사용자별 고유 문자열.';

-- 닉네임 형식: 한글·영문·숫자 2~12자. 특수문자·이모지·공백은 막는다.
alter table public.users
  add constraint users_nickname_format
  check (nickname ~ '^[가-힣a-zA-Z0-9]{2,12}$');

-- 예약어. 익명 별칭(`익명의 윙어`)이나 사무국을 사칭하지 못하게 막는다.
-- 닉네임에 공백이 못 들어가므로 `익명의`로 시작하는 것만 걸러도 충분하다.
alter table public.users
  add constraint users_nickname_reserved
  check (
    nickname !~ '^익명의'
    and nickname !~* '(협회|사무국|운영|관리자|admin)'
  );

-- 중복을 실제로 막는 것은 이 유니크 인덱스다. 가입 화면의 사전 확인은 편의일 뿐이다.
-- 대소문자를 무시해야 `Coach` 와 `coach` 가 다른 사람으로 보이지 않는다.
create unique index users_nickname_lower_key on public.users (lower(nickname));

-- ============================================================
-- 가입하면 회원 행을 자동으로 만든다
-- ============================================================
--
-- signUp() 에 실려 오는 메타데이터는 클라이언트가 마음대로 채울 수 있다.
-- 그래서 닉네임만 읽고 role 은 항상 'user' 로 박아 넣는다.
-- 여기서 new.raw_user_meta_data ->> 'role' 을 믿으면 누구나 어드민이 된다.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer            -- public.users 의 RLS를 우회해야 삽입할 수 있다
set search_path = ''        -- 검색 경로를 비워 함수 가로채기를 막는다
as $$
begin
  insert into public.users (uid, nickname, role, terms_version, age_confirmed)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nickname',
    'user',
    coalesce(new.raw_user_meta_data ->> 'terms_version', 'v1'),
    coalesce((new.raw_user_meta_data ->> 'age_confirmed')::boolean, false)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 회원 정보 수정 시 건드리면 안 되는 칸을 지킨다
-- ============================================================
--
-- RLS는 "이 행을 고쳐도 되는가"만 판단하고 "이 칸은 못 고친다"를 표현하지 못한다.
-- 본인 정보 수정을 허용하는 순간 role 을 'admin' 으로 바꿔 쓸 수 있게 되므로
-- 트리거로 되돌려 놓는다.

create function public.users_guard_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- 서버 전용 키로 하는 작업은 사무국 처리라 통과시킨다.
  if auth.role() = 'service_role' then
    return new;
  end if;

  -- 권한·상태는 본인이 바꿀 수 없다. 조용히 원래 값으로 되돌린다.
  new.role   := old.role;
  new.status := old.status;

  -- 가입 시점 기록은 나중에 고쳐 쓸 수 없어야 증거가 된다.
  new.uid             := old.uid;
  new.created_at      := old.created_at;
  new.terms_agreed_at := old.terms_agreed_at;
  new.terms_version   := old.terms_version;
  new.age_confirmed   := old.age_confirmed;

  -- 닉네임은 30일에 한 번만 바꿀 수 있다.
  if new.nickname is distinct from old.nickname then
    if old.nickname_changed_at is not null
       and old.nickname_changed_at > now() - interval '30 days'
    then
      raise exception '닉네임은 30일에 한 번만 바꿀 수 있습니다';
    end if;
    new.nickname_changed_at := now();
  end if;

  return new;
end;
$$;

create trigger users_guard_update_trigger
  before update on public.users
  for each row execute function public.users_guard_update();

-- ============================================================
-- RLS
-- ============================================================

alter table public.users enable row level security;

-- 글쓴이 닉네임을 보여주려면 로그인하지 않은 사람도 읽을 수 있어야 한다.
create policy "회원 정보는 누구나 읽는다"
  on public.users for select
  using (true);

-- 본인 행만 수정한다. 어느 칸을 고칠 수 있는지는 위 트리거가 따로 지킨다.
create policy "본인 정보만 수정한다"
  on public.users for update
  using      ((select auth.uid()) = uid)
  with check ((select auth.uid()) = uid);

-- insert·delete 정책은 일부러 만들지 않는다.
-- 삽입은 위 가입 트리거만 하고, 탈퇴는 auth.users 가 지워질 때 함께 지워진다.

-- ============================================================
-- 닉네임 사용 가능 여부
-- ============================================================
--
-- 가입 화면에서 미리 확인해 주기 위한 함수다. 최종 방어선은 위의 유니크 인덱스이고
-- 이 함수는 사용자에게 미리 알려 주기 위한 것일 뿐이다.
-- 형식·예약어 규칙이 테이블 제약과 어긋나지 않게 여기 한곳에 모아 둔다.

create function public.nickname_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    candidate ~ '^[가-힣a-zA-Z0-9]{2,12}$'
    and candidate !~ '^익명의'
    and candidate !~* '(협회|사무국|운영|관리자|admin)'
    and not exists (
      select 1 from public.users where lower(nickname) = lower(candidate)
    );
$$;

-- 아직 안 한 것: 24시간 지난 미인증 계정 정리.
-- pg_cron 확장이 필요해서 별도 마이그레이션으로 뺀다.
