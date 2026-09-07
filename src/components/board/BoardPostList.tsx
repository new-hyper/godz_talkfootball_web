import Link from "next/link";
import PostRow from "@/components/board/PostRow";
import { getCurrentUser } from "@/lib/auth/session";
import { boardOf } from "@/lib/boards";
import { fmt } from "@/lib/format";
import { POSTS_PER_PAGE, listPosts, type Sort } from "@/lib/posts";

/**
 * 게시판 목록에서 **Supabase를 기다려야 하는 부분**만 떼어 낸 것입니다.
 *
 * 게시판 이름·설명·게시판 칩은 주소만 보면 바로 알 수 있어 기다릴 이유가 없습니다.
 * 그런데 한 덩어리로 두면 글을 다 읽어 올 때까지 그것들까지 못 그립니다.
 * 그래서 기다려야 하는 것만 갈라내고, 나머지는 먼저 보여 줍니다.
 *
 * 화면을 그리는 쪽에서 이 컴포넌트를 `<Suspense>` 로 감싸면
 * 다 읽어 올 때까지 그 자리에만 뼈대를 보여 주고 나머지는 이미 나와 있습니다.
 */

/** 게시판마다 고를 수 있는 정렬. 원본의 `SORTS` 를 줄인 것입니다. */
const sortsFor = (reaction: string) =>
  reaction === "none"
    ? ([["new", "최신순"]] as const)
    : reaction === "updown"
      ? ([
          ["new", "최신순"],
          ["hot", "추천순"],
        ] as const)
      : ([
          ["new", "최신순"],
          ["hot", "인기순"],
        ] as const);

export default async function BoardPostList({
  boardId,
  sort,
  page: asked,
}: {
  boardId: string;
  sort: Sort;
  page: number;
}) {
  const board = boardOf(boardId);

  // 없는 쪽을 달라고 하면 listPosts 가 있는 범위로 끌어당겨 주므로
  // 여기서 받는 page 는 주소에 적힌 값이 아니라 실제로 읽은 쪽입니다.
  const [user, { rows, total, page }] = await Promise.all([
    getCurrentUser(),
    listPosts({ boardId, sort, page: asked }),
  ]);

  const canWrite = user ? !board?.staffOnly || user.isAdmin : false;
  const lastPage = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  /** 정렬이나 쪽만 바꾼 주소를 만듭니다. 기본값은 붙이지 않아 주소를 짧게 둡니다. */
  const hrefWith = (next: { sort?: string; page?: number }) => {
    const q = new URLSearchParams();
    const s = next.sort ?? sort;
    const p = next.page ?? page;
    if (s !== "new") q.set("sort", s);
    if (p !== 1) q.set("page", String(p));
    const query = q.toString();
    return `/board/${boardId}${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <div className="toolbar">
        <div className="sorts">
          {sortsFor(board?.reaction ?? "like").map(([key, label]) => (
            <Link key={key} href={hrefWith({ sort: key, page: 1 })} aria-pressed={key === sort}>
              {label}
            </Link>
          ))}
        </div>
        <span className="cnt">총 {fmt(total)}건</span>
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <strong>아직 글이 없습니다</strong>
          <p>이 게시판의 첫 글을 남겨 보세요.</p>
          {canWrite && (
            <Link className="btn mint" href={`/write?board=${boardId}`}>
              글쓰기
            </Link>
          )}
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
                <Link key={n} href={hrefWith({ page: n })} aria-current={n === page}>
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
