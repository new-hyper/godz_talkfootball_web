import type { JWK } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase/config";

/**
 * 토큰 서명을 대조할 공개키를 들고 있는 곳입니다.
 *
 * 로그인 여부를 확인하는 방법이 둘 있습니다.
 * 인증 서버에 전화해서 물어보거나(`getUser`), 토큰에 찍힌 서명을 직접 대조하거나(`getClaims`)입니다.
 * 앞의 것은 175ms가 들고 뒤의 것은 공짜인데, 대조하려면 공개키가 있어야 합니다.
 *
 * supabase-js 도 공개키를 받아 두긴 합니다. 다만 그 창고가 **클라이언트 안**에 있습니다.
 * 우리는 요청마다 클라이언트를 새로 만들기 때문에 창고도 매번 비어 있는 채로 시작합니다.
 * 그래서 결국 매 요청 공개키를 다시 받아 오고, 아낀 것이 없어집니다.
 *
 * 그래서 여기 모듈 바깥에 둡니다. 이 변수는 서버 프로세스가 살아 있는 동안 유지되므로
 * 처음 한 번만 받아 오고 그다음 요청부터는 그냥 꺼내 씁니다.
 *
 * 공개키로는 서명을 만들 수 없습니다. 남이 봐도 위조에 쓸 수 없어서 공개해 두는 것입니다.
 */

let cached: JWK[] | null = null;
let cachedAt = 0;

/**
 * 열쇠는 가끔 갈아 끼웁니다. 낡은 것을 붙들고 있으면 새 토큰을 못 알아보므로
 * 10분마다 다시 받아 옵니다.
 *
 * 갈아 끼운 직후라 우리가 든 것에 새 열쇠가 없으면, supabase-js 가 알아서
 * 서버에서 받아 옵니다. 그 요청 하나만 느려지고 저절로 회복됩니다.
 */
const TTL_MS = 10 * 60 * 1000;

/** 여러 요청이 동시에 처음 들어와도 받아 오는 일은 한 번만 하게 묶어 둡니다. */
let inflight: Promise<JWK[]> | null = null;

export async function signingKeys(): Promise<JWK[]> {
  if (cached && Date.now() - cachedAt < TTL_MS) return cached;
  if (inflight) return inflight;

  const { url } = supabaseConfig();

  inflight = (async () => {
    try {
      const res = await fetch(`${url}/auth/v1/.well-known/jwks.json`);
      if (!res.ok) throw new Error(String(res.status));

      const body = (await res.json()) as { keys?: JWK[] };
      cached = body.keys ?? [];
      cachedAt = Date.now();
      return cached;
    } catch {
      // 못 받아 왔다고 로그인을 풀어 버리면 안 됩니다.
      // 빈 배열을 주면 supabase-js 가 스스로 받아 오거나 인증 서버에 물어봅니다.
      // 느려질 뿐 동작은 합니다.
      return [];
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
