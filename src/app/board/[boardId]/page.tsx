import Link from "next/link";
import { notFound } from "next/navigation";
import BoardChips from "@/components/board/BoardChips";
import BoardPostList from "@/components/board/BoardPostList";
import { boardOf } from "@/lib/boards";
import { parsePage, parseSort } from "@/lib/posts";

/**
 * 게시판 목록입니다. 원본 시안의 `v-board` 뷰에 해당합니다.
 *
 * 게시판이 8개라고 파일을 8개 만들지 않고 `[boardId]` 한 개로 받습니다.
 * 주소의 `boardId` 를 꺼내 `BOARDS` 에서 찾고, 없는 주소면 404를 냅니다.
 *
 * 정렬과 쪽 번호는 주소에 담습니다(`?sort=hot&page=2`).
 * 그래야 "인기순으로 본 자유게시판 2쪽"을 그대로 공유할 수 있고,
 * 뒤로 가기를 눌렀을 때 보던 자리로 돌아옵니다.
 *
 * 글 목록은 `BoardPostList` 로 떼어 두었습니다. Supabase를 다녀와야 하는 부분은
 * 그것뿐이라, 나중에 "먼저 그리고 나중에 채우기"로 바꿀 일이 생기면 그 자리만 손대면 됩니다.
 * 지금은 화면이 여러 번 바뀌는 편이 더 거슬려서 다 준비된 뒤에 한 번에 그립니다.
 *
 * 원본에 있던 미리 만들어 두기(generateStaticParams)는 뺐습니다.
 * 글 목록이 수시로 바뀌는 데다 '본인' 칩처럼 보는 사람마다 달라지는 것이 있어
 * 미리 만들어 둘 수가 없습니다. 정적 페이지 8개는 지금도 미리 만듭니다.
 */

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

  const params = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const sort = parseSort(one(params.sort));
  const page = parsePage(one(params.page));

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

            <BoardChips currentBoardId={boardId} />

            {board.id === "vote" && (
              <div className="pnote">
                투표는 <b>협회 사무국만</b> 개설합니다. 다루고 싶은 주제가 있으면{" "}
                <Link className="lk" href="/board/discussion">
                  토론주제
                </Link>
                에 올려 주세요.
              </div>
            )}
            {board.id === "discussion" && (
              <div className="pnote amber">
                주제는 <b>회원 누구나</b> 올릴 수 있고, 추천·비추천으로 공감을 표시합니다. 순공감이
                쌓인 주제를 사무국이 검토해 <b>투표</b>로 개설합니다.
              </div>
            )}

            {/*
              여기를 <Suspense> 로 감싸지 않습니다. 감싸면 목록이 준비되기 전에
              그 자리에 뼈대를 먼저 내보내는데, 게시판을 옮길 때마다 경계가 새로 만들어져
              뼈대가 떴다가 200ms 뒤 진짜 목록으로 바뀝니다. 화면이 두 번 변합니다.

              감싸지 않으면 목록이 준비될 때까지 이 화면 전체가 기다립니다.
              그동안 브라우저에는 보던 게시판이 그대로 떠 있고, 다 되면 한 번에 바뀝니다.
              눈에 보이는 변화가 한 번뿐입니다.

              기다리는 시간이 300ms를 넘어가기 시작하면 반대가 됩니다.
              그때는 아무 반응이 없는 편이 더 답답하므로 다시 감싸는 것이 낫습니다.
            */}
            <BoardPostList boardId={boardId} sort={sort} page={page} />
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
