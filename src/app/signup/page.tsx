/** 회원가입입니다. 이메일 인증번호 2단계 흐름은 회원가입 단계에서 구현합니다. */
export const metadata = {
  title: "회원가입 — 고다지 커뮤니티",
};

export default function SignupPage() {
  return (
    <section className="view on">
      <div className="card" style={{ maxWidth: 460, margin: "0 auto" }}>
        <div className="board-hd">
          <div className="eyebrow">JOIN</div>
          <h2>회원가입</h2>
          <p>이메일 인증번호 확인까지 마쳐야 가입이 완료됩니다.</p>
        </div>
        <div className="empty">
          <strong>준비 중입니다</strong>
          <p>Supabase 인증을 붙이는 단계에서 동작합니다.</p>
        </div>
      </div>
    </section>
  );
}
