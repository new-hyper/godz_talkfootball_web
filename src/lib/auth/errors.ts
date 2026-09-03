/**
 * Supabase가 돌려준 오류를 화면에 띄울 한국어 문장으로 바꾼다.
 *
 * 받은 문장을 그대로 띄우면 안 되는 이유가 둘 있다.
 * 하나는 영어라는 것이고, 다른 하나는 오류 본문에 실패한 행의 내용이
 * 통째로 실려 오기 때문이다. 미리 정해 둔 문장으로만 바꿔서 내보낸다.
 *
 * 가입은 auth.users 삽입과 public.users 삽입(가입 트리거)이 한 트랜잭션이라
 * 닉네임이 규칙에 걸리면 가입 자체가 취소된다.
 *
 * 이때 REST로 직접 부르면 제약 이름까지 오지만, supabase-js 를 거치면
 * 'Database error saving new user' 한 줄로 뭉개진다. 확인해 본 결과다.
 * 그래서 아래 BY_CONSTRAINT 는 지금 화면에서는 거의 쓰이지 않는다.
 * 진짜 이유는 SignupForm 이 nickname_available 을 한 번 더 불러 가려낸다.
 */

const FALLBACK = "잠시 후 다시 시도해 주세요.";

/** 제약 이름 → 문장. 0001_users.sql 에서 붙인 이름들이다. */
const BY_CONSTRAINT: Record<string, string> = {
  users_nickname_format:
    "닉네임은 한글·영문·숫자 2~12자여야 합니다. 공백과 특수문자는 쓸 수 없습니다.",
  users_nickname_reserved: "사용할 수 없는 닉네임입니다.",
  users_nickname_lower_key: "이미 사용 중인 닉네임입니다.",
};

/**
 * Supabase Auth가 주는 영어 문장 → 우리 문장.
 * 코드가 없는 경우가 많아 문장 일부로 알아본다.
 */
const BY_MESSAGE: [RegExp, string][] = [
  [/already registered|already been registered/i, "이미 가입된 이메일입니다."],
  [/invalid login credentials/i, "이메일 또는 비밀번호가 올바르지 않습니다."],
  [/email not confirmed/i, "이메일 인증을 먼저 마쳐 주세요."],
  [/token has expired|otp.*expired|expired/i, "인증번호가 만료되었습니다. 다시 받아 주세요."],
  [/invalid.*(token|otp)|otp.*invalid/i, "인증번호가 올바르지 않습니다."],
  [/for security purposes|rate limit|too many requests/i, "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요."],
  [/password.*(should be|at least)/i, "비밀번호는 8자 이상이어야 합니다."],
  // 가입 트리거가 실패했다는 뜻인데 이유가 안 실려 온다.
  // 부르는 쪽에서 이유를 가려내지 못했을 때만 여기까지 온다.
  [/database error saving new user/i, "닉네임을 저장하지 못했습니다. 다른 닉네임으로 시도해 주세요."],
];

type MaybeError = { message?: string; code?: string } | null | undefined;

export function translateAuthError(error: MaybeError): string {
  if (!error) return FALLBACK;
  const message = error.message ?? "";

  for (const [name, text] of Object.entries(BY_CONSTRAINT)) {
    if (message.includes(name)) return text;
  }
  for (const [pattern, text] of BY_MESSAGE) {
    if (pattern.test(message)) return text;
  }
  return FALLBACK;
}
