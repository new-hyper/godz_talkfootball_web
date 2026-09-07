"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "정말 하시겠습니까" 를 묻는 모달입니다.
 *
 * 브라우저 기본 `confirm()` 을 쓰지 않는 이유가 둘 있습니다.
 * 하나는 생김새가 브라우저마다 다르고 우리 디자인과 따로 논다는 것,
 * 다른 하나는 그 창이 뜨는 동안 페이지가 통째로 멈춘다는 것입니다.
 *
 * 원본 시안의 `.modal` 규칙을 그대로 씁니다.
 * 좁은 화면에서는 아래에서 올라오고, 넓은 화면에서는 가운데에 뜹니다.
 *
 * 되돌릴 수 없는 일에 쓰는 창이라 몇 가지를 신경 썼습니다.
 * 처음 열릴 때 초점을 '취소' 에 둡니다. 열자마자 엔터를 눌러 사고가 나는 것을 막습니다.
 * Esc 와 바깥쪽 누르기로도 닫히는데, 둘 다 '취소' 로 취급합니다.
 */
export default function ConfirmModal({
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  busy = false,
  danger = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  /** 지우기처럼 되돌릴 수 없는 일이면 확인 버튼을 빨갛게 합니다. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // 붙자마자 .on 을 달면 브라우저가 처음부터 그 모습으로 그려서 애니메이션이 없습니다.
  // 한 번 그린 다음에 붙여야 '아래에서 올라오는' 움직임이 보입니다.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <>
      <div
        className={shown ? "scrim on" : "scrim"}
        onClick={() => !busy && onCancel()}
      />
      <div
        className={shown ? "modal on" : "modal"}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        {/*
          원본의 .m-hd 와 .m-ft 에는 구분선이 붙어 있습니다.
          본문이 길어 스크롤되는 모달에서는 머리말·바닥이 어디까지인지 알려 주지만,
          이 창은 두 줄이라 스크롤될 일이 없어 선이 화면만 잘게 나눕니다.
          규칙 자체는 그대로 두고 여기서만 끕니다.
        */}
        <div className="m-hd" style={{ borderBottom: 0, paddingBottom: 4 }}>
          <h3>{title}</h3>
        </div>
        <div className="m-bd" style={{ padding: "8px 16px 4px" }}>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--dim)" }}>{message}</p>
        </div>
        <div className="m-ft" style={{ borderTop: 0 }}>
          <button
            ref={cancelRef}
            type="button"
            className="btn ghost"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? "btn red" : "btn pri"}
            onClick={onConfirm}
            disabled={busy}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
