-- 투표 안건과 찬반 표
--
-- 0004 에서 "다음에 만든다"고 적어 둔 vote_posts / vote_ballots 이다.
--
-- 안건 본문(문항·배경·댓글)은 기존 posts 에 둔다. board_id = 'vote'.
-- 마감일·집계·원 주제만 여기로 뺀다. 일반 글 행마다 빈 칸이 생기지 않게 하려는 것이다.
--
-- 누가 어디에 찍었는지는 vote_ballots 에 두고, 밖으로는 집계 숫자만 내보낸다.
-- 좋아요(post_reactions)와 같은 이유다. 표 전체를 세면 누구 표인지 다 보인다.

-- ============================================================
-- 안건 부가 정보
-- ============================================================

create table public.vote_posts (
  post_id        bigint primary key references public.posts (id) on delete cascade,

  -- 이 날짜가 한국 시간으로 지나가면 마감이다. 그날 당일까지는 찍을 수 있다.
  -- 원본 시안은 '3월 31일' 같은 글자였는데, 글자면 DB가 마감 여부를 판단하지 못한다.
  ends_on        date        not null,

  -- 토론주제에서 가져온 경우. 한 주제에서 투표를 두 번 열지 못하게 아래 유니크로 막는다.
  source_post_id bigint      references public.posts (id) on delete set null,

  yes_count      integer     not null default 0,
  no_count       integer     not null default 0,

  created_at     timestamptz not null default now()
);

comment on table public.vote_posts is
  '투표 안건의 마감·집계. 문항·본문은 posts 에 있다.';

alter table public.vote_posts
  add constraint vote_posts_counts_nonnegative
  check (yes_count >= 0 and no_count >= 0);

create unique index vote_posts_source_unique
  on public.vote_posts (source_post_id)
  where source_post_id is not null;

-- 참여순 정렬용. 트리거가 yes/no 를 다시 셀 때 같이 적는다.
-- 생성 칸(generated)으로 두면 트리거가 posts 를 고치듯 여기를 고칠 때 충돌한다.
alter table public.vote_posts
  add column ballot_count integer not null default 0;

-- ============================================================
-- 한 사람 한 표
-- ============================================================

create table public.vote_ballots (
  post_id    bigint      not null references public.vote_posts (post_id) on delete cascade,
  voter_uid  uuid        not null references public.users (uid)          on delete cascade,

  choice     text        not null check (choice in ('yes', 'no')),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  primary key (post_id, voter_uid)
);

create index vote_ballots_voter_idx on public.vote_ballots (voter_uid);

-- ============================================================
-- 마감 여부
-- ============================================================
--
-- 화면과 트리거가 같은 기준으로 보게 함수로 빼 둔다.
-- 한국 날짜가 ends_on 보다 커지면 마감이다.

create function public.vote_is_closed(ends_on date)
returns boolean
language sql
stable
set search_path = ''
as $$
  select (timezone('Asia/Seoul', now()))::date > ends_on;
$$;

-- ============================================================
-- 투표 게시판에 일반 글을 못 올리게 한다
-- ============================================================
--
-- 어드민이라도 /write 폼으로 vote 를 고르면 마감일 없는 글만 생긴다.
-- 개설은 아래 open_vote 함수만 통과시킨다.
-- 그 함수는 정의자 권한이라 current_user 가 authenticated 가 아니므로 여기 안 걸린다.

create function public.posts_guard_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  if new.board_id = 'vote' then
    raise exception '투표는 개설 화면에서만 만들 수 있습니다';
  end if;

  return new;
end;
$$;

create trigger posts_guard_insert_trigger
  before insert on public.posts
  for each row execute function public.posts_guard_insert();

-- ============================================================
-- 개설 (사무국 전용)
-- ============================================================
--
-- 글 한 줄과 vote_posts 한 줄을 한 트랜잭션으로 넣는다.
-- 둘을 브라우저에서 따로 넣으면 한쪽만 성공했을 때 마감일 없는 안건이 남는다.

