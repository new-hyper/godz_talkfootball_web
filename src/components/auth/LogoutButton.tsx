/**
 * 로그아웃 버튼.
 *
 * 자바스크립트로 처리하지 않고 그냥 폼을 보냅니다. `src/app/auth/logout/route.ts` 가 받습니다.
 * 이러면 두 가지가 공짜로 따라옵니다.
 * 쿠키를 서버가 지우니 확실하고, 페이지가 통째로 다시 열리니 헤더가 반드시 새로 그려집니다.
 * 브라우저에서 처리하면 화면을 다시 그리라고 따로 일러줘야 하고, 그걸 빼먹으면
 * 로그아웃했는데 헤더에는 닉네임이 남습니다.
 *
 * form 에 display:contents 를 준 이유는, 이 폼이 없는 것처럼 취급되어
 * 버튼이 바로 부모의 자식처럼 배치되게 하려는 것입니다.
 * 안 그러면 드로어 하단의 버튼 두 개가 나란히 놓이지 않습니다.
 */
export default function LogoutButton({
  className = "btn ghost",
  children = "로그아웃",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <form action="/auth/logout" method="post" style={{ display: "contents" }}>
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
