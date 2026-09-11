import BoardChips from "@/components/board/BoardChips";
import SearchResults from "@/components/board/SearchResults";
import { parsePage } from "@/lib/posts";

/**
 * 검색 결과입니다. 원본 시안은 게시판 화면 위에 검색어를 덮어씌웠지만,
 * 여기서는 `/search?q=` 주소를 갖습니다. 결과를 공유할 수 있고 뒤로 가기도 제자리입니다.
 *
 * 헤더 안내대로 글·댓글·작성자를 찾습니다. 나와는 글 목록 한 줄입니다.
 */

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata(props: PageProps<"/search">) {
  const keyword = (one((await props.searchParams).q) ?? "").trim();
  if (!keyword) return { title: "검색 — 고다지 커뮤니티" };
  return { title: `‘${keyword}’ 검색 — 고다지 커뮤니티` };
}

export default async function SearchPage(props: PageProps<"/search">) {
  const params = await props.searchParams;
  const keyword = (one(params.q) ?? "").trim();
  const page = parsePage(one(params.page));

  return (
    <section className="view on">
      <div className="cols">
        <div>
          <div className="card">
            <div className="board-hd">
              <div className="eyebrow">SEARCH</div>
              <h2>{keyword ? `‘${keyword}’ 검색 결과` : "검색"}</h2>
              <p>
                {keyword
                  ? "제목·본문·댓글·작성자에서 찾았습니다."
                  : "찾고 싶은 단어를 위에 입력해 주세요."}
              </p>
            </div>

            <BoardChips currentBoardId={null} />

            {keyword ? (
              <SearchResults keyword={keyword} page={page} />
            ) : (
              <div className="empty">
                <strong>검색어를 입력해 주세요</strong>
                <p>글 제목, 본문, 댓글, 작성자 닉네임을 찾습니다.</p>
              </div>
            )}
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