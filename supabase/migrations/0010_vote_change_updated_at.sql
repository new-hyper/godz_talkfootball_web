-- 투표를 바꿀 때 updated_at 칸 권한
--
-- 첫 표(INSERT)는 되고 찬성↔반대(UPDATE)만 막혔다.
-- 화면은 choice 만 고치는데, 트리거가 같은 순간에 updated_at 을 적는다.
-- Postgres 는 SET 에 안 오른 칸이어도 트리거가 만지면 UPDATE 권한이 필요하다.
-- 0009 는 choice 만 열어 두어서 거절했다. 권한 없음(42501)이 그 오류다.

grant update (choice, updated_at) on public.vote_ballots to authenticated;

-- created_at 은 고칠 일이 없다. 트리거가 굳이 다시 적던 줄을 뺀다.
-- 그 칸까지 열어 주지 않으려고.

create or replace function public.vote_ballots_guard()
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
    new.updated_at := now();
  end if;

  return new;
end;
$$;
