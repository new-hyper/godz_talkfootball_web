import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfig } from "@/lib/supabase/config";

/**
 * 로그아웃.
 *
 * 브라우저에서 signOut() 을 부르면 쿠키가 확실히 지워지지 않는 경우가 있습니다.
 * 토큰이 길어 쿠키가 여러 조각으로 나뉘어 있고, 경로 같은 조건이 하나라도 어긋나면
 * 지운 셈 쳤는데 브라우저에는 남습니다.
 *
 * 그래서 서버에서 지웁니다. 여기는 응답을 직접 만드는 자리라
 * '이 쿠키를 지워라'는 지시를 응답 머리에 확실히 실을 수 있습니다.
 * 서버 컴포넌트가 못 하는 일을 여기서는 할 수 있는 이유와 같습니다.
 *
 * 홈으로 보낼 때 303을 쓰는 이유는, 그냥 넘기면 브라우저가 POST를 한 번 더 보내기 때문입니다.
 * 303은 '주소를 옮기되 이번엔 GET으로 가라'는 뜻입니다.
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  const { url, publishableKey } = supabaseConfig();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.signOut();

  return response;
}
