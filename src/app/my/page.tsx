import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import NicknameForm from "@/components/auth/NicknameForm";
import { nicknameChangeOpensAt } from "@/lib/auth/nickname";
import { getCurrentUser, getMyAccount } from "@/lib/auth/session";
import { formatKoreanDateTime } from "@/lib/format";

/**
 * 내 활동입니다. 원본 시안의 `v-my` 뷰에 해당합니다.
 *
 * 글·댓글·투표 기록은 게시판 단계에서 채웁니다.
 * 계정 칸에서는 닉네임을 바꿀 수 있습니다. 30일 제한은 DB 트리거가 지킵니다.
 */
export const metadata = {
  title: "내 활동 — 고다지 커뮤니티",
};

export default async function MyPage() {
  const user = await getCurrentUser();
  const account = user ? await getMyAccount() : null;
  const opensAt = nicknameChangeOpensAt(account?.nickname_changed_at ?? null);

  return (
    <section className="view on">
      <div className="cols">
        <div>
          <div className="pg-hd">
            <div className="eyebrow">MY ACTIVITY</div>
            <h1>내 활동</h1>
            <p>내가 쓴 글과 댓글, 투표한 안건을 모아서 봅니다.</p>
          </div>
          <div className="card">
            {user ? (
              <div className="card-bd pad">
                <div className="dr-me" style={{ marginBottom: 16 }}>
                  <span className="av">{user.displayName.slice(0, 1)}</span>
                  <span className="t">
                    <strong style={{ color: "var(--ink)" }}>{user.displayName}</strong>
                    <span style={{ color: "var(--dim)" }}>
                      {user.isAdmin ? "사무국 계정" : "일반 회원"}
                    </span>
                  </span>
                </div>

                {opensAt ? (
                  <div className="notice-box" style={{ marginBottom: 16 }}>
                    닉네임은 30일에 한 번만 바꿀 수 있습니다. 다음 변경은{" "}
                    <b>{formatKoreanDateTime(opensAt.toISOString())}</b>부터 가능합니다.
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <NicknameForm
                      uid={user.uid}
                      currentNickname={user.nickname}
                      isAdmin={user.isAdmin}
                    />
                  </div>
                )}

                <div className="notice-box" style={{ marginBottom: 16 }}>
                  글·댓글·투표 기록은 게시판을 만들면서 채웁니다.
                </div>
                <LogoutButton />
              </div>
            ) : (
              <div className="empty">
                <strong>로그인이 필요합니다</strong>
                <p>익명으로 쓴 글도 여기에서는 내 기록으로 보입니다.</p>
                <Link className="btn pri" href="/login">
                  로그인
                </Link>
              </div>
            )}
          </div>
        </div>

        <aside className="side">
          <div className="card">
            <div className="card-hd">
              <span className="spine" />
              <h3>커뮤니티 활동 원칙</h3>
            </div>
            <div className="card-bd pad">
              <div className="notice-box">
                익명 글도 <b>내 활동</b>에는 남습니다. 본인만 볼 수 있고 다른 회원에게는 익명
                이름만 보입니다.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
