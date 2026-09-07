import CommentActions from "./CommentActions";
import CommentComposer from "./CommentComposer";
import { ago } from "@/lib/format";
import {
  commentAuthorLabel,
  nestComments,
  type CommentRow,
} from "@/lib/comments";

function CommentBody({
  comment,
  isReply,
  postId,
  userUid,
  nickname,
}: {
  comment: CommentRow;
  isReply: boolean;
  postId: number;
  userUid: string | null;
  nickname: string | null;
}) {
  const name = commentAuthorLabel(comment);

  return (
    <div className={isReply ? "cmt-item re" : "cmt-item"}>
      <span className={comment.is_anonymous ? "av" : "av r"}>{name.slice(0, 1)}</span>
      <div className="cmt-b">
        <div className="cmt-t">
          <span className="nm">{name}</span>
          {comment.is_anonymous && <span className="anon">익명</span>}
          {comment.is_post_author && <span className="real">작성자</span>}
          {comment.is_mine && <span className="real">본인</span>}
          <span className="tm">
            {ago(comment.created_at)}
            {comment.updated_at && " · 수정됨"}
          </span>
        </div>
        <p className="cmt-x" style={{ whiteSpace: "pre-wrap" }}>
          {comment.body}
        </p>
        <CommentActions
          postId={postId}
          commentId={comment.id}
          isReply={isReply}
          isMine={comment.is_mine === true}
          userUid={userUid}
          nickname={nickname}
        />
      </div>
    </div>
  );
}

export default function CommentThread({
  postId,
  comments,
  userUid,
  nickname,
}: {
  postId: number;
  comments: CommentRow[];
  userUid: string | null;
  nickname: string | null;
}) {
  const threads = nestComments(comments);

  return (
    <>
      <div className="cmt-hd">
        <h3>댓글</h3>
        <span className="n">{comments.length}</span>
      </div>

      <div className="cmt-list">
        {threads.length === 0 ? (
          <div className="empty" style={{ padding: "30px 0" }}>
            <strong>첫 댓글을 남겨 보세요</strong>
            <p>비슷한 고민을 하는 사람이 읽고 있습니다.</p>
          </div>
        ) : (
          threads.map(({ parent, replies }) => (
            <div key={parent.id}>
              <CommentBody
                comment={parent}
                isReply={false}
                postId={postId}
                userUid={userUid}
                nickname={nickname}
              />
              {replies.map((reply) => (
                <CommentBody
                  key={reply.id}
                  comment={reply}
                  isReply
                  postId={postId}
                  userUid={userUid}
                  nickname={nickname}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <CommentComposer postId={postId} userUid={userUid} nickname={nickname} />
    </>
  );
}
