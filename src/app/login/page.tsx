/** 로그인입니다. 회원가입 단계에서 Supabase Auth와 함께 구현합니다. */
export const metadata = {
  title: "로그인 — 고다지 커뮤니티",
};

export default function LoginPage() {
  return (
    <section className="view on">
      <div className="card" style={{ maxWidth: 460, margin: "0 auto" }}>
        <div className="board-hd">
          <div className="eyebrow">LOGIN</div>
          <h2>로그인</h2>
          <p>이메일과 비밀번호로 로그인합니다.</p>
        </div>
        <div className="empty">
          <strong>준비 중입니다</strong>
          <p>Supabase 인증을 붙이는 단계에서 동작합니다.</p>
        </div>
      </div>
    </section>
  );
}
