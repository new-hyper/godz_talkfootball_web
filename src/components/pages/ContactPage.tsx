import InquiryForm from "./InquiryForm";

/**
 * 신고·문의입니다. 원본 시안 `PAGES.contact` 의 본문을 그대로 옮겼습니다.
 *
 * 위쪽 연락처 표는 고정된 내용이라 서버에서 그리고, 아래 접수 폼만 클라이언트 컴포넌트로 분리했습니다.
 * 이렇게 나누면 폼에 필요한 자바스크립트만 브라우저로 내려갑니다.
 */
export default function ContactPage() {
  return (
    <>
      <div className="prose" style={{ paddingBottom: 8 }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>구분</th>
                <th>연락처</th>
                <th>운영</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>대표 전화</b>
                </td>
                <td>02-000-0000</td>
                <td>평일 09:00~18:00</td>
              </tr>
              <tr>
                <td>
                  <b>이메일</b>
                </td>
                <td>godz@example.kr</td>
                <td>상시 접수</td>
              </tr>
              <tr>
                <td>
                  <b>선수 보호 신고</b>
                </td>
                <td>아래 양식 · 익명 가능</td>
                <td>14일 이내 심의</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <InquiryForm />
    </>
  );
}
