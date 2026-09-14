"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { translateAuthError } from "@/lib/auth/errors";
import { NICKNAME_CHANGE_DAYS, sameNickname } from "@/lib/auth/nickname";
import { validateNickname } from "@/lib/auth/rules";
import { createClient } from "@/lib/supabase/client";

type NicknameCheck = "idle" | "checking" | "ok" | "taken" | "same";

/**
 * 내 활동에서 닉네임을 바꾸는 폼입니다.
 *
 * 가입 때와 같은 `nickname_available` 로 미리 확인하고, 저장은 `users` 의
 * nickname 칸만 고칩니다. 30일 제한은 화면이 아니라 트리거가 막습니다.
 * 이미 올린 글의 이름은 그때그때 회원 표에서 읽으므로, 바꾸면 예전 글도 함께 바뀝니다.
 */
export default function NicknameForm({
  uid,
  currentNickname,
  isAdmin,
}: {
  uid: string;
  currentNickname: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [nickname, setNickname] = useState(currentNickname);
  const [nicknameCheck, setNicknameCheck] = useState<NicknameCheck>("idle");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const unchanged = sameNickname(nickname.trim(), currentNickname);
  const ready =
    !unchanged && !validateNickname(nickname) && nicknameCheck === "ok" && !busy;

  async function checkNickname() {
    const invalid = validateNickname(nickname);
    setFieldError(invalid);
    if (invalid) {
      setNicknameCheck("idle");
      return;
    }
    if (sameNickname(nickname, currentNickname)) {
      setNicknameCheck("same");
      return;
    }

    setNicknameCheck("checking");
    const supabase = createClient();
    const { data, error } = await supabase.rpc("nickname_available", {
      candidate: nickname,
    });

    if (error) {
      setNicknameCheck("idle");
      setFieldError(translateAuthError(error));
      return;
    }
    setNicknameCheck(data ? "ok" : "taken");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const invalid = validateNickname(nickname);
    if (invalid) {
      setFieldError(invalid);
      return;
    }
    if (sameNickname(nickname, currentNickname)) {
      setNicknameCheck("same");
      return;
    }
    if (nicknameCheck !== "ok") {
      setFieldError("닉네임 중복 확인을 해주세요.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("users").update({ nickname }).eq("uid", uid);
    setBusy(false);

    if (error) {
      setFormError(translateAuthError(error));
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate>
      {isAdmin && (
        <div className="notice-box" style={{ marginBottom: 16 }}>
          다른 회원에게는 항상 <b>협회 사무국</b>으로 보입니다. 여기서 바꾸는 것은 저장용
          닉네임입니다.
        </div>
      )}
      {formError && <p className="form-err">{formError}</p>}

      <div className="field">
        <label htmlFor="nickname">닉네임</label>
        <div className="with-btn">
          <input
            id="nickname"
            autoComplete="off"
            maxLength={12}
            className={fieldError ? "bad" : undefined}
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setNicknameCheck("idle");
              setFieldError(null);
            }}
          />
          <button
            type="button"
            className="btn ghost"
            onClick={() => void checkNickname()}
            disabled={nicknameCheck === "checking"}
          >
            중복 확인
          </button>
        </div>
        {fieldError ? (
          <span className="msg bad">{fieldError}</span>
        ) : nicknameCheck === "ok" ? (
          <span className="msg ok">사용할 수 있는 닉네임입니다.</span>
        ) : nicknameCheck === "taken" ? (
          <span className="msg bad">이미 사용 중인 닉네임입니다.</span>
        ) : nicknameCheck === "same" ? (
          <span className="msg">지금 쓰는 닉네임입니다.</span>
        ) : nickname && !validateNickname(nickname) && !unchanged ? (
          <span className="msg">중복 확인을 눌러 주세요.</span>
        ) : (
          <span className="msg">
            한글·영문·숫자 2~12자. 한 번 바꾸면 {NICKNAME_CHANGE_DAYS}일 동안 다시 바꿀 수
            없습니다. 이미 올린 글의 이름도 함께 바뀝니다.
          </span>
        )}
      </div>

      <button
        type="submit"
        className="btn pri"
        style={{ width: "100%", marginTop: 4 }}
        disabled={!ready}
      >
        {busy ? "바꾸는 중…" : "닉네임 바꾸기"}
      </button>
    </form>
  );
}
