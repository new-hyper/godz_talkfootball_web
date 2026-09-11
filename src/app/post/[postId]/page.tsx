import Link from "next/link";
import { notFound } from "next/navigation";
import DeletePostButton from "@/components/board/DeletePostButton";
import { LikeButton, UpDownBox } from "@/components/board/PostReactions";
import { ADMIN_DISPLAY_NAME, getCurrentUser } from "@/lib/auth/session";
import { boardOf } from "@/lib/boards";
import { ago, formatVoteEndsOn } from "@/lib/format";
import CommentThread from "@/components/board/CommentThread";
import { listComments } from "@/lib/comments";
import { authorLabel, getMyReaction, getPost } from "@/lib/posts";
import { getVote } from "@/lib/votes";
import VoteBox from "@/components/board/VoteBox";

/**
 * 글 상세입니다. 원본 시안의 `v-post` 뷰에 해당합니다.
 *
 * 원본은 목록에서 `openPost(3)` 을 불러 같은 화면을 갈아 끼웠습니다.
 * 여기서는 글마다 `/post/3` 이라는 주소를 갖습니다. 링크를 건네면 그 글이 열리고,
 * 검색엔진도 글 하나하나를 따로 수집합니다. 이 프로젝트에서 원본의 `go()` 를 버린 이유입니다.
 */

const chipClass = (boardId: string) =>
  boardId === "notice"
    ? "notice"
    : boardId === "vote"
      ? "vote"
      : boardId === "discussion"
        ? "discussion"
        : boardId === "qna"
          ? "q"
          : "b";

export async function generateMetadata(props: PageProps<"/post/[postId]">) {
  const { postId } = await props.params;
  const post = await getPost(postId);
  if (!post) return {};

  return {
    title: `${post.title} — 고다지 커뮤니티`,
    // 본문 앞부분을 검색 결과에 보이는 소개글로 씁니다. 줄바꿈은 공백으로 폅니다.
    description: post.body.replace(/\s+/g, " ").slice(0, 120),
  };
}

export default async function PostPage(props: PageProps<"/post/[postId]">) {
  const { postId } = await props.params;
  const post = await getPost(postId);
  if (!post) notFound();

  const board = boardOf(post.board_id);
  const isVote = post.board_id === "vote";
  const author = isVote ? ADMIN_DISPLAY_NAME : authorLabel(post);

  const [user, myReaction, comments, vote] = await Promise.all([
    getCurrentUser(),
    board?.reaction === "none" ? Promise.resolve(null) : getMyReaction(post.id),
    listComments(post.id),
    isVote ? getVote(post.id) : Promise.resolve(null),
  ]);

  const reactionProps = {
    postId: post.id,
    userUid: user?.uid ?? null,
    isMine: post.is_mine === true,
    mine: myReaction,
    counts: { like: post.like_count, up: post.up_count, down: post.down_count },
  };

  // 사무국은 신고받은 글을 지울 수 있어야 합니다.
  const canDelete = post.is_mine === true || user?.isAdmin === true;

  // 본문은 그냥 글자 뭉치라 그대로 넣으면 줄바꿈이 사라집니다.
  // 빈 줄을 기준으로 잘라 문단으로 만듭니다. `.pd-bd p` 가 문단 사이 여백을 줍니다.
  const paragraphs = post.body.split(/\n\s*\n/).flatMap((chunk) => {
    const text = chunk.trim();
    return text ? [text] : [];
  });

  return (
    <section className="view on">
      <Link className="back" href={`/board/${post.board_id}`}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="m15 5-7 7 7 7" />
        </svg>
        <span>{board?.name ?? "목록"}</span>
      </Link>

      <div className="cols">
        <div>
          <article className="card">
            <div className="pd-hd">
              <span className={`chip ${chipClass(post.board_id)}`}>
                {board?.name ?? post.board_id}
              </span>
              <h1>{post.title}</h1>
              <div className="pd-who">
                <span className={post.is_anonymous ? "av a" : "av"}>{author.slice(0, 1)}</span>
                <span>
                  <span className="nm">
                    {author}
                    {post.is_anonymous && <span className="anon">익명</span>}
                    {!isVote && post.is_mine && <span className="real">본인</span>}
                  </span>
                  <span className="mt">
                    {ago(post.created_at)}
                    {post.updated_at && " · 수정됨"}
                  </span>
                </span>
              </div>
            </div>

            <div className="pd-bd">
              {paragraphs.map((text, i) => (
                <p key={i} style={{ whiteSpace: "pre-wrap" }}>
                  {text}
                </p>
              ))}
              {vote && (
                <VoteBox
                  postId={vote.id}
                  userUid={user?.uid ?? null}
                  myChoice={vote.my_choice}
                  yesCount={vote.yes_count}
                  noCount={vote.no_count}
                  closed={vote.is_closed}
                  endsLabel={formatVoteEndsOn(vote.ends_on)}
                />
              )}
              {board?.reaction === "updown" && <UpDownBox {...reactionProps} />}
            </div>

            {(board?.reaction === "like" || canDelete) && (
              <div className="pd-act">
                {board?.reaction === "like" && <LikeButton {...reactionProps} />}
                {canDelete && <DeletePostButton postId={post.id} boardId={post.board_id} />}
              </div>
            )}

            <CommentThread
              postId={post.id}
              comments={comments}
              userUid={user?.uid ?? null}
              nickname={user?.nickname ?? null}
            />
          </article>
        </div>

        <aside className="side">
          <div className="card">
            <div className="card-hd">
              <span className="spine" />
              <h3>{board?.name}</h3>
            </div>
            <div className="card-bd pad">
              <div className="notice-box">{board?.desc}</div>
              <Link
                className="btn ghost"
                href={`/board/${post.board_id}`}
                style={{ width: "100%", marginTop: 12 }}
              >
                목록으로
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
