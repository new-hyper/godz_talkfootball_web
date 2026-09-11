import Link from "next/link";
import PostRow from "@/components/board/PostRow";
import { fmt } from "@/lib/format";
import { POSTS_PER_PAGE, searchPosts } from "@/lib/posts";

/**
 * 검색 결과 목록입니다. 게시판 목록의 `BoardPostList` 와 같은 자리입니다.
 *
 * 정렬은 최신순만 둡니다. 게시판마다 인기순의 뜻이 달라서
 * (좋아요 / 순공감 / 투표 참여) 검색 결과를 한 기준으로 줄을 세우면 이상해집니다.
 */

export default async function SearchResults({
  keyword,
  page: asked,
}: {
  keyword: string;
  page: number;
}) {
  const { rows, total, page, q } = await searchPosts({ q: keyword, page: asked });
  const lastPage = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  const hrefWith = (nextPage: number) => {
    const params = new URLSearchParams({ q });
    if (nextPage !== 1) params.set("page", String(nextPage));
    return `/search?${params.toString()}`;
  };

  return (
    <>
      <div className="toolbar">
        <span className="cnt">총 {fmt(total)}건</span>
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <strong>찾는 글이 없습니다</strong>
          <p>다른 단어로 검색해 보세요.</p>
        </div>
      ) : (
        <>
          <div className="card-bd">
            <ul className="list">
              {rows.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </ul>
          </div>

          {lastPage > 1 && (
            <div className="pager">
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={hrefWith(n)} aria-current={n === page}>
                  {n}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}