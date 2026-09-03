/**
 * 검색 결과입니다.
 *
 * 원본 시안은 목업 배열을 자바스크립트로 걸러냈지만, 여기서는 Supabase에 질의해야 합니다.
 * 글 목록을 붙이는 단계에서 함께 구현합니다.
 */
export const metadata = {
  title: "검색 — 고다지 커뮤니티",
};

export default async function SearchPage(props: PageProps<"/search">) {
  const { q } = await props.searchParams;
  const keyword = typeof q === "string" ? q : "";

  return (
    <section className="view on">
      <div className="cols">
        <div>
          <div className="card">
            <div className="board-hd">
              <div className="eyebrow">SEARCH</div>
              <h2>검색</h2>
              <p>{keyword ? `‘${keyword}’ 검색 결과입니다.` : "검색어를 입력해 주세요."}</p>
            </div>
            <div className="empty">
              <strong>검색은 아직 연결되지 않았습니다</strong>
              <p>글 목록을 붙이는 단계에서 함께 동작합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
