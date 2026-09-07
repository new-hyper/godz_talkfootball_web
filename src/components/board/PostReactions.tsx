"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fmt } from "@/lib/format";
import type { ReactionKind } from "@/lib/posts";
import { createClient } from "@/lib/supabase/client";

/**
 * 추천·비추천 버튼입니다. 원본 시안의 `toggleLike` 와 `rec` 를 옮겼습니다.
 *
 * 게시판마다 누를 수 있는 것이 다릅니다. 자유게시판 같은 곳은 좋아요 하나,
 * 토론주제는 추천과 비추천 둘입니다. 어느 쪽인지는 `boards.ts` 의 `reaction` 이 정하고,
 * 실제로 막는 것은 DB 의 트리거입니다.
 *
 * 누르면 화면의 숫자를 먼저 바꾸고 요청을 보냅니다.
 * 답이 올 때까지 기다리면 버튼이 굼떠 보이는데, 이건 눌렀는지 아닌지가
 * 곧바로 보여야 하는 종류의 조작입니다. 실패하면 되돌리고 이유를 적습니다.
 */

type Props = {
  postId: number;
  /** 로그인하지 않았으면 null. 누를 때 로그인 화면으로 보냅니다. */
  userUid: string | null;
  /** 자기 글에는 누를 수 없습니다. 눌러 봐야 DB가 거절하므로 아예 못 누르게 둡니다. */
  isMine: boolean;
  mine: ReactionKind | null;
  counts: { like: number; up: number; down: number };
};

/** 눌렀을 때 어떻게 바뀌는지. 같은 것을 또 누르면 취소입니다. */
const nextOf = (mine: ReactionKind | null, clicked: ReactionKind) =>
  mine === clicked ? null : clicked;

function useReaction({ postId, userUid, mine: initialMine, counts: initialCounts }: Props) {
  const router = useRouter();
  const [mine, setMine] = useState(initialMine);
  const [counts, setCounts] = useState(initialCounts);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function press(clicked: ReactionKind) {
    if (busy) return;

    if (!userUid) {
      // 로그인하고 나면 보던 글로 돌아옵니다.
      router.push(`/login?next=/post/${postId}`);
      return;
    }

    const next = nextOf(mine, clicked);
    const before = { mine, counts };

    // 먼저 화면부터 바꿉니다. 누른 것을 취소하면 하나 빼고, 새로 누르면 하나 더합니다.
    // 추천에서 비추천으로 옮기면 한쪽이 줄고 다른 쪽이 늘어납니다.
    setCounts((c) => {
      const n = { ...c };
      if (mine) n[mine] -= 1;
      if (next) n[next] += 1;
      return n;
    });
    setMine(next);
    setError(null);
    setBusy(true);

    const supabase = createClient();
    const { error: failed } = next
      ? await supabase
          .from("post_reactions")
          .upsert({ post_id: postId, user_uid: userUid, kind: next })
      : await supabase.from("post_reactions").delete().eq("post_id", postId);

    setBusy(false);

    if (failed) {
      setMine(before.mine);
      setCounts(before.counts);
      setError("반영하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    // 목록에 보이는 숫자도 같이 맞춰 둡니다.
    router.refresh();
  }

  return { mine, counts, error, press };
}

/** 좋아요 하나만 있는 게시판. 원본의 `.pd-act` 안에 놓입니다. */
export function LikeButton(props: Props) {
  const { mine, counts, error, press } = useReaction(props);

  return (
    <>
      <button
        type="button"
        className="act"
        aria-pressed={mine === "like"}
        onClick={() => press("like")}
        disabled={props.isMine}
        title={props.isMine ? "자기 글에는 누를 수 없습니다" : undefined}
      >
        추천 <span className="n">{fmt(counts.like)}</span>
      </button>
      {error && <span className="msg bad">{error}</span>}
    </>
  );
}

/** 추천·비추천을 받는 토론주제. 원본의 `.box` 를 그대로 씁니다. */
export function UpDownBox(props: Props) {
  const { mine, counts, error, press } = useReaction(props);
  const net = counts.up - counts.down;

  return (
    <div className="box">
      <div className="badges">
        {net >= 100 ? (
          <span className="st-up">개설 검토 대상</span>
        ) : (
          <span className="st-open">논의 중</span>
        )}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--dim)" }}>
        추천이 쌓인 주제를 사무국이 검토해 투표로 개설합니다. 현재 순공감{" "}
        <b
          style={{
            color: net < 0 ? "var(--rose)" : "var(--mint-d)",
            fontFamily: "var(--util)",
          }}
        >
          {net > 0 ? "+" : ""}
          {fmt(net)}
        </b>
      </p>

      <div className="big">
        <button
          type="button"
          className="up"
          aria-pressed={mine === "up"}
          onClick={() => press("up")}
          disabled={props.isMine}
          title={props.isMine ? "자기 주제에는 누를 수 없습니다" : undefined}
        >
          추천 <span className="n">{fmt(counts.up)}</span>
        </button>
        <button
          type="button"
          className="down"
          aria-pressed={mine === "down"}
          onClick={() => press("down")}
          disabled={props.isMine}
          title={props.isMine ? "자기 주제에는 누를 수 없습니다" : undefined}
        >
          비추천 <span className="n">{fmt(counts.down)}</span>
        </button>
      </div>

      {props.isMine && (
        <p style={{ fontSize: 11.5, color: "var(--dim-2)", marginTop: 9, textAlign: "center" }}>
          자기 주제에는 누를 수 없습니다. 순공감으로 투표를 개설하는 구조라 스스로 밀어 올릴 수
          없게 막아 두었습니다.
        </p>
      )}
      {error && <p className="msg bad">{error}</p>}
    </div>
  );
}
