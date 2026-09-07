import Link from "next/link";
import { ago, fmt, isNew } from "@/lib/format";
import { boardOf } from "@/lib/boards";
import { authorLabel, type PostRow as Post } from "@/lib/posts";

/**
 * 목록 한 줄입니다. 원본 시안 자바스크립트의 `rowHtml` 을 옮겼습니다.
 *
 * 원본은 `<button onclick="openPost(3)">` 이었지만 글마다 진짜 주소가 생겼으므로
 * 링크로 바꿉니다. 새 탭으로 열 수 있고 검색엔진도 따라 들어옵니다.
 *
 * 원본에 있던 '조회 128' 과 회원 구분('지도자')은 뺐습니다.
 * 조회 기록을 남기지 않기로 했고, 회원 구분도 쓰지 않기 때문입니다.
 * 회원 구분이 있던 민트색 자리(.real)는 '본인' 칩으로 씁니다.
 */

/** 원본이 게시판마다 칩 색을 다르게 준 규칙입니다. */
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

export default function PostRow({ post }: { post: Post }) {
  const board = boardOf(post.board_id);

  // 토론주제는 추천에서 비추천을 뺀 값이 곧 그 주제가 받은 지지입니다.
  const score =
    board?.reaction === "updown"
      ? `순공감 ${fmt(post.up_count - post.down_count)}`
      : board?.reaction === "like"
        ? `추천 ${fmt(post.like_count)}`
        : null;

  return (
    <li>
      <Link className="row" href={`/post/${post.id}`}>
        <div className="row-top">
          <span className={`chip ${chipClass(post.board_id)}`}>{board?.name ?? post.board_id}</span>
          {isNew(post.created_at) && <span className="badge-new">N</span>}
        </div>

        <div className="row-ttl">{post.title}</div>

        <div className="row-meta">
          <span className="who">{authorLabel(post)}</span>
          {post.is_anonymous && <span className="anon">익명</span>}
          {post.is_mine && <span className="real">본인</span>}
          <span className="dot" />
          <span className="st">{ago(post.created_at)}</span>
          {score && (
            <>
              <span className="dot" />
              <span className="st">{score}</span>
            </>
          )}
        </div>
      </Link>
    </li>
  );
}
