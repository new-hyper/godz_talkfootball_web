import Link from "next/link";
import PostRow from "@/components/board/PostRow";
import VoteCard from "@/components/board/VoteCard";
import { getCurrentUser } from "@/lib/auth/session";
import { boardOf } from "@/lib/boards";
import { fmt, formatVoteEndsOn } from "@/lib/format";
import { POSTS_PER_PAGE, listPosts, type Sort } from "@/lib/posts";
import { listVotes } from "@/lib/votes";

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
const sortsFor = (boardId: string, reaction: string) =>
  boardId === "vote"
    ? ([
        ["new", "최신순"],
        ["hot", "참여순"],
      ] as const)
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
  const isVoteBoard = boardId === "vote";
  const [user, posts, votes] = await Promise.all([
    getCurrentUser(),
    isVoteBoard ? Promise.resolve(null) : listPosts({ boardId, sort, page: asked }),
    isVoteBoard ? listVotes({ sort, page: asked }) : Promise.resolve(null),
  ]);

  const total = isVoteBoard ? (votes?.total ?? 0) : (posts?.total ?? 0);
  const page = isVoteBoard ? (votes?.page ?? 1) : (posts?.page ?? 1);
  const empty = isVoteBoard ? (votes?.rows.length ?? 0) === 0 : (posts?.rows.length ?? 0) === 0;

  const canWrite = user ? !board?.staffOnly || user.isAdmin : false;
  const writeHref = isVoteBoard ? "/write/vote" : `/write?board=${boardId}`;
  const writeLabel = isVoteBoard ? "투표 개설" : "글쓰기";
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
          {sortsFor(boardId, board?.reaction ?? "like").map(([key, label]) => (
            <Link key={key} href={hrefWith({ sort: key, page: 1 })} aria-pressed={key === sort}>
              {label}
            </Link>
          ))}
        </div>
        <span className="cnt">총 {fmt(total)}건</span>
      </div>

      {isVoteBoard && user?.isAdmin && (
        <div className="staff-bar">
          <span className="t">
            사무국 계정으로 로그인했습니다
            <span>토론주제에서 채택하거나 직접 개설할 수 있습니다</span>
          </span>
          <Link className="btn mint" href={writeHref}>
            {writeLabel}
          </Link>
        </div>
      )}

      {empty ? (
        <div className="empty">
          <strong>{isVoteBoard ? "아직 개설된 투표가 없습니다" : "아직 글이 없습니다"}</strong>
          <p>
            {isVoteBoard
              ? "협회 사무국이 안건을 개설하면 여기에 표시됩니다."
              : "이 게시판의 첫 글을 남겨 보세요."}
          </p>
          {canWrite && (
            <Link className="btn mint" href={writeHref}>
              {writeLabel}
            </Link>
          )}
        </div>
      ) : (
        <>
          {isVoteBoard
            ? votes?.rows.map((vote) => (
                <VoteCard
                  key={vote.id}
                  vote={vote}
                  endsLabel={formatVoteEndsOn(vote.ends_on)}
                  userUid={user?.uid ?? null}
                />
              ))
            : (
                <div className="card-bd">
                  <ul className="list">
                    {posts?.rows.map((post) => (
                      <PostRow key={post.id} post={post} />
                    ))}
                  </ul>
                </div>
              )}

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
