-- 내 표를 찾을 때 voter_uid 읽기 권한
--
-- 0010 으로 updated_at 은 열었는데도 바꾸기가 막혔다.
-- 화면은 `.eq("voter_uid", 내번호)` 로 내 줄을 찾는다.
-- PostgREST 는 조건에 쓴 칸을 SELECT 할 수 있어야 한다.
-- 0009 는 누가 찍었는지 숨기려고 voter_uid 읽기를 빼 두었다.
--
-- 남 표를 보는 것은 그대로 RLS 가 막는다. 내 줄의 voter_uid 는
-- 어차피 내 번호라, 열어 줘도 새로 새는 정보가 없다.

grant select (voter_uid) on public.vote_ballots to authenticated;
