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
  /**
   * 이 게시판에서 누를 수 있는 것.
   *
   * 화면이 좋아요 하나를 그릴지 추천·비추천 둘을 그릴지 여기서 정합니다.
   * 실제로 막는 것은 DB 의 `boards.reaction` 이고 여기 값은 화면용 사본입니다.
   * 한쪽만 고치면 버튼은 보이는데 눌리지 않는 상태가 되므로 함께 고쳐야 합니다.
   * `src/lib/auth/rules.ts` 의 닉네임 규칙을 두 곳에 둔 것과 같은 사정입니다.
   */
  reaction: "like" | "updown" | "none";
};

export const BOARDS: Board[] = [
  {
    id: "notice",
    name: "공지사항",
    en: "NOTICE",
    desc: "협회 공식 공지와 대회·교육 일정입니다.",
    staffOnly: true,
    reaction: "like",
  },
  {
    id: "vote",
    name: "투표",
    en: "VOTE",
    desc: "협회 사무국이 개설한 안건에 찬반으로 투표합니다.",
    staffOnly: true,
    // 투표는 찬반을 따로 받으므로 좋아요·추천이 없다.
    reaction: "none",
  },
  {
    id: "discussion",
    name: "토론주제",
    en: "DISCUSSION",
    desc: "다뤘으면 하는 주제를 누구나 올립니다. 추천·비추천이 쌓인 주제를 사무국이 투표로 개설합니다.",
    reaction: "updown",
  },
  {
    id: "free",
    name: "자유게시판",
    en: "FREE",
    desc: "유소년 축구와 관련된 모든 이야기.",
    reaction: "like",
  },
  {
    id: "parent",
    name: "학부모 상담",
    en: "PARENT",
    desc: "클럽 선택, 비용, 진로 고민을 나눕니다.",
    reaction: "like",
  },
  {
    id: "player",
    name: "선수·진로",
    en: "PLAYER",
    desc: "선발전, 상급학교 진학, 부상 관리.",
    reaction: "like",
  },
  {
    id: "event",
    name: "대회·행사",
    en: "EVENT",
    desc: "대회 모집과 참가 후기.",
    reaction: "like",
  },
  {
    id: "qna",
    name: "질문답변",
    en: "Q&A",
    desc: "규정·등록·행정 관련 질문.",
    reaction: "like",
  },
];

export const boardOf = (id: string): Board | undefined =>
  BOARDS.find((b) => b.id === id);
