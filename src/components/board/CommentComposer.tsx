"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BODY_MAX = 2000;

/**
 * 댓글·답글 입력칸입니다. 원본 시안의 `.cmt-write` 와 `.re-box` 를 옮겼습니다.
 *
 * 넣은 뒤 id 만 돌려받습니다. 행을 통째로 달라고 하면 `author_uid` 를 읽을 권한이
 * 없다며 거절당합니다. 글쓰기와 같은 사정입니다.
 */
export default function CommentComposer({
  postId,
  parentId = null,
  userUid,
  nickname,
  compact = false,
  onDone,
}: {
  postId: number;
  parentId?: number | null;
  userUid: string | null;
  nickname: string | null;
  compact?: boolean;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = body.trim().length > 0;
  const asLabel = anonymous ? "익명으로 씁니다" : `${nickname}으로 씁니다`;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready || busy || !userUid) return;

    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error: failed } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        parent_id: parentId,
        author_uid: userUid,
        body: body.trim(),
        is_anonymous: anonymous,
      })
      .select("id")
      .single();

    if (failed) {
      setBusy(false);
      setError("댓글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setBody("");
    setAnonymous(false);
    setBusy(false);
    onDone?.();
    router.refresh();
  }

  if (!userUid) {
    return (
      <div className={compact ? "re-box" : "cmt-write"}>
        <p style={{ fontSize: 13.5, color: "var(--dim)", lineHeight: 1.7 }}>
          댓글을 쓰려면{" "}
          <Link href={`/login?next=/post/${postId}`} style={{ color: "var(--mint-d)", fontWeight: 700 }}>
            로그인
          </Link>
          이 필요합니다.
        </p>
      </div>
    );
  }

  return (
    <form className={compact ? "re-box" : "cmt-write"} onSubmit={submit} noValidate>
      {!compact && (
        <div className="cw-top">
          <span className="as">{asLabel}</span>
          <label className="tog">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            <span className="sw" />
            <span className="lb">익명</span>
          </label>
        </div>
      )}

      {error && <p className="form-err">{error}</p>}

      <textarea
        maxLength={BODY_MAX}
        placeholder={compact ? "답글을 남겨 주세요" : "생각을 남겨 주세요. 사람이 아니라 주장에 답해 주세요."}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <div className={compact ? "re-foot" : "cw-foot"}>
        {compact && (
          <label className="tog">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            <span className="sw" />
            <span className="lb">익명</span>
          </label>
        )}
        {compact && (
          <button type="button" className="btn ghost" onClick={onDone} disabled={busy}>
            취소
          </button>
        )}
        <button
          type="submit"
          className="btn mint"
          style={{ marginLeft: "auto" }}
          disabled={busy || !ready}
        >
          {busy ? "등록하는 중…" : compact ? "답글 등록" : "댓글 등록"}
        </button>
      </div>
    </form>
  );
}
