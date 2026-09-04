"use client";

import { useEffect, useState } from "react";
import { translateAuthError } from "@/lib/auth/errors";
import { MAX_OTP_ATTEMPTS, RESEND_COOLDOWN_SECONDS, validateOtp } from "@/lib/auth/rules";
import { createClient } from "@/lib/supabase/client";

/**
 * 메일로 받은 6자리를 확인하는 화면.
 *
 * 회원가입 2단계와, 인증을 안 끝낸 계정으로 로그인했을 때 둘 다 여기로 온다.
 * 두 경우 모두 auth.users 에 계정은 있고 확인만 안 된 상태라 같은 종류의 번호를 쓴다.
 * 그래서 화면도 하나로 둔다. 쿨다운 같은 값을 두 벌로 두면 한쪽만 고치는 사고가 난다.
 *
 * 인증에 성공하면 그 자리에서 세션까지 발급되므로 따로 로그인시킬 필요가 없다.
 * 다음에 무엇을 할지는 부르는 쪽이 onVerified 로 정한다.
 */
export default function OtpStep({
  email,
  onVerified,
}: {
  email: string;
  onVerified: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이 화면에 들어왔다는 건 방금 메일이 나갔다는 뜻이라 쿨다운을 켠 채로 시작한다.
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [notice, setNotice] = useState(`${email} 으로 인증번호를 보냈습니다.`);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((left) => left - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function resend({ silent = false } = {}) {
    if (cooldown > 0 || busy) return;

    setBusy(true);
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email });
    setBusy(false);

    if (resendError) {
      setError(translateAuthError(resendError));
      return;
    }
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (!silent) {
      setNotice("인증번호를 다시 보냈습니다.");
      setError(null);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const invalid = validateOtp(otp);
    if (invalid) {
      setError(invalid);
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });
    setBusy(false);

    if (!verifyError) {
      onVerified();
      return;
    }

    const tried = attempts + 1;
    setAttempts(tried);
    setOtp("");

    // 너무 많이 틀리면 그 번호를 버리고 새로 보낸다.
    if (tried >= MAX_OTP_ATTEMPTS) {
      setAttempts(0);
      setError(`인증번호를 ${MAX_OTP_ATTEMPTS}회 틀렸습니다. 새 번호를 보냈습니다.`);
      await resend({ silent: true });
      return;
    }
    setError(`${translateAuthError(verifyError)} (${tried}/${MAX_OTP_ATTEMPTS}회 틀림)`);
  }

  return (
    <form onSubmit={submit} noValidate>
      <p style={{ fontSize: 13.5, color: "var(--dim)", marginBottom: 14, lineHeight: 1.7 }}>
        {notice} 10분 안에 입력해 주세요.
      </p>
      {error && <p className="form-err">{error}</p>}

      <div className="field">
        <label htmlFor="otp">인증번호 6자리</label>
        <input
          id="otp"
          className={`otp${error ? " bad" : ""}`}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          autoFocus
        />
      </div>

      <button
        type="submit"
        className="btn pri"
        style={{ width: "100%" }}
        disabled={busy || otp.length !== 6}
      >
        {busy ? "확인하는 중…" : "인증 완료"}
      </button>

      <div style={{ marginTop: 12, textAlign: "center" }}>
        <button
          type="button"
          className="btn ghost"
          onClick={() => resend()}
          disabled={cooldown > 0 || busy}
        >
          {cooldown > 0 ? `재발송 ${cooldown}초 후` : "인증번호 다시 받기"}
        </button>
      </div>
    </form>
  );
}
