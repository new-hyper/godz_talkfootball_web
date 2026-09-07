"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BOARDS, boardOf } from "@/lib/boards";
import { createClient } from "@/lib/supabase/client";

/**
 * 글쓰기 폼입니다. 원본 시안의 `mWrite` 모달과 `submitPost()` 를 옮겼습니다.
 *
 * 원본은 모달이라 주소가 없었습니다. 페이지로 만들면 쓰다 만 글을 두고 자리를 옮겼다가
 * 뒤로 가기로 돌아올 수 있고, "자유게시판에 글쓰기" 링크를 그대로 건넬 수도 있습니다.
 *
 * 브라우저에서 도는 컴포넌트입니다. 입력값이 바뀔 때마다 화면을 다시 그려야 하고,
 * 등록 버튼을 눌렀을 때 오류를 그 자리에서 보여줘야 하기 때문입니다.
 */

const TITLE_MAX = 80;
const BODY_MAX = 20000;

export default function WriteForm({
  boards,
  initialBoardId,
}: {
  /** 이 사람이 쓸 수 있는 게시판만 받습니다. 목록을 만드는 판단은 서버에서 합니다. */
  boards: string[];
  initialBoardId: string;
}) {
  const router = useRouter();

  const [boardId, setBoardId] = useState(initialBoardId);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const board = boardOf(boardId);
  const ready = title.trim().length > 0 && body.trim().length > 0;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;

    setBusy(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setBusy(false);
      setError("로그인이 풀렸습니다. 다시 로그인해 주세요.");
      return;
    }

    // 넣은 뒤 id 만 돌려받습니다.
    // `select()` 를 비워 두면 넣은 행을 통째로 달라는 뜻이 되는데,
    // 그 안에 author_uid 가 들어 있어 읽을 권한이 없다며 거절당합니다.
    // 익명 글의 작성자를 감추려고 일부러 막아 둔 칸입니다.
    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({
        board_id: boardId,
        author_uid: user.id,
        title: title.trim(),
        body: body.trim(),
        is_anonymous: anonymous,
      })
      .select("id")
      .single();

    if (insertError || !data) {
      setBusy(false);
      setError("글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    // replace 를 쓰면 뒤로 가기가 빈 글쓰기 화면으로 돌아가지 않습니다.
    // refresh 는 목록을 다시 읽게 해서 방금 쓴 글이 보이게 합니다.
    router.replace(`/post/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && <p className="form-err">{error}</p>}

      <div className="field">
        <label htmlFor="board">게시판</label>
        <select id="board" value={boardId} onChange={(e) => setBoardId(e.target.value)}>
          {boards.map((id) => (
            <option key={id} value={id}>
              {boardOf(id)?.name ?? id}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="title">제목</label>
        <input
          id="title"
          maxLength={TITLE_MAX}
          placeholder="무엇에 대한 글인가요?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <span className="msg">
          {title.length}/{TITLE_MAX}자
        </span>
      </div>

      <div className="field">
        <label htmlFor="body">내용</label>
        <textarea
          id="body"
          maxLength={BODY_MAX}
          placeholder="겪은 상황과 궁금한 점을 구체적으로 적을수록 좋은 답이 달립니다."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <div className="notice-box">
        {boardId === "discussion" ? (
          <>
            올린 주제는 <b>추천·비추천</b>을 받습니다. 순공감이 쌓이면 사무국이 검토해 <b>투표</b>로
            개설합니다. 특정 클럽·지도자·선수를 지목한 주제는 개설되지 않습니다.
          </>
        ) : (
          <>
            익명으로 올리면 닉네임 대신 <b>익명</b>으로 표시됩니다. 다른 회원은 누가 썼는지 알 수
            없지만, <b>내 활동에는 그대로 남습니다.</b>
          </>
        )}
      </div>

      <div className="m-ft" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <label className="tog" style={{ marginRight: "auto" }}>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
          />
          <span className="sw" />
          <span className="lb">익명으로 쓰기</span>
        </label>
        <Link className="btn ghost" href={`/board/${board?.id ?? "free"}`}>
          취소
        </Link>
        <button type="submit" className="btn mint" disabled={busy || !ready}>
          {busy ? "등록하는 중…" : "등록"}
        </button>
      </div>
    </form>
  );
}
