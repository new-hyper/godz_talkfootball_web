import Link from "next/link";

/**
 * 홈입니다.
 *
 * 히어로(진행 중인 투표), 공지 티커, 투표·토론주제 요약, 주간 인기글, 라이브 토론방은
 * 전부 Supabase에서 읽어와야 하는 자리라 아직 비어 있습니다. 다음 단계에서 채웁니다.
 * 지금은 원본 시안과 같은 뼈대와, 데이터가 필요 없는 '협회 현황' 카드만 들어 있습니다.
 */
export default function HomePage() {
  return (
    <section className="view on">
      <div className="cols">
        <div>
          <div className="card">
            <div className="card-hd">
              <span className="spine" />
              <h3>투표</h3>
              <Link className="more" href="/board/vote">
                전체보기
              </Link>
            </div>
            <div className="empty">
              <strong>아직 표시할 안건이 없습니다</strong>
              <p>협회 사무국이 안건을 개설하면 여기에 표시됩니다.</p>
            </div>
          </div>

          <div className="card">
            <div className="card-hd">
              <span className="spine" style={{ background: "var(--amber)" }} />
              <h3>토론주제</h3>
              <Link className="more" href="/board/topic">
                전체보기
              </Link>
            </div>
            <div className="empty">
              <strong>아직 올라온 주제가 없습니다</strong>
              <p>다뤘으면 하는 주제를 누구나 올릴 수 있습니다.</p>
            </div>
          </div>
        </div>

        <aside className="side">
          <div className="info-card">
            <div className="eyebrow">ASSOCIATION</div>
            <h4>협회 현황</h4>
            <ul>
              <li>
                <span>가맹 클럽</span>
                <b>412</b>
              </li>
              <li>
                <span>등록 지도자</span>
                <b>1,847</b>
              </li>
              <li>
                <span>등록 선수</span>
                <b>9,203</b>
              </li>
              <li>
                <span>회원 수</span>
                <b>3,126</b>
              </li>
            </ul>
            <Link className="btn" href="/page/biz">
              사업 안내 보기
            </Link>
          </div>

          <div className="card">
            <div className="card-hd">
              <span className="spine" />
              <h3>커뮤니티 이용 원칙</h3>
            </div>
            <div className="card-bd pad">
              <div className="notice-box">
                익명으로 써도 <b>기록은 남습니다.</b> 선수 실명 비방, 특정 클럽 저격, 지도자 신상
                노출은 예고 없이 삭제되고 활동이 제한됩니다.
                <br />
                <br />
                반대 의견은 환영합니다. 사람이 아니라 <b>주장을 반박해 주세요.</b>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
