"use client";

import { useState } from "react";
import CommentComposer from "./CommentComposer";
import DeleteCommentButton from "./DeleteCommentButton";

/**
 * 답글·삭제 버튼입니다. 답글 입력칸을 열어야 해서 브라우저에서 돕니다.
 * 답글에는 답글 버튼을 두지 않습니다. 한 단만 받기로 한 규칙입니다.
 */
export default function CommentActions({
  postId,
  commentId,
  isReply,
  isMine,
  userUid,
  nickname,
}: {
  postId: number;
  commentId: number;
  isReply: boolean;
  isMine: boolean;
  userUid: string | null;
  nickname: string | null;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <>
      <div className="cmt-f">
        {!isReply && (
          <button type="button" onClick={() => setReplying((open) => !open)}>
            답글
          </button>
        )}
        {isMine && <DeleteCommentButton commentId={commentId} />}
      </div>
      {replying && (
        <CommentComposer
          postId={postId}
          parentId={commentId}
          userUid={userUid}
          nickname={nickname}
          compact
          onDone={() => setReplying(false)}
        />
      )}
    </>
  );
}
