import Link from "next/link";

/** 광고·제휴입니다. 원본 시안 `PAGES.ads` 의 본문을 그대로 옮겼습니다. */
export default function AdsPage() {
  return (
    <div className="prose">
      <p className="lead">
        협회는 대회·교육·캠프 운영에 필요한 재원 일부를 후원으로 충당합니다. 다만{" "}
        <strong>아이에게 직접 노출되는 광고</strong>는 받지 않습니다.
      </p>

      <h3>제휴 유형</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>유형</th>
              <th>내용</th>
              <th>노출</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b>대회 후원</b>
              </td>
              <td>협회장배·권역 리그 운영비 지원</td>
              <td>대회 안내문, 경기장 배너</td>
            </tr>
            <tr>
              <td>
                <b>교육 후원</b>
              </td>
              <td>지도자 교육·캠프 지원</td>
              <td>교육 자료, 수료증</td>
            </tr>
            <tr>
              <td>
                <b>물품 지원</b>
              </td>
              <td>용품·의료·안전 장비 제공</td>
              <td>협회 홈페이지 파트너 안내</td>
            </tr>
            <tr>
              <td>
                <b>공익 캠페인</b>
              </td>
              <td>응원 문화·선수 보호 캠페인 공동 진행</td>
              <td>캠페인 자료 공동 명의</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>받지 않는 제휴</h3>
      <ul>
        <li>선수·학부모에게 직접 판매를 유도하는 광고</li>
        <li>특정 클럽·아카데미의 모집 홍보</li>
        <li>성적 향상·선발 보장을 표방하는 상품</li>
        <li>커뮤니티 게시판 내 광고 게재 (게시판에는 광고를 넣지 않습니다)</li>
      </ul>

      <h3>진행 절차</h3>
      <ol>
        <li>문의 접수 — 아래 문의 창구로 제안 내용을 보내 주세요</li>
        <li>사무국 검토 — 영업일 기준 5일 이내 회신</li>
        <li>협약 체결 — 범위·기간·노출 방식을 문서로 확정</li>
        <li>결과 공개 — 후원 내역과 사용처를 연간 결산에 공개</li>
      </ol>

      <div className="callout">
        제휴 문의는 문의 창구에서 <b>광고·제휴</b> 유형을 선택해 남겨 주세요.{" "}
        <Link href="/page/contact">문의하기</Link>
      </div>
    </div>
  );
}
