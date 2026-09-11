/** 찬반 계산. 서버·브라우저 둘 다 씁니다. 서버 클라이언트를 끌어오면 안 됩니다. */

export type BallotChoice = "yes" | "no";

export function voteShare(yes: number, no: number) {
  const total = yes + no;
  const yesPct = total ? Math.round((yes / total) * 100) : 0;
  return { total, yesPct, noPct: total ? 100 - yesPct : 0 };
}
