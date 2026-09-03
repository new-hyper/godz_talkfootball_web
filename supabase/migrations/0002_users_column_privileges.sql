-- 회원 테이블에서 칸 단위로 읽기 권한을 좁힌다
--
-- 0001의 RLS 정책 "회원 정보는 누구나 읽는다" 는 행 전체를 열어 준다.
-- RLS는 "이 행을 봐도 되는가"만 판단할 수 있고 "이 칸은 못 본다"를 표현하지 못한다.
-- 그래서 약관 동의 기록이나 정지 여부까지 아무나 읽을 수 있었다.
--
-- 칸을 고르는 일은 RLS가 아니라 Postgres의 컬럼 단위 권한이 한다.
-- 정책은 그대로 두고 권한만 좁힌다.
--
-- 공개해야 하는 것은 셋뿐이다.
--   uid      글과 작성자를 잇는다
--   nickname 글마다 작성자 이름을 보여준다
--   role     사무국 글에 배지를 붙인다
--
-- 나머지(status, 약관 동의 기록, 가입일)는 남이 알 이유가 없다.
-- 특히 status 가 열려 있으면 누가 정지당했는지 드러나 명예 문제가 된다.

-- Supabase는 public 스키마의 테이블에 기본으로 모든 권한을 준다.
-- 통째로 회수한 뒤 필요한 것만 다시 준다. service_role 은 사무국 작업용이라 건드리지 않는다.
revoke all on table public.users from anon, authenticated;

grant select (uid, nickname, role) on table public.users to anon, authenticated;

-- 본인이 바꿀 수 있는 것은 닉네임뿐이다.
-- 0001의 트리거가 role·status 를 되돌리기는 하지만, 애초에 쓰기 권한을 주지 않는 편이 낫다.
-- 트리거는 마지막 방어선이고 이쪽이 첫 번째 문이다.
grant update (nickname) on table public.users to authenticated;

-- ============================================================
-- 본인은 자기 정보를 전부 볼 수 있어야 한다
-- ============================================================
--
-- 내 활동 화면에서 "언제 가입했고 어느 약관에 동의했는지" 를 보여주려면 필요하다.
-- security definer 라 위의 칸 권한을 넘어서지만, auth.uid() 로 본인 행만 돌려주므로
-- 남의 것은 볼 수 없다.

create function public.my_account()
returns public.users
language sql
stable
security definer
set search_path = ''
as $$
  select * from public.users where uid = (select auth.uid());
$$;

comment on function public.my_account() is '로그인한 본인의 회원 정보 전체. 로그인하지 않았으면 아무것도 돌려주지 않는다.';
