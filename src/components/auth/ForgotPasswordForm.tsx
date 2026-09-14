"use client";

import Link from "next/link";
import { useState } from "react";
import { translateAuthError } from "@/lib/auth/errors";
import { validateEmail } from "@/lib/auth/rules";
import { createClient } from "@/lib/supabase/client";

/**
 * 재설정 메일을 보내는 폼입니다.
 *
 * 가입 인증은 6자리 번호이고, 여기는 링크입니다. 같은 Auth라도 종류가 다릅니다.
 * `resetPasswordForEmail` 이 메일을 보내고, 링크는 `/auth/callback` 으로 돌아옵니다.
 *
 * 없는 이메일이어도 성공으로 보입니다. 함수가 가입 여부를 알려주지 않습니다.
 * 알려주면 이 화면이 가입 확인 창구가 됩니다.
 */
export default function ForgotPasswordForm({ expired = false }: { expired?: boolean }) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(
    expired ? "링크가 만료되었거나 이미 사용되었습니다. 이메일을 다시 보내 주세요." : null,
  );
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const invalid = validateEmail(email);
    setEmailError(invalid);
    if (invalid) return;

    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setBusy(false);

    if (error) {
      setFormError(translateAuthError(error));
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div>
        <div className="notice-box" style={{ marginBottom: 16 }}>
          <b>{email}</b> 으로 재설정 링크를 보냈습니다. 메일의 링크를 눌러 새 비밀번호를 정해
          주세요. 스팸함도 확인해 보세요.
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--dim)" }}>
          <Link href="/login" style={{ color: "var(--mint-d)", fontWeight: 700 }}>
            로그인으로
          </Link>
        </p>
      </div>
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

      <button
        type="submit"
        className="btn pri"
        style={{ width: "100%", marginTop: 4 }}
        disabled={busy || !email}
      >
        {busy ? "보내는 중…" : "재설정 링크 받기"}
      </button>

      <p style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--dim)" }}>
        <Link href="/login" style={{ color: "var(--mint-d)", fontWeight: 700 }}>
          로그인으로
        </Link>
      </p>
    </form>
  );
}
