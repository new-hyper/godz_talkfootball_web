/**
 * 가입 화면에서 미리 검사하는 규칙.
 *
 * 여기서 막는 것은 사용자를 덜 기다리게 하려는 것뿐이고,
 * 실제로 막는 것은 supabase/migrations/0001_users.sql 의 제약과 유니크 인덱스다.
 * 그래서 정규식이 그쪽과 한 글자도 다르면 안 된다.
 * 규칙을 고칠 일이 생기면 두 곳을 함께 고친다.
 */

/** users_nickname_format */
const NICKNAME_FORMAT = /^[가-힣a-zA-Z0-9]{2,12}$/;

/** users_nickname_reserved */
const NICKNAME_ANONYMOUS = /^익명의/;
const NICKNAME_RESERVED = /(협회|사무국|운영|관리자|admin)/i;

export const PASSWORD_MIN_LENGTH = 8;

/** 인증번호 재발송 쿨다운(초). Supabase 기본값과 맞춰 둔다. */
export const RESEND_COOLDOWN_SECONDS = 60;

/** 인증번호를 이만큼 틀리면 그 번호를 버리고 새로 보낸다. */
export const MAX_OTP_ATTEMPTS = 5;

/** 문제가 없으면 null, 있으면 화면에 그대로 띄울 문장을 준다. */
export type Invalid = string | null;

export function validateEmail(value: string): Invalid {
  if (!value) return "이메일을 입력해 주세요.";
  // 이메일 형식은 규칙이 워낙 복잡해서 여기서는 눈에 띄는 오타만 거른다.
  // 진짜 확인은 그 주소로 메일이 도착하는지 여부다.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "이메일 형식이 올바르지 않습니다.";
  }
  return null;
}

export function validatePassword(value: string): Invalid {
  if (!value) return "비밀번호를 입력해 주세요.";
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`;
  }
  return null;
}

export function validatePasswordConfirm(value: string, password: string): Invalid {
  if (!value) return "비밀번호를 한 번 더 입력해 주세요.";
  if (value !== password) return "비밀번호가 일치하지 않습니다.";
  return null;
}

export function validateNickname(value: string): Invalid {
  if (!value) return "닉네임을 입력해 주세요.";
  if (!NICKNAME_FORMAT.test(value)) {
    return "닉네임은 한글·영문·숫자 2~12자여야 합니다. 공백과 특수문자는 쓸 수 없습니다.";
  }
  if (NICKNAME_ANONYMOUS.test(value) || NICKNAME_RESERVED.test(value)) {
    return "사용할 수 없는 닉네임입니다.";
  }
  return null;
}

export function validateOtp(value: string): Invalid {
  if (!value) return "인증번호를 입력해 주세요.";
  if (!/^\d{6}$/.test(value)) return "인증번호 6자리를 입력해 주세요.";
  return null;
}
