/**
 * 닉네임 변경 주기.
 *
 * 진짜 막는 것은 `0001_users.sql` 트리거의 `interval '30 days'` 다.
 * 화면이 먼저 알려 주려고 같은 숫자를 여기 적는다. 고칠 때 두 곳을 함께 본다.
 */
export const NICKNAME_CHANGE_DAYS = 30;

export function sameNickname(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * 지금 바꿀 수 없으면 다음으로 열리는 시각, 바꿀 수 있으면 null.
 *
 * `nickname_changed_at` 이 비어 있으면 아직 한 번도 안 바꾼 것이다.
 * 가입 때는 이 칸을 안 채우므로, 첫 변경은 바로 되고 그다음부터 30일이 열린다.
 */
export function nicknameChangeOpensAt(changedAt: string | null | undefined): Date | null {
  if (!changedAt) return null;
  const opens = new Date(changedAt);
  opens.setDate(opens.getDate() + NICKNAME_CHANGE_DAYS);
  if (opens.getTime() <= Date.now()) return null;
  return opens;
}
