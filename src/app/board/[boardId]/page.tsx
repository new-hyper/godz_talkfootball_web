import { notFound } from "next/navigation";
import { BOARDS, boardOf } from "@/lib/boards";

/**
 * 게시판 목록입니다. 원본 시안의 `v-board` 뷰에 해당합니다.
 *
 * 게시판이 10개라고 파일을 10개 만들지 않고 `[boardId]` 한 개로 받습니다.
 * 주소의 `boardId` 를 꺼내 `BOARDS` 에서 찾고, 없는 주소면 404를 냅니다.
 * 글 목록과 정렬·페이지 이동은 Supabase를 붙이는 단계에서 채웁니다.
 */

/**
 * 게시판 10개는 고정이라 빌드 시점에 미리 만들어 둡니다.
 * 검색엔진이 읽을 HTML이 이미 준비된 상태가 되고, 첫 진입도 빨라집니다.
 */
export function generateStaticParams() {
  return BOARDS.map((b) => ({ boardId: b.id }));
}

export async function generateMetadata(props: PageProps<"/board/[boardId]">) {
  const { boardId } = await props.params;
  const board = boardOf(boardId);
  if (!board) return {};
  return { title: `${board.name} — 고다지 커뮤니티`, description: board.desc };
}

export default async function BoardPage(props: PageProps<"/board/[boardId]">) {
  const { boardId } = await props.params;
  const board = boardOf(boardId);
  if (!board) notFound();

  return (
    <section className="view on">
      <div className="cols">
        <div>
          <div className="card">
            <div className="board-hd">
              <div className="eyebrow">{board.en}</div>
              <h2>{board.name}</h2>
              <p>{board.desc}</p>
            </div>
            <div className="empty">
              <strong>아직 글이 없습니다</strong>
              <p>글 목록은 Supabase를 연결하는 단계에서 표시됩니다.</p>
            </div>
          </div>
        </div>

        <aside className="side">
          <div className="card">
            <div className="card-hd">
              <span className="spine" />
              <h3>커뮤니티 이용 원칙</h3>
            </div>
            <div className="card-bd pad">
              <div className="notice-box">
                익명으로 써도 <b>기록은 남습니다.</b> 선수 실명 비방, 특정 클럽 저격, 지도자 신상
                노출은 예고 없이 삭제되고 활동이 제한됩니다.
                <br />
                <br />
                반대 의견은 환영합니다. 사람이 아니라 <b>주장을 반박해 주세요.</b>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
