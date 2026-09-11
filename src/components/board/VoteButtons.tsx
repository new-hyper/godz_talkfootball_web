"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fmt } from "@/lib/format";
import { voteShare, type BallotChoice } from "@/lib/vote-math";
import { createClient } from "@/lib/supabase/client";

/**
 * 찬성·반대 버튼입니다. 원본 시안의 `cast()` 를 옮겼습니다.
 *
 * 추천 버튼과 같습니다. 화면 숫자를 먼저 바꾸고, 실패하면 되돌립니다.
 * 같은 쪽을 다시 누르면 취소, 다른 쪽을 누르면 옮깁니다.
 */

export type VoteButtonProps = {
  postId: number;
  userUid: string | null;
  nextPath: string;
  myChoice: BallotChoice | null;
  yesCount: number;
  noCount: number;
  closed: boolean;
  endsLabel: string;
};

const nextOf = (mine: BallotChoice | null, clicked: BallotChoice) =>
  mine === clicked ? null : clicked;

function translateBallotError(message: string): string {
  if (message.includes("마감된 투표")) return "마감된 투표입니다.";
  if (message.includes("없는 투표")) return "없는 투표입니다.";
  if (message.includes("본인 이름")) return "본인 이름으로만 투표할 수 있습니다.";
  if (/schema cache|could not find the table/i.test(message)) {
    return "투표 표를 API가 아직 모릅니다. 대시보드에서 스키마를 새로고침해 주세요.";
  }
  if (/permission denied|42501/i.test(message)) {
    return "투표 권한이 없습니다. 잠시 후 다시 시도해 주세요.";
  }
  return "반영하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export function useBallot({
  postId,
  userUid,
  nextPath,
  myChoice: initialChoice,
  yesCount,
  noCount,
}: VoteButtonProps) {
  const router = useRouter();
  const [mine, setMine] = useState(initialChoice);
  const [yes, setYes] = useState(yesCount);
  const [no, setNo] = useState(noCount);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function press(clicked: BallotChoice) {
    if (busy) return;

    if (!userUid) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    const next = nextOf(mine, clicked);
    const before = { mine, yes, no };

    setYes((n) => n + (mine === "yes" ? -1 : 0) + (next === "yes" ? 1 : 0));
    setNo((n) => n + (mine === "no" ? -1 : 0) + (next === "no" ? 1 : 0));
    setMine(next);
    setError(null);
    setBusy(true);

    const supabase = createClient();

    // upsert 를 쓰지 않습니다.
    // Postgres 의 `INSERT ON CONFLICT DO UPDATE` 는 충돌이 없어도
    // SET 에 오른 칸의 UPDATE 권한이 필요합니다. 우리는 표의 칸 권한을
    // choice 만 고치게 해 두었으므로 post_id 를 함께 보내면 거절됩니다.
    // 추천 버튼이 upsert 로 되는 이유는 post_reactions 는 칸을 나누지 않았기 때문입니다.
    let failed: { message?: string } | null = null;
    if (!next) {
      ({ error: failed } = await supabase
        .from("vote_ballots")
        .delete()
        .eq("post_id", postId)
        .eq("voter_uid", userUid));
    } else if (!mine) {
      ({ error: failed } = await supabase.from("vote_ballots").insert({
        post_id: postId,
        voter_uid: userUid,
        choice: next,
      }));
    } else {
      ({ error: failed } = await supabase
        .from("vote_ballots")
        .update({ choice: next })
        .eq("post_id", postId)
        .eq("voter_uid", userUid));
    }

    setBusy(false);

    if (failed) {
      setMine(before.mine);
      setYes(before.yes);
      setNo(before.no);
      setError(translateBallotError(failed.message ?? ""));
      return;
    }

    router.refresh();
  }

  return { mine, yes, no, error, press };
}

export function VoteMiniBar({ yes, no, tall = false }: { yes: number; no: number; tall?: boolean }) {
  const { total, yesPct } = voteShare(yes, no);
  return (
    <div
      className="mini-bar"
      style={{
        ...(tall ? { height: 11 } : undefined),
        background: total === 0 ? "var(--line)" : "var(--rose)",
      }}
    >
      <i style={{ width: total ? `${yesPct}%` : "0%" }} />
    </div>
  );
}

export function VoteFoot({ yes, no }: { yes: number; no: number }) {
  const { yesPct, noPct } = voteShare(yes, no);
  return (
    <div className="mini-f">
      <span className="y">찬성 {yesPct}%</span>
      <span className="n">반대 {noPct}%</span>
    </div>
  );
}

export function VoteLiveCounts({ yes, no }: { yes: number; no: number }) {
  const { total, yesPct, noPct } = voteShare(yes, no);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--mint-d)" }}>
        찬성 {total ? `${yesPct}% · ` : ""}
        {fmt(yes)}표
      </span>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--rose)" }}>
        반대 {total ? `${noPct}% · ` : ""}
        {fmt(no)}표
      </span>
    </div>
  );
}
