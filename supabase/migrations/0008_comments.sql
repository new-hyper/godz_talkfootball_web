-- 댓글
--
-- 글(0004)과 같은 방식으로 만든다. 지우지 않고 지운 시각만 적고,
-- author_uid 는 읽기 권한을 빼고 뷰가 필요한 만큼만 내보낸다.
--
-- 여기서 처음 나오는 것이 세 가지 있다.
--   1. 익명 댓글 번호 (익명1, 익명2)
--   2. 답글 한 단
--   3. '작성자' 칩을 언제 붙일지
-- 각각 아래에 이유를 적었다.

-- ============================================================
-- 표
-- ============================================================

create table public.comments (
  id           bigint      generated always as identity primary key,

  post_id      bigint      not null references public.posts (id)    on delete cascade,

  -- 답글이면 어느 댓글에 달렸는지. 원댓글이면 비어 있다.
  parent_id    bigint      references public.comments (id)          on delete cascade,

  author_uid   uuid        not null references public.users (uid)   on delete cascade,

  body         text        not null,
  is_anonymous boolean     not null default false,

  -- 같은 글 안에서 익명끼리 구분하는 번호. 익명이 아니면 비어 있다.
  --
  -- 읽을 때 세어서 매기지 않고 저장하는 이유가 있다.
  -- 세어서 매기면 중간에 누가 댓글을 지웠을 때 뒤 사람 번호가 앞으로 당겨진다.
  -- 어제 본 '익명2' 가 오늘 '익명1' 이 되면 대화를 따라갈 수가 없다.
  -- "그 글에서 이 사람이 몇 번째 익명이었나" 는 나중에 다시 만들어낼 수 없는 사실이라
  -- 일어난 그 순간에 적어 둔다.
  anon_no      integer,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz,
  deleted_at   timestamptz
);

comment on column public.comments.author_uid is
  '익명 댓글이면 이 값이 곧 신원이다. 아래에서 읽기 권한을 뺀다.';

alter table public.comments
  add constraint comments_body_length
  check (char_length(btrim(body)) between 1 and 2000);

-- 익명이면 번호가 있고, 익명이 아니면 없다. 아래 트리거가 채워 준다.
alter table public.comments
  add constraint comments_anon_no_matches
  check ((is_anonymous and anon_no is not null) or (not is_anonymous and anon_no is null));

-- 글 하나를 열면 그 글의 댓글을 오래된 순으로 읽는다.
create index comments_post_idx
  on public.comments (post_id, created_at)
  where deleted_at is null;

create index comments_author_idx on public.comments (author_uid);
create index comments_parent_idx on public.comments (parent_id);

-- ============================================================
-- 넣기 전에 검사하고 번호를 매긴다
-- ============================================================

create function public.comments_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent_post   bigint;
  parent_parent bigint;
begin
  -- 답글은 한 단까지만 받는다.
  -- 답글에 답글이 붙기 시작하면 화면이 계단처럼 밀려 좁은 화면에서 읽을 수 없게 된다.
  -- 원본 시안도 한 단까지만 그렸다.
  if new.parent_id is not null then
    select post_id, parent_id into parent_post, parent_parent
    from public.comments where id = new.parent_id;

    if parent_post is null then
      raise exception '없는 댓글입니다';
    end if;
    if parent_parent is not null then
      raise exception '답글에는 답글을 달 수 없습니다';
    end if;
    -- 다른 글의 댓글에 답글을 매다는 요청을 막는다.
    if parent_post <> new.post_id then
      raise exception '글과 댓글이 맞지 않습니다';
    end if;
  end if;

  if not new.is_anonymous then
    new.anon_no := null;
    return new;
  end if;

  -- 여기부터 익명 번호를 매긴다.
  --
  -- 같은 글에 두 사람이 동시에 익명 댓글을 달면 둘 다 "지금 최댓값은 2" 를 읽고
  -- 나란히 3번을 가져갈 수 있다. 그 글에 대해서만 잠깐 줄을 세운다.
  -- 다른 글의 댓글은 영향받지 않고, 이 트랜잭션이 끝나면 저절로 풀린다.
  perform pg_advisory_xact_lock(new.post_id);

  -- 전에 이 글에 익명으로 단 적이 있으면 그때 번호를 그대로 쓴다.
  -- 한 사람이 댓글마다 다른 번호를 받으면 여러 명처럼 보인다.
  select c.anon_no into new.anon_no
  from public.comments c
  where c.post_id = new.post_id
    and c.author_uid = new.author_uid
    and c.anon_no is not null
  limit 1;

  if new.anon_no is null then
    -- 지워진 댓글의 번호도 세어서 건너뛴다.
    -- 지운 사람의 번호를 다음 사람이 물려받으면 남이 한 말이 내 말처럼 보인다.
    select coalesce(max(c.anon_no), 0) + 1 into new.anon_no
    from public.comments c
    where c.post_id = new.post_id;
  end if;

  return new;
end;
$$;

create trigger comments_before_insert_trigger
  before insert on public.comments
  for each row execute function public.comments_before_insert();

-- ============================================================
-- 고칠 때 건드리면 안 되는 칸을 지킨다
-- ============================================================
--
-- posts_guard_update 와 같은 방식이다. 웹으로 들어온 요청에만 적용한다(0006 참고).

