/**
 * 로그인이 끝난 뒤 돌아갈 자리(`?next=`)를 안전한 값만 통과시킵니다.
 *
 * 이 값을 그대로 믿으면 안 됩니다. 주소는 누구나 만들어서 남에게 보낼 수 있는데,
 * `/login?next=https://가짜사이트` 같은 링크를 받은 사람이 우리 사이트에서
 * 제대로 로그인한 뒤 감쪽같이 가짜 사이트로 넘어가게 됩니다.
 * 우리 주소에서 출발했으니 의심하지 않게 되는 것이 이 수법의 핵심입니다.
 *
 * 그래서 슬래시 하나로 시작하는 우리 사이트 안의 길만 받습니다.
 * `//다른곳.com` 은 슬래시로 시작하지만 브라우저가 바깥 주소로 읽으므로 함께 막습니다.
 */
export function safeNextPath(value: string | string[] | undefined): string {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path) return "/";
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}
