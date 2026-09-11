import type { ReactNode } from "react";
import Link from "next/link";
import { fmt } from "@/lib/format";
import { voteShare } from "@/lib/vote-math";
import type { VoteDetail } from "@/lib/vote-types";

/**
 * 홈 맨 위 남색 칸입니다. 원본 시안의 `.hero` 와 `paintHero` 를 옮겼습니다.
 *
 * 여기서는 안건을 보여 주기만 합니다. 찬반을 누르면 바로 표가 나가지 않고
 * 상세(`/post/[id]`)로 갑니다. 실제 투표는 그 화면의 VoteBox 에서만 합니다.
 *
 * 오른쪽 피드 목록은 서버가 이미 그려서 children 으로 넣습니다.
 * '몇 분 전'을 여기서 다시 계산하지 않으려고 그렇습니다.
 */

export default function HomeHero({
  vote,
  excerpt,
  endsLabel,
  children,
}: {
  vote: VoteDetail | null;
  excerpt: string;
  endsLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="hero">
      <div className="hero-in">
        <div className="eyebrow">
          <span className="live" /> TODAY'S VOTE · 진행 중인 안건
        </div>
        {vote ? (
          <HeroVote vote={vote} excerpt={excerpt} endsLabel={endsLabel} />
        ) : (
          <>
            <h2>진행 중인 안건이 없습니다</h2>
            <p className="sub">협회 사무국이 투표를 개설하면 여기에 표시됩니다.</p>
          </>
        )}
      </div>
      <div className="hero-side">
        <div className="eyebrow" style={{ color: "var(--mint)" }}>
          LIVE FEED · 방금 올라온 글
        </div>
        {children}
      </div>
    </div>
  );
}

function HeroVote({
  vote,
  excerpt,
  endsLabel,
}: {
  vote: VoteDetail;
  excerpt: string;
  endsLabel: string;
}) {
  const { total, yesPct, noPct } = voteShare(vote.yes_count, vote.no_count);

  return (
    <Link href={`/post/${vote.id}`} style={{ display: "block" }}>
      <h2>{vote.title}</h2>
      {excerpt ? <p className="sub">{excerpt}</p> : null}
      <div className="gauge">
        <div className="gauge-top">
          <div className="g-side yes">
            <span className="lb">찬성</span>
            <span className="pc num">{yesPct}%</span>
          </div>
          <div className="g-side no">
            <span className="lb">반대</span>
            <span className="pc num">{noPct}%</span>
          </div>
        </div>
        <div
          className="bar"
          style={total === 0 ? { background: "rgba(255,255,255,.16)" } : undefined}
        >
          <i style={{ width: total ? `${yesPct}%` : "0%" }} />
        </div>
        <div className="gauge-foot">
          <span>참여 {fmt(total)}명</span>
          <span>투표 마감 {endsLabel}</span>
        </div>
      </div>
      <div className="vote-row">
        <span className="vote" style={voteLook}>
          찬성합니다
        </span>
        <span className="vote" style={voteLook}>
          반대합니다
        </span>
      </div>
      <span className="hero-link">
        이 안건 의견 <span className="num">{fmt(vote.comment_count)}</span>개 읽기
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="m9 5 7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

/** `.vote` 는 원래 버튼용이라, 링크로 쓸 때 글자를 가운데 맞춥니다. */
const voteLook = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;
