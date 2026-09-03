"use client";

import { useState } from "react";

/**
 * 신고·문의 접수 폼입니다. 원본 시안 `PAGES.contact` 의 아래쪽 절반입니다.
 *
 * 입력값을 붙잡고 있어야 해서 클라이언트 컴포넌트입니다.
 * 원본은 접수 내용을 브라우저 메모리 배열(`INQUIRIES`)에 담아뒀을 뿐 어디에도 저장하지 않았습니다.
 * 실제 저장은 Supabase에 `inquiries` 테이블을 만들면서 붙입니다. 지금은 검증까지만 동작합니다.
 */
const TYPES = [
  "대회·행사 관련",
  "지도자 교육·자격",
  "선수 등록·이적",
  "선수 보호 신고 (체벌·폭언)",
  "커뮤니티 게시물 신고·이의",
  "광고·제휴",
  "기타",
];

export default function InquiryForm() {
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!body.trim()) {
      setMessage({ tone: "error", text: "문의 내용을 입력해 주세요." });
      return;
    }
    setMessage({
      tone: "info",
      text: "입력은 정상입니다. 실제 접수 저장은 Supabase를 연결하는 단계에서 동작합니다.",
    });
  };

  return (
    <form style={{ padding: "0 16px 20px" }} onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="ctType">문의 유형</label>
        <select id="ctType" name="type" defaultValue={TYPES[0]}>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="ctName">이름 또는 클럽명</label>
        <input id="ctName" name="name" placeholder="익명 접수를 원하시면 비워 두세요" />
      </div>

      <div className="field">
        <label htmlFor="ctEmail">회신받을 이메일</label>
        <input id="ctEmail" name="email" type="email" placeholder="answer@example.kr" />
      </div>

      <div className="field">
        <label htmlFor="ctBody">문의 내용</label>
        <textarea
          id="ctBody"
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="언제, 어디서, 어떤 일이 있었는지 구체적으로 적어 주시면 처리가 빨라집니다."
        />
      </div>

      <div className="notice-box" style={{ marginBottom: 14 }}>
        선수 보호 신고는 <b>이름 없이</b>도 접수됩니다. 접수 사실과 내용은 선수보호위원회 외에는 공유되지 않습니다.
      </div>

      <button className="btn mint" style={{ width: "100%", height: 46 }} type="submit">
        문의 접수
      </button>

      {message && (
        <div className="callout" style={{ marginTop: 14 }}>
          {message.text}
        </div>
      )}
    </form>
  );
}
