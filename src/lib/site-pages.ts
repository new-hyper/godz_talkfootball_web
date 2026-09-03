/**
 * 협회 정적 페이지 8개의 목록입니다. 원본 시안의 `PAGES` / `PAGE_ORDER` 에서 제목과 설명만 뽑았습니다.
 *
 * 본문은 글마다 짜임새가 완전히 달라서(표, 조직도, 연혁 등) 데이터로 만들 수 없습니다.
 * 그래서 여기에는 머리말과 순서만 두고, 본문은 `src/components/pages/` 아래에 컴포넌트로 하나씩 옮깁니다.
 */
export type SitePage = {
  slug: string;
  title: string;
  /** 머리말 eyebrow에 쓰는 영문 표기 */
  en: string;
  desc: string;
};

/** 배열 순서가 그대로 드로어와 사이드바의 노출 순서입니다. */
export const SITE_PAGES: SitePage[] = [
  {
    slug: "about",
    title: "협회 소개",
    en: "ABOUT",
    desc: "모든 아이가 뛰는 유소년 축구를 만들기 위해 2019년에 설립된 비영리 단체입니다.",
  },
  {
    slug: "org",
    title: "조직도",
    en: "ORGANIZATION",
    desc: "총회와 이사회가 의결하고, 사무국 5개 팀과 4개 위원회가 실행합니다.",
  },
  {
    slug: "biz",
    title: "사업 안내",
    en: "PROGRAMS",
    desc: "대회 운영부터 선수 보호까지, 협회가 진행하는 8개 사업입니다.",
  },
  {
    slug: "rules",
    title: "커뮤니티 운영정책",
    en: "COMMUNITY",
    desc: "익명으로 말할 자유와, 지목당하지 않을 권리를 함께 지키기 위한 기준입니다.",
  },
  {
    slug: "terms",
    title: "이용약관",
    en: "TERMS",
    desc: "서비스 이용에 관한 협회와 회원 사이의 기본 약정입니다.",
  },
  {
    slug: "privacy",
    title: "개인정보처리방침",
    en: "PRIVACY",
    desc: "어떤 정보를 왜 수집하고 언제 파기하는지 밝힙니다.",
  },
  {
    slug: "ads",
    title: "광고·제휴",
    en: "PARTNERSHIP",
    desc: "유소년 축구 환경 개선에 함께할 파트너를 찾습니다.",
  },
  {
    slug: "contact",
    title: "신고·문의",
    en: "CONTACT",
    desc: "접수된 문의는 사무국이 확인하고 영업일 기준 2일 이내에 회신합니다.",
  },
];

export const sitePageOf = (slug: string): SitePage | undefined =>
  SITE_PAGES.find((p) => p.slug === slug);
