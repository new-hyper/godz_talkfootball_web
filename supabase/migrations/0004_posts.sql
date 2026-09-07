-- 게시판과 글
--
-- 게시판 이름·설명·순서는 src/lib/boards.ts 에 있다. 여기 boards 표에는
-- "누가 쓸 수 있나", "무엇을 누를 수 있나" 만 담는다.
-- 화면에서만 막으면 요청을 손으로 고쳐 보내는 것을 못 막기 때문이다.
-- 회원가입 때 role 을 클라이언트 값에서 읽지 않고 트리거에 박아 넣은 것과 같은 이유다.
--
-- 투표(vote_posts, vote_ballots)와 댓글(comments)은 다음 마이그레이션에서 만든다.

-- ============================================================
-- 게시판
-- ============================================================

create table public.boards (
  id         text    primary key,

  -- 협회 사무국만 글을 쓸 수 있는 게시판
  staff_only boolean not null default false,

  -- 이 게시판에서 누를 수 있는 것.
  -- like   = 좋아요 하나
  -- updown = 추천·비추천 (토론주제)
  -- none   = 없음 (투표는 찬반을 따로 받는다)
  reaction   text    not null default 'like'
             check (reaction in ('like', 'updown', 'none'))
);

comment on table public.boards is '게시판 권한. 이름·설명은 src/lib/boards.ts 에 있다.';

insert into public.boards (id, staff_only, reaction) values
  ('notice', true,  'like'),
  ('vote',   true,  'none'),
  ('topic',  false, 'updown'),
  ('free',   false, 'like'),
  ('parent', false, 'like'),
  ('player', false, 'like'),
  ('event',  false, 'like'),
  ('qna',    false, 'like');

alter table public.boards enable row level security;

create policy "게시판은 누구나 읽는다"
  on public.boards for select
  using (true);

-- 쓰기 정책은 일부러 만들지 않는다. 게시판이 바뀌는 것은 마이그레이션으로만 한다.

-- ============================================================
-- 어드민인지 확인
-- ============================================================
--
-- 아래 정책들이 여러 번 부르므로 함수로 빼 둔다.

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where uid = (select auth.uid()) and role = 'admin'
  );
$$;

-- ============================================================
-- 글
-- ============================================================

create table public.posts (
  id           bigint      generated always as identity primary key,

  board_id     text        not null references public.boards (id),
  author_uid   uuid        not null references public.users (uid) on delete cascade,

  title        text        not null,
  body         text        not null,

  -- 익명으로 썼는지. 한 번 정하면 못 바꾼다(아래 트리거).
  is_anonymous boolean     not null default false,

  -- 화면에 보이는 숫자. post_reactions 를 셀 때마다 아래 트리거가 다시 적는다.
  -- 반응 표를 직접 세게 하면 누가 무엇을 눌렀는지 다 보이므로 이렇게 나눈다.
  like_count   integer     not null default 0,
  up_count     integer     not null default 0,
  down_count   integer     not null default 0,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz,

  -- 실제로 지우지 않고 시각만 적는다.
  -- 진짜 지우면 달려 있던 댓글이 갈 곳을 잃고, 신고를 처리한 근거도 남지 않는다.
  deleted_at   timestamptz
);

comment on column public.posts.author_uid is
  '익명 글이면 이 값이 곧 신원이다. 아래에서 읽기 권한을 뺀다.';

alter table public.posts
  add constraint posts_title_length
  check (char_length(btrim(title)) between 1 and 80);

alter table public.posts
  add constraint posts_body_length
  check (char_length(btrim(body)) between 1 and 20000);

-- 게시판을 열면 최신순으로 읽는다. 지워진 글은 목록에 없으므로 색인에서도 뺀다.
create index posts_board_recent_idx
  on public.posts (board_id, created_at desc)
  where deleted_at is null;

create index posts_author_idx on public.posts (author_uid);

-- ============================================================
-- 글을 고칠 때 건드리면 안 되는 칸을 지킨다
-- ============================================================
--
-- users_guard_update 와 같은 방식이다. RLS는 "이 행을 고쳐도 되는가"만 판단하고
-- "이 칸은 못 고친다"를 표현하지 못한다.

create function public.posts_guard_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.role() = 'service_role' then
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

create trigger posts_guard_update_trigger
  before update on public.posts
  for each row execute function public.posts_guard_update();

-- ============================================================
-- 글 RLS
-- ============================================================

alter table public.posts enable row level security;

create policy "지워지지 않은 글은 누구나 읽는다"
  on public.posts for select
  using (deleted_at is null or public.is_admin());

create policy "로그인한 회원이 자기 이름으로 쓴다"
  on public.posts for insert
  with check (
    author_uid = (select auth.uid())
    and deleted_at is null
    and (
      not (select b.staff_only from public.boards b where b.id = board_id)
      or public.is_admin()
    )
  );

create policy "본인 글이나 사무국이 고친다"
  on public.posts for update
  using      (author_uid = (select auth.uid()) or public.is_admin())
  with check (author_uid = (select auth.uid()) or public.is_admin());

-- delete 정책은 일부러 만들지 않는다. 지우는 것은 deleted_at 을 적는 것으로 한다.

-- ============================================================
-- 칸 단위 권한
-- ============================================================
--
-- author_uid 를 읽을 수 있으면 익명 글의 작성자가 그대로 드러난다.
-- RLS는 행 단위라 이걸 막지 못하므로 0002 에서 쓴 방법을 여기서도 쓴다.
-- 대신 아래 posts_view 가 필요한 만큼만 알려 준다.

