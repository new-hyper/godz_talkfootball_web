import { createBrowserClient } from "@supabase/ssr";

import { supabaseConfig } from "./config";

/**
 * 브라우저에서 쓰는 클라이언트입니다. 버튼 클릭, 폼 제출처럼 사용자의 동작에 반응하는 곳에서 씁니다.
 *
 * 세션을 `localStorage` 가 아니라 **쿠키**에 담습니다.
 * 쿠키는 요청할 때마다 서버로 함께 전송되므로 서버 컴포넌트도 같은 로그인 상태를 볼 수 있습니다.
 * `localStorage` 는 브라우저 안에만 있어서 서버가 읽지 못합니다.
 *
 * 매번 새로 만드는 것처럼 보이지만 내부적으로 같은 인스턴스를 돌려주므로 그대로 호출하면 됩니다.
 */
export function createClient() {
  const { url, publishableKey } = supabaseConfig();
  return createBrowserClient(url, publishableKey);
}
