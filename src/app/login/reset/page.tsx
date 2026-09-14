import Link from "next/link";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * 새 비밀번호를 정하는 화면입니다.
 *
 * 메일 링크가 `/auth/callback` 에서 확인되면 세션이 생긴 채로 여기로 옵니다.
 * 세션이 없으면 링크가 만료됐거나 주소를 직접 친 것이므로 다시 받으라고 안내합니다.
 *
 * 로그인 화면과 달리, 이미 세션이 있는 사람을 쫓아내지 않습니다.
 * 쫓아내면 링크를 눌러 놓고 비밀번호를 넣을 곳이 없어집니다.
 */
export const metadata = {
  title: "새 비밀번호 — 고다지 커뮤니티",
};

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  return (
    <section className="view on">
      <div className="card" style={{ maxWidth: 460, margin: "0 auto" }}>
        <div className="board-hd">
          <div className="eyebrow">PASSWORD</div>
          <h2>새 비밀번호</h2>
          <p>
            {user
              ? "앞으로 로그인에 쓸 비밀번호를 정해 주세요."
              : "링크가 만료되었거나 유효하지 않습니다."}
          </p>
        </div>
        <div style={{ padding: "18px 16px 22px" }}>
          {user ? (
            <ResetPasswordForm />
          ) : (
            <div className="empty">
              <strong>다시 받아 주세요</strong>
              <p>재설정 링크는 한 번만 사용할 수 있고, 시간이 지나면 만료됩니다.</p>
              <Link className="btn pri" href="/login/forgot">
                비밀번호 찾기
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