create function public.comments_guard_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  -- 누가 어디에 언제 썼는지는 나중에 고쳐 쓸 수 없어야 한다.
  new.id           := old.id;
  new.post_id      := old.post_id;
  new.parent_id    := old.parent_id;
  new.author_uid   := old.author_uid;
  new.created_at   := old.created_at;

  -- 익명으로 써서 사람들이 다 본 뒤에 닉네임으로 바꾸거나 그 반대가 되면 안 된다.
  new.is_anonymous := old.is_anonymous;
  new.anon_no      := old.anon_no;

  -- 사무국이 지운 댓글을 작성자가 되살리지 못하게 한다.
  if not public.is_admin() and old.deleted_at is not null then
    new.deleted_at := old.deleted_at;
  end if;

  if new.body is distinct from old.body then
    new.updated_at := now();
  end if;

  return new;
end;
$$;

create trigger comments_guard_update_trigger
  before update on public.comments
  for each row execute function public.comments_guard_update();

-- ============================================================
-- 댓글 RLS
-- ============================================================

alter table public.comments enable row level security;

-- 0005 에서 배운 것을 여기서도 그대로 쓴다.
-- "지워진 것은 아무도 못 본다" 로만 두면 지우는 요청이 스스로 막힌다.
-- 바꾼 행을 되읽는 단계에서 자기가 방금 지운 것을 못 읽기 때문이다.
create policy "지워지지 않은 댓글은 누구나 읽는다"
  on public.comments for select
  using (
    deleted_at is null
    or public.is_admin()
    or author_uid = (select auth.uid())
  );

create policy "로그인한 회원이 자기 이름으로 쓴다"
  on public.comments for insert
  with check (
    author_uid = (select auth.uid())
    and deleted_at is null
    -- 지워진 글에는 댓글을 달 수 없다.
    and exists (
      select 1 from public.posts p
      where p.id = post_id and p.deleted_at is null
    )
  );

create policy "본인 댓글이나 사무국이 고친다"
  on public.comments for update
  using      (author_uid = (select auth.uid()) or public.is_admin())
  with check (author_uid = (select auth.uid()) or public.is_admin());

-- delete 정책은 일부러 만들지 않는다. 지우는 것은 deleted_at 을 적는 것으로 한다.

-- ============================================================
-- 칸 단위 권한
-- ============================================================

revoke all on public.comments from anon, authenticated;

grant select (
  id, post_id, parent_id, body, is_anonymous, anon_no,
  created_at, updated_at, deleted_at
) on public.comments to anon, authenticated;

grant insert (post_id, parent_id, author_uid, body, is_anonymous)
  on public.comments to authenticated;

grant update (body, deleted_at) on public.comments to authenticated;

-- ============================================================
-- 화면에서 읽을 것
-- ============================================================
--
-- posts_view 와 같은 방식이다. 만든 사람 권한으로 돌아 author_uid 를 들여다보되
-- 밖으로는 이름만 내보내고, 익명이면 그 이름도 감춘다.

create view public.comments_view as
select
  c.id,
  c.post_id,
  c.parent_id,
  c.body,
  c.is_anonymous,
  c.anon_no,
  c.created_at,
  c.updated_at,
  case
    when c.is_anonymous and not public.is_admin() then null
    else u.nickname
  end                                    as author_nickname,
  c.author_uid = (select auth.uid())     as is_mine,

  -- '작성자' 칩을 붙일지.
  --
  -- 조건이 둘 다 필요하다.
  -- 댓글이 익명이면 안 된다. 붙이는 순간 그 익명이 글쓴이라고 알려주는 셈이다.
  -- 글도 익명이면 안 된다. 익명으로 쓴 사람이 자기 글에 닉네임으로 댓글을 달았을 때
  -- 칩이 "저 익명 글은 이 닉네임이 썼다" 를 알려주게 된다.
  -- 어느 한쪽만 막으면 반대쪽으로 새어 나간다.
  (not c.is_anonymous
   and not p.is_anonymous
   and c.author_uid = p.author_uid)      as is_post_author
from public.comments c
join public.posts p on p.id = c.post_id
join public.users u on u.uid = c.author_uid
where c.deleted_at is null or public.is_admin();

comment on view public.comments_view is
  '댓글 목록용. 익명 댓글의 작성자를 감춘다. 쓰거나 고칠 때는 comments 를 쓴다.';

grant select on public.comments_view to anon, authenticated;

-- ============================================================
-- 글에 댓글 수를 적어 둔다
-- ============================================================
--
-- 목록에서 글마다 댓글을 세면 글 열 개에 열 번을 더 세야 한다.
-- 반응 개수를 posts 에 적어 두는 것과 같은 이유로 여기에도 적어 둔다.

alter table public.posts
  add column comment_count integer not null default 0;

create function public.comments_recount()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target bigint := coalesce(new.post_id, old.post_id);
begin
  update public.posts p
  set comment_count = (
    select count(*) from public.comments c
    where c.post_id = target and c.deleted_at is null
  )
  where p.id = target;

  return null;
end;
$$;

create trigger comments_recount_trigger
  after insert or update or delete on public.comments
  for each row execute function public.comments_recount();

-- ============================================================
-- posts_view 에 두 칸을 더한다
-- ============================================================
--
-- comment_count 는 목록에 [3] 으로 붙는다.
--
-- net_count 는 추천에서 비추천을 뺀 순공감이다.
-- 토론주제를 순공감순으로 정렬하려면 뺄셈한 값이 칸으로 있어야 한다.
-- 지금은 추천 수로만 줄을 세우고 있어서, 비추천을 많이 받은 주제가 위에 남는다.
--
-- 뒤에 덧붙이기만 하므로 앞의 칸들은 그대로다.

create or replace view public.posts_view as
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
  p.author_uid = (select auth.uid())     as is_mine,
  p.comment_count,
  p.up_count - p.down_count              as net_count
from public.posts p
join public.users u on u.uid = p.author_uid
where p.deleted_at is null or public.is_admin();
