-- my_account() 가 "없음" 을 제대로 표현하게 고친다
--
-- 0002에서는 반환형을 public.users(합성 타입) 하나로 뒀다.
-- 그러면 조건에 맞는 행이 없을 때 빈 값이 아니라 '모든 칸이 null 인 행' 이 돌아온다.
--
--   {"uid":null,"nickname":null,"role":null, ...}
--
-- 값이 새지는 않지만, 화면 쪽에서 "로그인 안 함" 과 "로그인했는데 닉네임이 비어 있음" 을
-- 구분할 수 없게 된다. setof 로 바꾸면 없을 때 빈 목록([])이 돌아와 헷갈릴 일이 없다.
--
-- 반환형은 create or replace 로 못 바꿔서 지우고 다시 만든다.

drop function if exists public.my_account();

create function public.my_account()
returns setof public.users
language sql
stable
security definer
set search_path = ''
as $$
  select * from public.users where uid = (select auth.uid());
$$;

comment on function public.my_account() is '로그인한 본인의 회원 정보 전체. 로그인하지 않았으면 빈 목록.';
