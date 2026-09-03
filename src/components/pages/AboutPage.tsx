import Link from "next/link";

/** 협회 소개입니다. 원본 시안 `PAGES.about` 의 본문을 그대로 옮겼습니다. */
export default function AboutPage() {
  return (
    <div className="prose">
      <p className="lead">
        고다지 커뮤니티는 유소년 축구가 <strong>성적이 아니라 성장</strong>을 위한 것이 되도록, 대회·교육·등록·정책을
        함께 다루는 비영리 단체입니다.
      </p>

      <div className="stat-grid">
        <div className="stat">
          <div className="n">412</div>
          <div className="l">가맹 클럽</div>
        </div>
        <div className="stat">
          <div className="n">1,847</div>
          <div className="l">등록 지도자</div>
        </div>
        <div className="stat">
          <div className="n">9,203</div>
          <div className="l">등록 선수</div>
        </div>
        <div className="stat">
          <div className="n">2019</div>
          <div className="l">설립</div>
        </div>
      </div>

      <h3>설립 목적</h3>
      <p>
        유소년기의 축구는 선수를 고르는 과정이 아니라 <strong>아이를 키우는 과정</strong>입니다. 협회는 이기는 팀을
        만드는 일보다, 늦게 크는 아이가 그만두지 않는 환경을 만드는 일을 우선에 둡니다.
      </p>

      <h3>세 가지 원칙</h3>
      <ol>
        <li>
          <strong>모든 아이가 뛴다.</strong> 협회 주관 대회는 전 경기 8인제, 모든 등록 선수의 최소 출전 시간을
          보장합니다.
        </li>
        <li>
          <strong>이기는 법보다 배우는 법.</strong> U-12 이하 대회는 순위를 공식 집계하지 않습니다.
        </li>
        <li>
          <strong>어른의 편의보다 아이의 성장.</strong> 일정·규정을 정할 때 아이의 회복과 학업을 먼저 계산합니다.
        </li>
      </ol>

      <h3>연혁</h3>
      <ul className="hist">
        <li>
          <span className="yr">2019</span>
          <span className="tx">협회 설립. 수도권 38개 클럽으로 시작</span>
        </li>
        <li>
          <span className="yr">2020</span>
          <span className="tx">유소년 지도자 기초 자격 과정 개설</span>
        </li>
        <li>
          <span className="yr">2021</span>
          <span className="tx">전 경기 8인제 전환, 최소 출전 시간 규정 도입</span>
        </li>
        <li>
          <span className="yr">2022</span>
          <span className="tx">선수 등록·이적 시스템 운영 시작</span>
        </li>
        <li>
          <span className="yr">2023</span>
          <span className="tx">제1회 협회장배 유소년 축구대회 개최</span>
        </li>
        <li>
          <span className="yr">2024</span>
          <span className="tx">선수 보호 규정 제정, 익명 신고 창구 개설</span>
        </li>
        <li>
          <span className="yr">2025</span>
          <span className="tx">가맹 클럽 400개 돌파. 권역 리그 전국 확대</span>
        </li>
        <li>
          <span className="yr">2026</span>
          <span className="tx">회원 커뮤니티 개설. 투표 결과의 이사회 보고 절차 신설</span>
        </li>
      </ul>

      <h3>회장 인사말</h3>
      <p>
        주말마다 경기장에 서면 두 종류의 아이가 보입니다. 90분을 다 뛰는 아이와, 유니폼을 입고 앉아만 있다 돌아가는
        아이입니다. 같은 회비를 내고, 같은 시간을 썼는데 말입니다.
      </p>
      <p>
        협회가 할 일은 두 번째 아이를 위한 규칙을 만드는 것이라고 생각합니다. 현장에서 보이는 문제를{" "}
        <strong>토론주제</strong>에 올려 주십시오. 공감이 모인 주제는 사무국이 안건으로 올리고, 투표 결과는 이사회
        자료에 그대로 첨부됩니다.
      </p>

      <div className="callout">
        현장 의견이 규정으로 이어지는 경로를 열어 두었습니다. <Link href="/board/topic">토론주제 게시판 가기</Link>
      </div>
    </div>
  );
}
