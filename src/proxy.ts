import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { supabaseConfig } from "./lib/supabase/config";

/**
 * 요청이 들어올 때마다 로그인 세션을 갱신합니다.
 *
 * Next.js 16에서 `middleware.ts` 가 `proxy.ts` 로 이름이 바뀌었습니다.
 * 하는 일은 같고 파일명과 내보내는 함수 이름만 달라졌습니다.
 *
 * 왜 필요한가 하면, 로그인 토큰은 수명이 짧아서 주기적으로 새로 받아야 합니다.
 * 그런데 서버 컴포넌트는 쿠키를 쓸 수 없어서 갱신된 토큰을 저장할 방법이 없습니다.
 * 여기는 응답을 만들기 전 단계라 쿠키를 쓸 수 있으므로, 갱신을 여기서 맡습니다.
 * 이게 없으면 로그인이 제멋대로 풀리는 현상이 생깁니다.
 *
 * 주의할 점은 여기서 **권한 검사를 하지 않는다**는 것입니다.
 * Next.js 문서도 proxy를 인가 수단으로 쓰지 말라고 못박고 있습니다.
 * 로그인 여부는 실제로 데이터를 읽는 곳(서버 컴포넌트·RLS)에서 확인합니다.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, publishableKey } = supabaseConfig();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // 갱신된 토큰을 요청과 응답 양쪽에 반영합니다.
        // 요청 쪽에도 넣어야 이번 요청을 처리하는 서버 컴포넌트가 새 토큰을 봅니다.
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // 이 호출이 토큰 갱신을 일으킵니다. 결과를 쓰지 않아도 반드시 불러야 합니다.
  // getSession() 이 아니라 getUser() 를 쓰는 이유는, getUser() 가 서버에 물어봐
  // 토큰이 진짜인지 확인하기 때문입니다. getSession() 은 쿠키를 그대로 믿습니다.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * 정적 파일에는 세션 갱신이 필요 없어서 제외합니다.
     * 이미지 하나 받을 때마다 인증 서버에 물어보면 느려지기만 합니다.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
