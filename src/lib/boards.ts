/**
 * 게시판 정의입니다. 원본 시안 자바스크립트의 `BOARDS` 배열에서 옮겼습니다.
 * 원본에 있던 `coach`(지도자 라운지)와 `file`(자료실)은 뺐습니다.
 *
 * DB가 아니라 코드에 두는 이유: 게시판은 운영 중에 추가·삭제되는 값이 아니고,
 * 주소(`/board/[boardId]`)와 1:1로 묶여 있어서 코드와 함께 관리하는 편이 안전합니다.
 * 글 자체는 Supabase에 저장하고, 어느 게시판 소속인지만 여기의 `id`로 참조합니다.
 */
export type Board = {
  id: string;
  /** 화면에 보이는 이름 */
  name: string;
  /** 게시판 머리말의 eyebrow에 쓰는 영문 표기 */
  en: string;
  desc: string;
  /** 협회 사무국만 글을 쓸 수 있는 게시판 */
  staffOnly?: boolean;
};

export const BOARDS: Board[] = [
  {
    id: "notice",
    name: "공지사항",
    en: "NOTICE",
    desc: "협회 공식 공지와 대회·교육 일정입니다.",
    staffOnly: true,
  },
  {
    id: "vote",
    name: "투표",
    en: "VOTE",
    desc: "협회 사무국이 개설한 안건에 찬반으로 투표합니다.",
    staffOnly: true,
  },
  {
    id: "topic",
    name: "토론주제",
    en: "TOPIC",
    desc: "다뤘으면 하는 주제를 누구나 올립니다. 추천·비추천이 쌓인 주제를 사무국이 투표로 개설합니다.",
  },
  {
    id: "free",
    name: "자유게시판",
    en: "FREE",
    desc: "유소년 축구와 관련된 모든 이야기.",
  },
  {
    id: "parent",
    name: "학부모 상담",
    en: "PARENT",
    desc: "클럽 선택, 비용, 진로 고민을 나눕니다.",
  },
  {
    id: "player",
    name: "선수·진로",
    en: "PLAYER",
    desc: "선발전, 상급학교 진학, 부상 관리.",
  },
  {
    id: "event",
    name: "대회·행사",
    en: "EVENT",
    desc: "대회 모집과 참가 후기.",
  },
  {
    id: "qna",
    name: "질문답변",
    en: "Q&A",
    desc: "규정·등록·행정 관련 질문.",
  },
];

export const boardOf = (id: string): Board | undefined =>
  BOARDS.find((b) => b.id === id);
