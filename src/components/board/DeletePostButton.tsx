"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import { createClient } from "@/lib/supabase/client";

/**
 * 글 삭제입니다.
 *
 * 실제로 지우지 않고 `deleted_at` 에 지운 시각만 적습니다.
 * 진짜로 지우면 거기 달렸던 댓글이 갈 곳을 잃고, 신고를 받아 지운 경우
 * 무엇을 왜 지웠는지 따질 근거도 사라집니다.
 * 목록과 상세는 이 칸이 비어 있는 글만 보여주므로 보이는 결과는 지운 것과 같습니다.
 *
 * 한 번 지우면 되돌릴 수 없습니다. 작성자가 지운 글을 되살리는 것은 트리거가 막습니다.
 * 그래서 누르면 바로 지우지 않고 확인 모달을 먼저 띄웁니다.
 */
export default function DeletePostButton({
  postId,
  boardId,
}: {
  postId: number;
  boardId: string;
}) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (busy) return;

    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error: failed } = await supabase
      .from("posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", postId);

    if (failed) {
      setBusy(false);
      setAsking(false);
      setError("삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    // 지운 글의 주소에 그대로 머무르면 404가 됩니다. 목록으로 보냅니다.
    router.replace(`/board/${boardId}`);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className="act"
        style={{ marginLeft: "auto" }}
        onClick={() => setAsking(true)}
        disabled={busy}
      >
        삭제
      </button>
      {error && <span className="msg bad">{error}</span>}

      {asking && (
        <ConfirmModal
          title="글을 삭제할까요?"
          message="삭제한 글은 되돌릴 수 없습니다."
          confirmLabel={busy ? "삭제하는 중…" : "삭제"}
          busy={busy}
          danger
          onConfirm={remove}
          onCancel={() => setAsking(false)}
        />
      )}
    </>
  );
}
