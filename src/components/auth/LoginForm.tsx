"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OtpStep from "./OtpStep";
import { translateAuthError } from "@/lib/auth/errors";
import { validateEmail } from "@/lib/auth/rules";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // 가입만 하고 인증을 안 끝낸 계정이면 비밀번호가 맞아도 로그인이 안 된다.
  // 그럴 때는 번호를 다시 보내고 인증 화면으로 넘긴다.
  const [needsVerify, setNeedsVerify] = useState(false);

  function done() {
    router.replace("/");
    router.refresh();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const invalid = validateEmail(email);
    setEmailError(invalid);
    if (invalid || !password) {
      if (!password) setFormError("비밀번호를 입력해 주세요.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error) {
      setBusy(false);
      done();
      return;
    }

    if (/email not confirmed/i.test(error.message)) {
      // 번호를 새로 보내고 화면을 넘긴다. 쿨다운 중이면 이미 보낸 번호가 아직 살아 있다.
      await supabase.auth.resend({ type: "signup", email });
      setBusy(false);
      setNeedsVerify(true);
      return;
    }

    setBusy(false);
    setFormError(translateAuthError(error));
  }

  if (needsVerify) {
    return (
      <>
        <p className="form-err">
          아직 이메일 인증을 마치지 않은 계정입니다. 인증번호를 다시 보냈습니다.
        </p>
        <OtpStep email={email} onVerified={done} />
      </>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      {formError && <p className="form-err">{formError}</p>}

      <div className="field">
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={emailError ? "bad" : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailError(validateEmail(email))}
        />
        {emailError && <span className="msg bad">{emailError}</span>}
      </div>

      <div className="field">
        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="btn pri"
        style={{ width: "100%", marginTop: 4 }}
        disabled={busy || !email || !password}
      >
        {busy ? "로그인하는 중…" : "로그인"}
      </button>

      <p style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--dim)" }}>
        아직 회원이 아니신가요?{" "}
        <Link href="/signup" style={{ color: "var(--mint-d)", fontWeight: 700 }}>
          회원가입
        </Link>
      </p>
    </form>
  );
}
