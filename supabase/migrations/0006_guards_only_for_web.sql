-- 회원 규칙은 웹으로 들어온 요청에만 적용한다
--
-- 대시보드에서 닉네임을 두 번 바꾸려다 막혔다.
--
--   닉네임은 30일에 한 번만 바꿀 수 있습니다
--
-- 30일 제한은 회원끼리 서로 못 알아보는 일을 막으려는 규칙이지,
-- 운영하는 사람이 표를 직접 손보는 것까지 막으려던 것이 아니다.
--
-- 왜 막혔는지부터 적어 둔다.
--
-- RLS는 지나갔다. 대시보드는 표 주인 자격으로 접속하기 때문에 행 정책이 적용되지 않는다.
-- 하지만 트리거는 그렇지 않다. 트리거는 "누가 요청했나"가 아니라
-- "값이 이렇게 바뀌어도 되나"를 보기 때문에 접속 권한과 무관하게 항상 실행된다.
--
-- 면제 조건을 auth.role() = 'service_role' 로 써 두었는데,
-- auth.role() 은 웹 요청에 실려 온 토큰을 읽는 함수다.
-- 대시보드에는 그런 토큰이 없어서 값이 비어 있었고, 그래서 면제되지 않았다.
--
-- 그래서 판단 기준을 바꾼다.
--
-- REST를 거쳐 들어오는 요청은 반드시 anon(로그인 안 함) 또는 authenticated(로그인함)
-- 둘 중 하나로 도착한다. 지켜야 할 대상은 그 둘뿐이다.
-- 그 밖의 접속 — 대시보드, 마이그레이션, 서버 전용 키 — 은 운영하는 쪽이므로 통과시킨다.
--
-- 역할 이름을 하나하나 적지 않고 "이 둘이 아니면"으로 뒤집어 쓴 이유는,
-- 대시보드가 어떤 이름으로 붙는지가 Supabase 사정에 따라 달라질 수 있어서다.
-- 막아야 할 쪽은 둘로 고정되어 있으니 그쪽을 적는 편이 덜 깨진다.

create or replace function public.users_guard_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- 웹으로 들어온 요청이 아니면 운영 작업이다. 그대로 통과시킨다.
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  -- 권한·상태는 본인이 바꿀 수 없다. 조용히 원래 값으로 되돌린다.
  new.role   := old.role;
  new.status := old.status;

  -- 가입할 때 정해진 것들도 마찬가지다.
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

-- 글 쪽도 사정이 같다.
-- 잘못 올라온 글의 게시판을 대시보드에서 옮기거나 지운 글을 되살리는 것은 운영 작업인데,
-- 지금은 트리거가 조용히 원래 값으로 되돌려 놓아서 아무 일도 일어나지 않는다.
-- 오류도 안 나므로 고쳤다고 착각하기 쉬워 더 나쁘다.

create or replace function public.posts_guard_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  -- 누가 언제 썼는지는 나중에 고쳐 쓸 수 없어야 증거가 된다.
  new.author_uid := old.author_uid;
  new.created_at := old.created_at;

  -- 익명으로 써서 사람들이 다 본 뒤에 닉네임으로 바꾸거나 그 반대가 되면 안 된다.
  new.is_anonymous := old.is_anonymous;

  -- 잘못된 게시판에 올라온 글을 옮기는 것은 사무국의 일이다.
  if not public.is_admin() then
    new.board_id := old.board_id;
  end if;

  -- 사무국이 지운 글을 작성자가 되살리지 못하게 한다.
  if not public.is_admin() and old.deleted_at is not null then
    new.deleted_at := old.deleted_at;
  end if;

  if new.title is distinct from old.title
     or new.body is distinct from old.body then
    new.updated_at := now();
  end if;

  return new;
end;
$$;
