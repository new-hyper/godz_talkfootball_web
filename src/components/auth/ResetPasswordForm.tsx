"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { translateAuthError } from "@/lib/auth/errors";
import { validatePassword, validatePasswordConfirm } from "@/lib/auth/rules";
import { createClient } from "@/lib/supabase/client";

/**
 * 새 비밀번호를 넣는 폼입니다. 메일 링크를 타고 온 뒤에만 의미가 있습니다.
 *
 * 링크를 확인하는 순간 이미 로그인 세션이 생깁니다.
 * 그래서 비밀번호만 바꾸고, 다시 로그인시킬 필요는 없습니다.
 * 가입 때와 같은 8자 규칙을 그대로 씁니다.
 */
export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string | null; passwordConfirm?: string | null }>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ready =
    !validatePassword(password) && !validatePasswordConfirm(passwordConfirm, password);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const passwordError = validatePassword(password);
    const confirmError = validatePasswordConfirm(passwordConfirm, password);
    setErrors({ password: passwordError, passwordConfirm: confirmError });
    if (passwordError || confirmError) return;

    setBusy(true);
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      setFormError(translateAuthError(error));
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate>
      {formError && <p className="form-err">{formError}</p>}

      <div className="field">
        <label htmlFor="password">새 비밀번호</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className={errors.password ? "bad" : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setErrors((prev) => ({ ...prev, password: validatePassword(password) }))}
        />
        <span className={`msg${errors.password ? " bad" : ""}`}>
          {errors.password ?? "8자 이상"}
        </span>
      </div>

      <div className="field">
        <label htmlFor="passwordConfirm">새 비밀번호 확인</label>
        <input
          id="passwordConfirm"
          type="password"
          autoComplete="new-password"
          className={errors.passwordConfirm ? "bad" : undefined}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          onBlur={() =>
            setErrors((prev) => ({
              ...prev,
              passwordConfirm: validatePasswordConfirm(passwordConfirm, password),
            }))
          }
        />
        {errors.passwordConfirm && <span className="msg bad">{errors.passwordConfirm}</span>}
      </div>

      <button
        type="submit"
        className="btn pri"
        style={{ width: "100%", marginTop: 4 }}
        disabled={busy || !ready}
      >
        {busy ? "바꾸는 중…" : "비밀번호 바꾸기"}
      </button>
    </form>
  );
}
