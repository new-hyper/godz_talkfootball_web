import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

/**
 * 비밀번호 찾기입니다. 가입 인증과 달리 메일에 **링크**가 갑니다.
 *
 * 이미 로그인한 사람은 링크를 기다릴 필요가 없습니다.
 * 세션이 있으니 바로 새 비밀번호 화면으로 보냅니다.
 */
export const metadata = {
  title: "비밀번호 찾기 — 고다지 커뮤니티",
};

export default async function ForgotPasswordPage(props: PageProps<"/login/forgot">) {
  if (await getCurrentUser()) redirect("/login/reset");

  const expired = (await props.searchParams).expired === "1";

  return (
    <section className="view on">
      <div className="card" style={{ maxWidth: 460, margin: "0 auto" }}>
        <div className="board-hd">
          <div className="eyebrow">PASSWORD</div>
          <h2>비밀번호 찾기</h2>
          <p>가입하신 이메일로 재설정 링크를 보냅니다. 인증번호가 아닙니다.</p>
        </div>
        <div style={{ padding: "18px 16px 22px" }}>
          <ForgotPasswordForm expired={expired} />
        </div>
      </div>
    </section>
  );
}
