import { cache } from "react";
import { signingKeys } from "@/lib/auth/jwks";
import { createClient } from "@/lib/supabase/server";

/**
 * 서버에서 "지금 누가 보고 있는가"를 알아낸다.
 *
 * 화면을 그리기 전에 서버가 먼저 알아야 헤더가 처음부터 로그인된 모습으로 나온다.
 * 브라우저에서 물어보면 그 사이에 '로그인' 버튼이 잠깐 보였다가 바뀌어 거슬린다.
 *
 * React 의 cache 로 감싼 이유는, 한 요청 안에서 레이아웃과 페이지가 각각 불러도
 * 일을 한 번만 하게 하려는 것이다.
 */

export type CurrentUser = {
  uid: string;
  nickname: string;
  role: "user" | "admin";
  isAdmin: boolean;
  /** 화면에 띄울 이름. 어드민은 언제나 '협회 사무국' 이다. */
  displayName: string;
};

export const ADMIN_DISPLAY_NAME = "협회 사무국";

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();

  // 쿠키를 그대로 믿지는 않는다. 다만 확인하는 방법을 바꿨다.
  //
  // 전에는 getUser() 로 인증 서버에 "이 토큰 당신이 준 것 맞나" 하고 물어봤다.
  // 확실하지만 한 번에 175ms가 들고, 화면 하나 그리는 데 두 번씩 물어보고 있었다.
  //
  // getClaims() 는 토큰에 찍힌 서명을 공개키로 직접 대조한다. 왕복이 없다.
  // 공개키로는 서명을 만들 수 없으므로 위조는 여전히 통하지 않는다.
  //
  // 대신 취소된 토큰은 걸러내지 못한다. 다른 기기에서 로그아웃했거나 계정이 정지돼도
  // 그 토큰이 만료되기 전까지는 통과한다.
  // 여기서 정하는 것은 '화면에 무엇을 보여줄까' 까지다.
  // 글을 쓰거나 고치는 것은 Supabase 가 매번 따로 검사하므로 그쪽은 영향받지 않는다.
  const { data: claims } = await supabase.auth.getClaims(undefined, {
    keys: await signingKeys(),
  });

  const uid = claims?.claims.sub;
  if (!uid) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("uid, nickname, role")
    .eq("uid", uid)
    .single();

  // 계정은 있는데 프로필이 없는 경우다. 가입 트리거가 함께 도니 정상적으로는 생기지 않는다.
  if (!profile) return null;

  const role = profile.role === "admin" ? "admin" : "user";
  return {
    uid: profile.uid,
    nickname: profile.nickname,
    role,
    isAdmin: role === "admin",
    displayName: role === "admin" ? ADMIN_DISPLAY_NAME : profile.nickname,
  };
});
