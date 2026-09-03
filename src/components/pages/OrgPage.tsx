import Link from "next/link";

/** 조직도입니다. 원본 시안 `PAGES.org` 의 본문을 그대로 옮겼습니다. */

const REGIONS = [
  { name: "서울", area: "서울특별시", clubs: 68 },
  { name: "인천·경기", area: "인천광역시, 경기도", clubs: 94 },
  { name: "강원", area: "강원특별자치도", clubs: 21 },
  { name: "대전·충청", area: "대전, 세종, 충북, 충남", clubs: 52 },
  { name: "대구·경북", area: "대구광역시, 경상북도", clubs: 48 },
  { name: "부산·울산·경남", area: "부산, 울산, 경상남도", clubs: 63 },
  { name: "광주·전라", area: "광주, 전북, 전남", clubs: 47 },
  { name: "제주", area: "제주특별자치도", clubs: 19 },
];

const COMMITTEES = [
  { name: "기술위원회", role: "연령별 지도 지침, 대회 방식 검토", members: "지도자 7인" },
  { name: "심판위원회", role: "심판 교육·배정 기준 수립", members: "심판 5인" },
  { name: "선수보호위원회", role: "체벌·폭언 신고 심의, 재발 방지", members: "외부 전문가 포함 5인" },
  { name: "공정위원회", role: "징계·이의 신청 심의", members: "법률 자문 포함 5인" },
];

export default function OrgPage() {
  return (
    <div className="prose">
      <div className="org">
        <div className="org-lvl">
          <div className="org-box mint">
            <div className="t">총회</div>
            <div className="d">가맹 클럽 대표</div>
          </div>
        </div>
        <div className="org-line" />
        <div className="org-lvl">
          <div className="org-box">
            <div className="t">이사회</div>
            <div className="d">이사 11인</div>
          </div>
          <div className="org-box">
            <div className="t">감사</div>
            <div className="d">2인</div>
          </div>
        </div>
        <div className="org-line" />
        <div className="org-lvl">
          <div className="org-box navy">
            <div className="t">회장</div>
            <div className="d">부회장 2인</div>
          </div>
        </div>
        <div className="org-line" />
        <div className="org-lvl">
          <div className="org-box navy">
            <div className="t">사무국</div>
            <div className="d">사무국장</div>
          </div>
        </div>
        <div className="org-line" />
        <div className="org-lvl">
          <div className="org-box mint">
            <div className="t">지역 이사</div>
            <div className="d">8개 권역 · 임기 2년</div>
          </div>
        </div>
        <div className="org-line" />
        <div className="org-grid">
          {REGIONS.map((r) => (
            <div className="org-box" key={r.name}>
              <div className="t">{r.name}</div>
              <div className="d">클럽 {r.clubs}</div>
            </div>
          ))}
        </div>
      </div>

      <h3>지역 이사의 역할</h3>
      <p>
        지역 이사는 권역 총회에서 선출되며 임기는 2년입니다. 사무국과 현장 사이를 잇는 자리로, 권역에서 올라온 문제를
        이사회 안건으로 만드는 것이 가장 중요한 일입니다.
      </p>
      <ul>
        <li>권역 내 가맹 클럽 관리, 신규 가맹 상담과 실사</li>
        <li>권역 리그 일정 편성과 경기 운영 점검</li>
        <li>현장 민원·신고의 1차 확인 및 사무국 이관</li>
        <li>권역 의견 수렴 후 이사회 안건 제출</li>
      </ul>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>권역</th>
              <th>담당 시·도</th>
              <th>가맹 클럽</th>
            </tr>
          </thead>
          <tbody>
            {REGIONS.map((r) => (
              <tr key={r.name}>
                <td>
                  <b>{r.name}</b>
                </td>
                <td>{r.area}</td>
                <td>{r.clubs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>위원회</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>위원회</th>
              <th>역할</th>
              <th>구성</th>
            </tr>
          </thead>
          <tbody>
            {COMMITTEES.map((c) => (
              <tr key={c.name}>
                <td>
                  <b>{c.name}</b>
                </td>
                <td>{c.role}</td>
                <td>{c.members}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>커뮤니티 운영 책임</h3>
      <p>
        게시판 운영과 신고 처리는 <strong>사무국</strong>이 맡습니다. 권역과 관련된 신고는 해당{" "}
        <strong>지역 이사</strong>가 1차로 확인한 뒤 사무국에 넘기며, 선수 보호와 관련된 신고는 접수 즉시
        선수보호위원회로 이관됩니다. 커뮤니티 투표 결과는 사무국이 정리해 분기별로 이사회에 보고합니다.
      </p>

      <div className="callout">
        사무국 문의: 02-000-0000 (평일 09:00~18:00) · <Link href="/page/contact">온라인 문의하기</Link>
      </div>
    </div>
  );
}
