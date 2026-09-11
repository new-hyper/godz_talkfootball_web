import Link from "next/link";
import { RecRow } from "@/components/board/PostReactions";
import { fmt } from "@/lib/format";
import type { ReactionKind, TopicPreview } from "@/lib/posts";

/**
 * 홈·목록용 토론주제 카드입니다. 원본 시안의 `topicHtml` 을 옮겼습니다.
 *
 * 추천 버튼이 있어서 브라우저에서 돕니다. '몇 분 전'은 서버에서 미리 적어 넘깁니다.
 * 브라우저에서 다시 계산하면 서버 HTML 과 어긋나 React 가 경고합니다.
 */

export default function DiscussionCard({
  topic,
  author,
  when,
  userUid,
  mine,
  nextPath,
}: {
  topic: TopicPreview;
  author: string;
  when: string;
  userUid: string | null;
  mine: ReactionKind | null;
  nextPath: string;
}) {
  const net = topic.net_count;

  return (
    <div className="discussion">
      <div className="badges">
        {net >= 100 ? (
          <span className="st-up">개설 검토 대상</span>
        ) : (
          <span className="st-open">논의 중</span>
        )}
      </div>
      <Link className="discussion-t" href={`/post/${topic.id}`}>
        {topic.title}
      </Link>
      {topic.excerpt ? <p className="discussion-w">{topic.excerpt}</p> : null}
      <div className="discussion-m">
        <span style={{ color: "var(--ink)", fontWeight: 600 }}>{author}</span>
        {topic.is_anonymous && <span className="anon">익명</span>}
        {topic.is_mine && <span className="real">본인</span>}
        <span className="dot" />
        <span>{when}</span>
        <span className="dot" />
        <span>댓글 {fmt(topic.comment_count)}</span>
      </div>
      <RecRow
        postId={topic.id}
        userUid={userUid}
        isMine={topic.is_mine === true}
        mine={mine}
        counts={{ like: topic.like_count, up: topic.up_count, down: topic.down_count }}
        nextPath={nextPath}
      />
    </div>
  );
}
