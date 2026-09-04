"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OtpStep from "./OtpStep";
import { translateAuthError } from "@/lib/auth/errors";
import {
  validateEmail,
  validateNickname,
  validatePassword,
  validatePasswordConfirm,
} from "@/lib/auth/rules";
import { createClient } from "@/lib/supabase/client";

/** 동의받은 약관의 판. 약관을 고치면 이 값을 올리고 재동의를 받는다. */
const TERMS_VERSION = "v1";

type NicknameCheck = "idle" | "checking" | "ok" | "taken";

type Supabase = ReturnType<typeof createClient>;

/**
 * 가입이 실패했을 때 이유를 알아낸다.
 *
 * supabase-js 는 가입 트리거가 실패한 이유를 알려주지 않고
 * 'Database error saving new user' 한 줄만 준다.
 * 닉네임이 걸린 것인지 확인하려면 다시 물어보는 수밖에 없다.
 */
async function explainSignupFailure(
  supabase: Supabase,
  error: { message?: string },
  nickname: string,
): Promise<string> {
  if (!/database error saving new user/i.test(error.message ?? "")) {
    return translateAuthError(error);
  }

  const local = validateNickname(nickname);
  if (local) return local;

  const { data, error: rpcError } = await supabase.rpc("nickname_available", {
    candidate: nickname,
  });
  if (rpcError) return translateAuthError(error);
  if (data === false) return "이미 사용 중인 닉네임입니다.";

  // 닉네임에는 문제가 없다. 원인을 모르므로 짐작해서 말하지 않는다.
  return translateAuthError(error);
}

export default function SignupForm() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);

  const [nicknameCheck, setNicknameCheck] = useState<NicknameCheck>("idle");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function setError(field: string, message: string | null) {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }

  // 하나라도 어긋나면 '인증번호 받기'를 누를 수 없다.
  // 닉네임은 형식만 맞아서는 안 되고 중복 확인까지 끝나 있어야 한다.
  const readyToSubmit =
    !validateEmail(email) &&
    !validatePassword(password) &&
    !validatePasswordConfirm(passwordConfirm, password) &&
    !validateNickname(nickname) &&
    nicknameCheck === "ok" &&
    agreeTerms &&
    agreeAge;

  async function checkNickname() {
    const invalid = validateNickname(nickname);
    setError("nickname", invalid);
    if (invalid) {
      setNicknameCheck("idle");
      return;
    }

    setNicknameCheck("checking");
    const supabase = createClient();
    const { data, error } = await supabase.rpc("nickname_available", {
      candidate: nickname,
    });

    if (error) {
      setNicknameCheck("idle");
      setError("nickname", translateAuthError(error));
      return;
    }
    setNicknameCheck(data ? "ok" : "taken");
  }

  async function submitStep1(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const next: Record<string, string | null> = {
      email: validateEmail(email),
      password: validatePassword(password),
      passwordConfirm: validatePasswordConfirm(passwordConfirm, password),
      nickname: validateNickname(nickname),
    };
    if (!next.nickname && nicknameCheck !== "ok") {
      next.nickname = "닉네임 중복 확인을 해주세요.";
    }
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    if (!agreeTerms || !agreeAge) {
      setFormError("필수 항목에 모두 동의해 주세요.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
          terms_version: TERMS_VERSION,
          age_confirmed: true,
        },
      },
    });
    setBusy(false);

    if (error) {
      setFormError(await explainSignupFailure(supabase, error, nickname));
      setNicknameCheck("idle");
      return;
    }

    // 이미 가입된 주소면 Supabase가 가입한 척하되 identities 를 비워서 돌려준다.
    // 아무나 이메일을 넣어보며 가입 여부를 캐내지 못하게 하려는 것이다.
    if (data.user && data.user.identities?.length === 0) {
      setFormError("이미 가입된 이메일입니다.");
      return;
    }

    setStep(2);
  }

  if (step === 2) {
    return (
      <OtpStep
        email={email}
        onVerified={() => {
          // 인증과 동시에 세션이 나오므로 곧바로 홈으로 보낸다.
          // refresh 를 불러야 서버 컴포넌트가 새 세션으로 다시 그려진다.
          router.replace("/");
          router.refresh();
        }}
      />
    );
  }

  return (
    <form onSubmit={submitStep1} noValidate>
      {formError && <p className="form-err">{formError}</p>}

      <div className="field">
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={errors.email ? "bad" : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setError("email", validateEmail(email))}
        />
        {errors.email && <span className="msg bad">{errors.email}</span>}
      </div>

      <div className="field">
        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className={errors.password ? "bad" : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setError("password", validatePassword(password))}
        />
        <span className={`msg${errors.password ? " bad" : ""}`}>
          {errors.password ?? "8자 이상"}
        </span>
      </div>

      <div className="field">
        <label htmlFor="passwordConfirm">비밀번호 확인</label>
        <input
          id="passwordConfirm"
          type="password"
          autoComplete="new-password"
          className={errors.passwordConfirm ? "bad" : undefined}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          onBlur={() =>
            setError("passwordConfirm", validatePasswordConfirm(passwordConfirm, password))
          }
        />
        {errors.passwordConfirm && <span className="msg bad">{errors.passwordConfirm}</span>}
      </div>

      <div className="field">
        <label htmlFor="nickname">닉네임</label>
        <div className="with-btn">
          <input
            id="nickname"
            autoComplete="off"
            maxLength={12}
            className={errors.nickname ? "bad" : undefined}
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setNicknameCheck("idle");
            }}
          />
          <button
            type="button"
            className="btn ghost"
            onClick={checkNickname}
            disabled={nicknameCheck === "checking"}
          >
            중복 확인
          </button>
        </div>
        {errors.nickname ? (
          <span className="msg bad">{errors.nickname}</span>
        ) : nicknameCheck === "ok" ? (
          <span className="msg ok">사용할 수 있는 닉네임입니다.</span>
        ) : nicknameCheck === "taken" ? (
          <span className="msg bad">이미 사용 중인 닉네임입니다.</span>
        ) : nickname && !validateNickname(nickname) ? (
          <span className="msg">중복 확인을 눌러 주세요.</span>
        ) : (
          <span className="msg">한글·영문·숫자 2~12자. 30일 뒤 변경 가능합니다.</span>
        )}
      </div>

      <div style={{ margin: "18px 0 20px" }}>
        <label className="check">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          <span>
            <Link href="/page/terms">이용약관</Link> 및{" "}
            <Link href="/page/privacy">개인정보처리방침</Link>에 동의합니다. (필수)
          </span>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={agreeAge}
            onChange={(e) => setAgreeAge(e.target.checked)}
          />
          <span>만 14세 이상입니다. (필수)</span>
        </label>
      </div>

      <button
        type="submit"
        className="btn pri"
        style={{ width: "100%" }}
        disabled={busy || !readyToSubmit}
      >
        {busy ? "가입하는 중…" : "인증번호 받기"}
      </button>

      <p style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--dim)" }}>
        이미 계정이 있으신가요? <Link href="/login" style={{ color: "var(--mint-d)", fontWeight: 700 }}>로그인</Link>
      </p>
    </form>
  );
}
