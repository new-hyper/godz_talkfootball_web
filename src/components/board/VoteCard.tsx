"use client";

import Link from "next/link";
import { fmt } from "@/lib/format";
import { voteShare } from "@/lib/vote-math";
import type { VoteRow } from "@/lib/vote-types";
import { VoteFoot, VoteMiniBar, useBallot } from "./VoteButtons";

/**
 * 투표 목록 한 장입니다. 원본 시안의 `voteHtml` 을 옮겼습니다.
 *
 * 일반 글 한 줄과 다른 이유: 찬반 막대와 버튼이 목록에 그대로 있어야
 * 글을 열지 않고도 찍을 수 있습니다. 원본이 그렇게 생겼습니다.
 */

export default function VoteCard({
  vote,
  endsLabel,
  userUid,
  nextPath = "/board/vote",
}: {
  vote: VoteRow;
  endsLabel: string;
  userUid: string | null;
  nextPath?: string;
}) {
  const ballot = useBallot({
    postId: vote.id,
    userUid,
    nextPath,
    myChoice: vote.my_choice,
    yesCount: vote.yes_count,
    noCount: vote.no_count,
    closed: vote.is_closed,
    endsLabel,
  });
  const { total, yesPct } = voteShare(ballot.yes, ballot.no);

  return (
    <div className="deb">
      <div className="badges">
        <span className="ofc">협회 사무국 개설</span>
        {vote.is_closed ? (
          <span className="st-closed">투표 마감</span>
        ) : (
          <span className="st-open">투표 진행 중</span>
        )}
      </div>
      <Link className="deb-t" href={`/post/${vote.id}`}>
        {vote.title}
        {vote.comment_count > 0 && <span className="cmt">[{vote.comment_count}]</span>}
      </Link>
      <div className="deb-m">
        <span>{fmt(total)}명 참여</span>
        <span className="dot" />
        <span>
          {endsLabel} {vote.is_closed ? "마감됨" : "마감"}
        </span>
      </div>
      <VoteMiniBar yes={ballot.yes} no={ballot.no} />
      <VoteFoot yes={ballot.yes} no={ballot.no} />
      {vote.is_closed ? (
        <p className="deb-done">
          마감된 투표입니다
          {total > 0 ? (
            <>
              {" "}
              · 최종 <b>찬성 {yesPct}%</b>
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
          {ballot.error && <p className="msg bad">{ballot.error}</p>}
        </>
      )}
    </div>
  );
}
