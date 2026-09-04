import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = {
  title: "로그인 — 고다지 커뮤니티",
};

export default async function LoginPage() {
  // 이미 로그인한 사람에게 로그인 폼을 보여줄 이유가 없다.
  if (await getCurrentUser()) redirect("/");

  return (
    <section className="view on">
      <div className="card" style={{ maxWidth: 460, margin: "0 auto" }}>
        <div className="board-hd">
          <div className="eyebrow">LOGIN</div>
          <h2>로그인</h2>
          <p>이메일과 비밀번호로 로그인합니다.</p>
        </div>
        <div style={{ padding: "18px 16px 22px" }}>
          <LoginForm />
        </div>
      </div>
    </section>
  );
}
