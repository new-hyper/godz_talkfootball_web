"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeNextPath } from "@/lib/auth/next-path";
import { createClient } from "@/lib/supabase/client";

/**
 * 메일 링크를 타고 돌아온 자리입니다.
 *
 * 확인은 이 화면의 버튼을 눌렀을 때만 합니다.
 * Flutter 로 치면 `initState` 에서 API 를 부르지 않고, 확인 버튼을
 * 누를 때 `setState` 로 진행하는 것과 같습니다.
 *
 * 페이지가 열리자마자 확인하면 두 가지가 겹칩니다.
 * 개발 모드의 Strict Mode 가 효과를 두 번 돌려 표를 한 번에 써 버리고,
 * 배포 뒤에는 Gmail 미리보기가 우리 페이지를 열어도 같은 일이 납니다.
 * 서버 라우트 GET 이 토큰을 소진하던 것과 같은 문제입니다.
 *
 * `token_hash` 는 메일 템플릿이 우리 주소로 바로 올 때,
 * `code` 는 예전 ConfirmationURL 이 Supabase 를 거쳐 올 때입니다.
 */

type RecoveryLink = {
  code: string | null;
  tokenHash: string | null;
  type: EmailOtpType;
  next: string;
};

function readParam(href: string, key: string): string | null {
  const url = new URL(href);
  const fromSearch = url.searchParams.get(key);
  if (fromSearch) return fromSearch;
  const fromHash = new URLSearchParams(url.hash.replace(/^#/, "")).get(key);
  if (fromHash) return fromHash;

  // RedirectTo 에 이미 ? 가 있는데 템플릿이 ?token_hash 를 또 붙이면
  // `...?foo=1?token_hash=...` 처럼 깨집니다. URLSearchParams 는
  // 두 번째 ? 뒤를 못 읽으므로, 문자열에서 한 번 더 건집니다.
  const match = href.match(new RegExp(`[?&#]${key}=([^?&#]+)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function readRecoveryLink(): RecoveryLink {
  const href = window.location.href;
  return {
    code: readParam(href, "code"),
    tokenHash: readParam(href, "token_hash"),
    type: (readParam(href, "type") ?? "recovery") as EmailOtpType,
    next: safeNextPath(readParam(href, "next") ?? "/login/reset"),
  };
}

export default function AuthCallbackPage() {
  const [link, setLink] = useState<RecoveryLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const parsed = readRecoveryLink();
    setLink(parsed);
    if (!parsed.code && !parsed.tokenHash) {
      setError("메일 링크에 확인 값이 없습니다. 비밀번호 찾기에서 새 메일을 받아 주세요.");
    }
  }, []);

  async function confirm() {
    if (!link || busy) return;
    setBusy(true);
    setError(null);

    const supabase = createClient();
    let verifyError: { message?: string } | null = null;

    if (link.code) {
      ({ error: verifyError } = await supabase.auth.exchangeCodeForSession(link.code));
    } else if (link.tokenHash) {
      ({ error: verifyError } = await supabase.auth.verifyOtp({
        type: link.type,
        token_hash: link.tokenHash,
      }));
    } else {
      verifyError = { message: "missing" };
    }

    if (verifyError) {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setBusy(false);
        setError("링크가 만료되었거나 이미 사용되었습니다. 이메일을 다시 보내 주세요.");
        return;
      }
    }

    // 방금 심은 세션 쿠키를 서버가 읽으려면 주소창을 통째로 옮기는 편이 확실합니다.
    // router.replace 만 하면 서버 컴포넌트가 아직 빈 쿠키를 보고
    // 재설정 화면을 빈 안내로 그릴 수 있습니다.
    window.location.replace(link.next);
  }

  const ready = Boolean(link?.code || link?.tokenHash);

  return (
    <section className="view on">
      <div className="card" style={{ maxWidth: 460, margin: "0 auto" }}>
        <div className="board-hd">
          <div className="eyebrow">PASSWORD</div>
          <h2>링크 확인</h2>
          <p>메일 속 링크가 맞는지 한 번 더 확인합니다. 버튼을 눌러야 새 비밀번호를 정할 수 있습니다.</p>
        </div>
        <div style={{ padding: "18px 16px 22px" }}>
          {error && <p className="form-err">{error}</p>}
          {ready && (
            <button
              type="button"
              className="btn pri"
              style={{ width: "100%" }}
              disabled={busy}
              onClick={() => void confirm()}
            >
              {busy ? "확인 중…" : "새 비밀번호 정하기"}
            </button>
          )}
          <p style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--dim)" }}>
            <Link href="/login/forgot" style={{ color: "var(--mint-d)", fontWeight: 700 }}>
              비밀번호 찾기로
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
