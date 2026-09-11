import { redirect } from "next/navigation";
import OpenVoteForm from "@/components/board/OpenVoteForm";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * 투표 개설입니다. 원본 시안에서는 모달이었고, 여기서는 주소를 가진 페이지입니다.
 *
 * 일반 글쓰기(`/write`)와 파일을 나눈 이유: 마감일이 있고, 익명이 없고,
 * DB 에 글과 안건을 한 번에 넣어야 합니다. 한 폼에 경우에 따라 칸을 끼워 넣으면
 * "투표인데 익명 체크가 보인다" 같은 사고가 납니다.
 *
 * 어드민인지는 서버에서 봅니다. 브라우저에서 가리면 주소만 알면 폼이 열립니다.
 * 열어 봐도 `open_vote` 가 다시 막습니다. 여기서 거르는 것은 눌러 봐야 실패할
 * 화면을 아예 안 보여 주려는 것입니다.
 */
export const metadata = {
  title: "투표 개설 — 고다지 커뮤니티",
};

export default async function OpenVotePage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login?next=/write/vote");
  if (!user.isAdmin) redirect("/board/vote");

  return (
    <section className="view on">
      <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="board-hd">
          <div className="eyebrow">VOTE</div>
          <h2>투표 개설</h2>
          <p>협회 사무국이 개설한 안건에 회원이 찬반으로 투표합니다.</p>
        </div>
        <div style={{ padding: "18px 16px 8px" }}>
          <OpenVoteForm />
        </div>
      </div>
    </section>
  );
}
