import SignupForm from "@/components/auth/SignupForm";

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
        <div style={{ padding: "18px 16px 22px" }}>
          <SignupForm />
        </div>
      </div>
    </section>
  );
}
