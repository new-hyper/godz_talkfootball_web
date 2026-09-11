/**
 * 화면에 숫자와 시각을 적을 때 쓰는 도우미입니다.
 * 원본 시안 자바스크립트의 `fmt` 와 `ago` 를 옮겼습니다.
 */

/** 1234 → "1,234" */
export const fmt = (n: number) => Number(n).toLocaleString("ko-KR");

/**
 * 저장된 시각을 "2시간 전" 처럼 바꿉니다.
 *
 * 원본은 목업 데이터가 "몇 분 전"이라는 숫자를 직접 들고 있었지만,
 * 여기서는 DB에 실제 시각이 들어 있으므로 지금과의 차이를 직접 계산합니다.
 *
 * 이 함수는 서버에서만 부릅니다. 브라우저에서도 부르면 두 곳의 시계가 미세하게 달라
 * 서버가 만든 "3분 전"과 브라우저가 다시 계산한 "4분 전"이 어긋날 수 있습니다.
 * React 는 그런 어긋남을 오류로 봅니다.
 */
export function ago(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);

  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  if (min < 1440) return `${Math.floor(min / 60)}시간 전`;

  const day = Math.floor(min / 1440);
  if (day < 7) return `${day}일 전`;
  if (day < 30) return `${Math.floor(day / 7)}주 전`;
  return `${Math.floor(day / 30)}개월 전`;
}

/**
 * 쓴 지 하루가 안 된 글에는 빨간 N 을 붙입니다.
 *
 * 원본 시안은 2시간이었습니다. 글이 쏟아지는 곳이라면 맞는 값이지만
 * 여기는 하루에 몇 건 정도일 것이라, 2시간으로 두면 아침에 들어왔을 때
 * N 이 하나도 없어서 새 글이 없는 것처럼 보입니다.
 *
 * 하루로 잡으면 "어제 이후에 올라온 글"이라는 뜻이 되어
 * 하루에 한 번 들르는 사람에게 맞습니다.
 */
const NEW_FOR_HOURS = 24;

export const isNew = (iso: string) =>
  Date.now() - new Date(iso).getTime() < NEW_FOR_HOURS * 60 * 60 * 1000;

/**
 * 투표 마감일 `YYYY-MM-DD` 를 "3월 12일" 로 바꿉니다.
 *
 * `new Date("2026-03-12")` 는 UTC 자정으로 읽혀서, 한국보다 느린 지역에서는
 * 하루 전으로 보일 수 있습니다. 날짜 글자만 잘라 씁니다.
 */
export function formatVoteEndsOn(ymd: string): string {
  const [, month, day] = ymd.split("-").map(Number);
  if (!month || !day) return ymd;
  return `${month}월 ${day}일`;
}
