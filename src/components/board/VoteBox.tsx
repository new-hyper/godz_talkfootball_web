"use client";

import { voteShare, type BallotChoice } from "@/lib/vote-math";
import { VoteLiveCounts, VoteMiniBar, useBallot } from "./VoteButtons";

/**
 * 글 상세의 찬반 상자입니다. 원본 시안 `renderPost` 의 `.box` 를 옮겼습니다.
 *
 * 제목은 이미 위에 있으므로 여기에는 비율·버튼·마감 안내만 둡니다.
 */

export default function VoteBox({
  postId,
  userUid,
  myChoice,
  yesCount,
  noCount,
  closed,
  endsLabel,
}: {
  postId: number;
  userUid: string | null;
  myChoice: BallotChoice | null;
  yesCount: number;
  noCount: number;
  closed: boolean;
  endsLabel: string;
}) {
  const ballot = useBallot({
    postId,
    userUid,
    nextPath: `/post/${postId}`,
    myChoice,
    yesCount,
    noCount,
    closed,
    endsLabel,
  });
  const share = voteShare(ballot.yes, ballot.no);

  return (
    <div className="box">
      <div className="badges">
        <span className="ofc">협회 사무국 개설</span>
        {closed ? (
          <span className="st-closed">투표 마감</span>
        ) : (
          <span className="st-open">투표 진행 중</span>
        )}
      </div>
      <VoteLiveCounts yes={ballot.yes} no={ballot.no} />
      <VoteMiniBar yes={ballot.yes} no={ballot.no} tall />
      {closed ? (
        <p className="deb-done">
          {endsLabel}자로 마감된 투표입니다
          {share.total > 0 ? (
            <>
              {" "}
              · 최종 <b>찬성 {share.yesPct}%</b>
            </>
          ) : null}
        </p>
      ) : (
        <>
          <div className="deb-btns">
            <button
              type="button"
              className="y"
              aria-pressed={ballot.mine === "yes"}
              onClick={() => ballot.press("yes")}
            >
              찬성
            </button>
            <button
              type="button"
              className="n"
              aria-pressed={ballot.mine === "no"}
              onClick={() => ballot.press("no")}
            >
              반대
            </button>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--dim-2)", marginTop: 9, textAlign: "center" }}>
            {endsLabel} 마감 · 투표는 언제든 바꿀 수 있습니다
          </p>
          {ballot.error && <p className="msg bad">{ballot.error}</p>}
        </>
      )}
    </div>
  );
}