revoke all on public.posts from anon, authenticated;

grant select (
  id, board_id, title, body, is_anonymous,
  like_count, up_count, down_count,
  created_at, updated_at, deleted_at
) on public.posts to anon, authenticated;

grant insert (board_id, author_uid, title, body, is_anonymous)
  on public.posts to authenticated;

-- 집계 칸이 빠져 있다. 사람이 직접 like_count 를 999로 적을 수 없어야 한다.
grant update (title, body, board_id, deleted_at)
  on public.posts to authenticated;

-- ============================================================
-- 목록·상세에서 읽을 것
-- ============================================================
--
-- 이 뷰는 만든 사람(postgres) 권한으로 돌아 author_uid 를 들여다볼 수 있다.
-- 대신 밖으로는 이름만 내보내고, 익명 글이면 그 이름도 감춘다.
-- 어드민은 익명 글의 작성자를 볼 수 있다.

create view public.posts_view as
select
  p.id,
  p.board_id,
  p.title,
  p.body,
  p.is_anonymous,
  p.like_count,
  p.up_count,
  p.down_count,
  p.created_at,
  p.updated_at,
  p.deleted_at,
  case
    when p.is_anonymous and not public.is_admin() then null
    else u.nickname
  end                                    as author_nickname,
  p.author_uid = (select auth.uid())     as is_mine
from public.posts p
join public.users u on u.uid = p.author_uid
where p.deleted_at is null or public.is_admin();

comment on view public.posts_view is
  '목록·상세용. 익명 글의 작성자를 감춘다. 글을 쓰거나 고칠 때는 posts 를 쓴다.';

grant select on public.posts_view to anon, authenticated;

-- ============================================================
-- 좋아요·추천·비추천
-- ============================================================

create table public.post_reactions (
  post_id    bigint      not null references public.posts (id) on delete cascade,
  user_uid   uuid        not null references public.users (uid) on delete cascade,

  kind       text        not null check (kind in ('like', 'up', 'down')),
  created_at timestamptz not null default now(),

  -- 한 사람이 한 글에 하나만 남긴다.
  -- 추천을 눌렀다가 비추천으로 바꾸면 덮어쓰기가 되고, 같은 것을 또 누르면 지운다.
  primary key (post_id, user_uid)
);

create index post_reactions_user_idx on public.post_reactions (user_uid);

-- 게시판마다 누를 수 있는 것이 다르다.
-- 여러 표를 봐야 해서 check 제약으로는 표현하지 못하므로 트리거로 검사한다.

create function public.post_reactions_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed text;
  writer  uuid;
begin
  select b.reaction, p.author_uid
    into allowed, writer
  from public.posts p
  join public.boards b on b.id = p.board_id
  where p.id = new.post_id and p.deleted_at is null;

  if allowed is null then
    raise exception '없는 글입니다';
  end if;

  -- 순공감이 쌓이면 사무국이 투표로 개설하는 구조라
  -- 자기 주제를 자기가 밀어 올릴 수 있으면 안 된다.
  if writer = new.user_uid then
    raise exception '자기 글에는 누를 수 없습니다';
  end if;

  if allowed = 'none' then
    raise exception '이 게시판에서는 누를 수 없습니다';
  elsif allowed = 'like' and new.kind <> 'like' then
    raise exception '이 게시판은 좋아요만 누를 수 있습니다';
  elsif allowed = 'updown' and new.kind not in ('up', 'down') then
    raise exception '이 게시판은 추천·비추천만 누를 수 있습니다';
  end if;

  return new;
end;
$$;

create trigger post_reactions_guard_trigger
  before insert or update on public.post_reactions
  for each row execute function public.post_reactions_guard();

-- 누른 결과를 posts 의 집계 칸에 옮겨 적는다.
-- security definer 라 posts 의 RLS와 칸 권한을 지나칠 수 있다.
-- 남의 글에 좋아요를 눌러도 그 글의 숫자가 올라가야 하므로 이 통로가 필요하다.

create function public.post_reactions_recount()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target bigint := coalesce(new.post_id, old.post_id);
begin
  update public.posts p set
    like_count = (select count(*) from public.post_reactions r
                  where r.post_id = target and r.kind = 'like'),
    up_count   = (select count(*) from public.post_reactions r
                  where r.post_id = target and r.kind = 'up'),
    down_count = (select count(*) from public.post_reactions r
                  where r.post_id = target and r.kind = 'down')
  where p.id = target;

  return null;
end;
$$;

create trigger post_reactions_recount_trigger
  after insert or update or delete on public.post_reactions
  for each row execute function public.post_reactions_recount();

-- ============================================================
-- 반응 RLS
-- ============================================================

alter table public.post_reactions enable row level security;

-- 누가 무엇을 눌렀는지는 본인만 본다.
-- 화면에 필요한 것은 "내가 눌렀는지"와 "전부 몇 개인지" 둘뿐이고,
-- 개수는 posts 의 집계 칸에서 읽는다.
create policy "내가 누른 것만 본다"
  on public.post_reactions for select
  using (user_uid = (select auth.uid()));

create policy "본인 이름으로만 누른다"
  on public.post_reactions for insert
  with check (user_uid = (select auth.uid()));

create policy "본인이 누른 것만 바꾼다"
  on public.post_reactions for update
  using      (user_uid = (select auth.uid()))
  with check (user_uid = (select auth.uid()));

create policy "본인이 누른 것만 취소한다"
  on public.post_reactions for delete
  using (user_uid = (select auth.uid()));
