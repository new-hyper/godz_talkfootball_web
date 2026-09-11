"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 투표 개설 폼입니다. 원본 시안의 `mOpenVote` 모달과 `submitVote()` 를 옮겼습니다.
 *
 * 일반 글쓰기와 다른 점: 게시판을 고르지 않고, 익명도 없고, 마감일이 있습니다.
 * 글과 안건 부가 정보를 한 번에 넣어야 해서 `posts` 에 insert 하지 않고
 * `open_vote` 함수를 부릅니다. Flutter 로 치면 위젯에서 DB 두 줄을 직접 쓰지 않고
 * 리포지토리의 `openVote()` 한 방에 맡기는 것과 같습니다.
 */

const TITLE_MAX = 80;
const BODY_MAX = 20000;

/** 한국 날짜를 `YYYY-MM-DD` 로. input type=date 가 받는 형식입니다. */
const todaySeoul = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

function translateOpenError(message: string): string {
  if (message.includes("협회 사무국만")) return "투표 개설은 협회 사무국만 할 수 있습니다.";
  if (message.includes("마감일은")) return "마감일은 오늘 이후여야 합니다.";
  if (message.includes("이미 투표")) return "이미 투표로 개설된 주제입니다.";
  if (message.includes("토론주제에서만")) return "토론주제에서만 투표를 개설할 수 있습니다.";
  if (message.includes("원 주제")) return "원 주제를 찾을 수 없습니다.";
  return "개설하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export default function OpenVoteForm() {
  const router = useRouter();
  const minDay = todaySeoul();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = title.trim().length > 0 && body.trim().length > 0 && endsOn.length > 0;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;

    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { data, error: failed } = await supabase.rpc("open_vote", {
      p_title: title.trim(),
      p_body: body.trim(),
      p_ends_on: endsOn,
    });

    if (failed || data == null) {
      setBusy(false);
      setError(translateOpenError(failed?.message ?? ""));
      return;
    }

    router.replace(`/post/${data}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && <p className="form-err">{error}</p>}

      <div className="field">
        <label htmlFor="odTitle">투표 문항</label>
        <input
          id="odTitle"
          maxLength={TITLE_MAX}
          placeholder="찬반이 분명히 갈리도록 적어 주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <span className="msg">
          {title.length}/{TITLE_MAX}자
        </span>
      </div>

      <div className="field">
        <label htmlFor="odBody">배경 설명</label>
        <textarea
          id="odBody"
          maxLength={BODY_MAX}
          placeholder="양쪽 근거를 함께 적습니다."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ minHeight: 130 }}
        />
      </div>

      <div className="field">
        <label htmlFor="odEnd">투표 마감일</label>
        <input
          id="odEnd"
          type="date"
          min={minDay}
          value={endsOn}
          onChange={(e) => setEndsOn(e.target.value)}
        />
      </div>

      <div className="notice-box">
        개설된 투표는 협회 이름으로 인용됩니다. 문항이 한쪽을 유도하지 않는지 다시 읽어 보세요.
      </div>

      <div className="m-ft" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <Link className="btn ghost" href="/board/vote" style={{ marginLeft: "auto" }}>
          취소
        </Link>
        <button type="submit" className="btn pri" disabled={busy || !ready}>
          {busy ? "개설하는 중…" : "개설하기"}
        </button>
      </div>
    </form>
  );
}
