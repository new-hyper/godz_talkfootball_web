import Link from "next/link";
import BrandCrest from "./BrandCrest";

/** 푸터입니다. 주소가 고정이라 서버 컴포넌트로 두고, 자바스크립트를 브라우저로 내려보내지 않습니다. */
export default function SiteFooter() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft-brand">
          <BrandCrest variant="footer" />
          <strong>고다지 커뮤니티</strong>
        </div>
        <div className="ft-r">
          <nav className="ft-nav">
            <Link href="/page/terms" className="em">
              이용약관
            </Link>
            <Link href="/page/privacy" className="em">
              개인정보처리방침
            </Link>
            <Link href="/page/rules">커뮤니티 운영정책</Link>
            <Link href="/page/contact">신고·문의</Link>
            <Link href="/page/ads">광고·제휴</Link>
            <Link href="/page/biz">사업 안내</Link>
          </nav>
          <p className="ft-info">
            고다지 커뮤니티 &nbsp;|&nbsp; 대표 <b>홍길동</b> &nbsp;|&nbsp; 고유번호 000-00-00000
            <br />
            서울특별시 송파구 올림픽로 000, 0층 &nbsp;|&nbsp; 대표전화 <b>02-000-0000</b> &nbsp;|&nbsp;
            godz@example.kr
            <br />
            게시물의 책임은 작성자에게 있으며, 협회의 공식 입장과 다를 수 있습니다.
          </p>
          <p className="ft-cp">© 2026 GODZ TALK FOOTBALL ASSOCIATION</p>
        </div>
      </div>
    </footer>
  );
}
