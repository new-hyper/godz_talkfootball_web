import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * 서버에서 "지금 누가 보고 있는가"를 알아낸다.
 *
 * 화면을 그리기 전에 서버가 먼저 알아야 헤더가 처음부터 로그인된 모습으로 나온다.
 * 브라우저에서 물어보면 그 사이에 '로그인' 버튼이 잠깐 보였다가 바뀌어 거슬린다.
 *
 * React 의 cache 로 감싼 이유는, 한 요청 안에서 레이아웃과 페이지가 각각 불러도
 * 인증 서버에는 한 번만 물어보게 하려는 것이다.
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

  // getSession() 이 아니라 getUser() 를 쓴다. 쿠키를 그대로 믿지 않고
  // 인증 서버에 물어봐서 토큰이 진짜인지 확인한다.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("uid, nickname, role")
    .eq("uid", user.id)
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
