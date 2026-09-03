import Link from "next/link";

/**
 * 내 활동입니다. 원본 시안의 `v-my` 뷰에 해당합니다.
 *
 * 로그인한 사람의 글·댓글·투표 기록을 보여주는 화면이라 인증이 붙어야 의미가 생깁니다.
 * 지금은 로그인이 없으므로 로그인을 안내하는 상태만 보여줍니다.
 */
export const metadata = {
  title: "내 활동 — 고다지 커뮤니티",
};

export default function MyPage() {
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
            <div className="empty">
              <strong>로그인이 필요합니다</strong>
              <p>익명으로 쓴 글도 여기에서는 내 기록으로 보입니다.</p>
              <Link className="btn pri" href="/login">
                로그인
              </Link>
            </div>
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
