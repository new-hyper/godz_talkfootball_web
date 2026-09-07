"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import { createClient } from "@/lib/supabase/client";

export default function DeleteCommentButton({ commentId }: { commentId: number }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (busy) return;
    setBusy(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("comments")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", commentId);

    if (error) {
      setBusy(false);
      setAsking(false);
      return;
    }

    router.refresh();
  }

  return (
    <>
      <button type="button" onClick={() => setAsking(true)} disabled={busy}>
        삭제
      </button>
      {asking && (
        <ConfirmModal
          title="댓글을 삭제할까요?"
          message="삭제한 댓글은 되돌릴 수 없습니다."
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