create function public.open_vote(
  p_title text,
  p_body text,
  p_ends_on date,
  p_source_post_id bigint default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id bigint;
  src_board text;
  src_deleted timestamptz;
begin
  if not public.is_admin() then
    raise exception '투표 개설은 협회 사무국만 할 수 있습니다';
  end if;

  if (timezone('Asia/Seoul', now()))::date > p_ends_on then
    raise exception '마감일은 오늘 이후여야 합니다';
  end if;

  if p_source_post_id is not null then
    select board_id, deleted_at
      into src_board, src_deleted
    from public.posts
    where id = p_source_post_id;

    if src_board is null or src_deleted is not null then
      raise exception '원 주제를 찾을 수 없습니다';
    end if;

    if src_board <> 'discussion' then
      raise exception '토론주제에서만 투표를 개설할 수 있습니다';
    end if;

    if exists (
      select 1 from public.vote_posts where source_post_id = p_source_post_id
    ) then
      raise exception '이미 투표로 개설된 주제입니다';
    end if;
  end if;

  insert into public.posts (board_id, author_uid, title, body, is_anonymous)
  values ('vote', (select auth.uid()), p_title, p_body, false)
  returning id into new_id;

  insert into public.vote_posts (post_id, ends_on, source_post_id)
  values (new_id, p_ends_on, p_source_post_id);

  return new_id;
end;
$$;

grant execute on function public.open_vote(text, text, date, bigint) to authenticated;

-- ============================================================
-- 표를 넣기 전에 마감을 본다
-- ============================================================

create function public.vote_ballots_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  closed boolean;
  gone   timestamptz;
begin
  if new.voter_uid is distinct from (select auth.uid()) then
    raise exception '본인 이름으로만 투표할 수 있습니다';
  end if;

  select public.vote_is_closed(v.ends_on), p.deleted_at
    into closed, gone
  from public.vote_posts v
  join public.posts p on p.id = v.post_id
  where v.post_id = new.post_id;

  if gone is not null or closed is null then
    raise exception '없는 투표입니다';
  end if;

  if closed then
    raise exception '마감된 투표입니다';
  end if;

  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
    new.updated_at := now();
  end if;

  return new;
end;
$$;

create trigger vote_ballots_guard_trigger
  before insert or update on public.vote_ballots
  for each row execute function public.vote_ballots_guard();

-- 마감된 뒤 취소를 막으려면 삭제 전도 본다.
create function public.vote_ballots_guard_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  closed boolean;
begin
  select public.vote_is_closed(ends_on) into closed
  from public.vote_posts
  where post_id = old.post_id;

  if closed then
    raise exception '마감된 투표입니다';
  end if;

  return old;
end;
$$;

create trigger vote_ballots_guard_delete_trigger
  before delete on public.vote_ballots
  for each row execute function public.vote_ballots_guard_delete();

-- ============================================================
-- 집계를 vote_posts 에 옮겨 적는다
-- ============================================================

create function public.vote_ballots_recount()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target bigint := coalesce(new.post_id, old.post_id);
begin
  update public.vote_posts v set
    yes_count    = (select count(*) from public.vote_ballots b
                    where b.post_id = target and b.choice = 'yes'),
    no_count     = (select count(*) from public.vote_ballots b
                    where b.post_id = target and b.choice = 'no'),
    ballot_count = (select count(*) from public.vote_ballots b
                    where b.post_id = target)
  where v.post_id = target;

  return null;
end;
$$;

create trigger vote_ballots_recount_trigger
  after insert or update or delete on public.vote_ballots
  for each row execute function public.vote_ballots_recount();

-- ============================================================
-- 이미 투표로 올린 주제는 추천을 못 누르게 한다
-- ============================================================
--
-- 원본은 개설된 뒤 추천을 누르면 토스트만 띄웠다.
-- 화면만 막으면 요청을 손으로 고쳐서 순공감을 더 올릴 수 있다.

create or replace function public.post_reactions_guard()
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

  if writer = new.user_uid then
    raise exception '자기 글에는 누를 수 없습니다';
  end if;

  if exists (
    select 1 from public.vote_posts v where v.source_post_id = new.post_id
  ) then
    raise exception '이미 투표로 개설된 주제입니다';
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

-- ============================================================
-- RLS · 칸 권한
-- ============================================================

alter table public.vote_posts enable row level security;
alter table public.vote_ballots enable row level security;

create policy "투표 안건은 누구나 읽는다"
  on public.vote_posts for select
  using (true);

-- insert 는 open_vote 만. 정책 없음.
-- update 는 집계 트리거(정의자)만. 정책 없음.

create policy "내가 찍은 것만 본다"
  on public.vote_ballots for select
  using (voter_uid = (select auth.uid()));

create policy "본인 이름으로만 찍는다"
  on public.vote_ballots for insert
  with check (voter_uid = (select auth.uid()));

create policy "본인이 찍은 것만 바꾼다"
  on public.vote_ballots for update
  using      (voter_uid = (select auth.uid()))
  with check (voter_uid = (select auth.uid()));

create policy "본인이 찍은 것만 취소한다"
  on public.vote_ballots for delete
  using (voter_uid = (select auth.uid()));

revoke all on public.vote_posts from anon, authenticated;
grant select (
  post_id, ends_on, source_post_id,
  yes_count, no_count, ballot_count, created_at
) on public.vote_posts to anon, authenticated;

revoke all on public.vote_ballots from anon, authenticated;
grant select (post_id, choice, created_at, updated_at)
  on public.vote_ballots to authenticated;
grant insert (post_id, voter_uid, choice)
  on public.vote_ballots to authenticated;
grant update (choice)
  on public.vote_ballots to authenticated;
grant delete on public.vote_ballots to authenticated;

-- ============================================================
-- 목록·상세에서 읽을 것
-- ============================================================
--
-- posts_view 에 투표 칸을 붙이지 않는다. 자유게시판 행마다 빈 값이 생긴다.
-- 투표 화면만 이 뷰를 본다.

create view public.vote_posts_view as
select
  p.id,
  p.title,
  p.body,
  p.created_at,
  p.comment_count,
  v.ends_on,
  v.source_post_id,
  v.yes_count,
  v.no_count,
  v.ballot_count,
  public.vote_is_closed(v.ends_on)       as is_closed,
  b.choice                               as my_choice,
  src.title                              as source_title,
  src.is_anonymous                       as source_is_anonymous,
  case
    when src.id is null then null
    when src.is_anonymous and not public.is_admin() then null
    else su.nickname
  end                                    as source_author_nickname
from public.vote_posts v
join public.posts p on p.id = v.post_id
left join public.vote_ballots b
  on b.post_id = v.post_id
 and b.voter_uid = (select auth.uid())
left join public.posts src on src.id = v.source_post_id
left join public.users su on su.uid = src.author_uid
where p.deleted_at is null or public.is_admin();

comment on view public.vote_posts_view is
  '투표 목록·상세용. 내가 찍은 표만 my_choice 로 붙는다.';

grant select on public.vote_posts_view to anon, authenticated;
