import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TabBar from "@/components/TabBar";

export const metadata: Metadata = {
  title: "고다지 커뮤니티",
  description:
    "유소년 축구 지도자·학부모·선수가 함께 토론하는 공간. 실명도 익명도 가능합니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // suppressHydrationWarning은 <html> 태그 '자기 속성'에만 적용됩니다.
  // Dark Reader 같은 브라우저 확장이 여기에 data-* 속성을 붙이는데,
  // 서버가 만든 HTML에는 없는 값이라 React가 불일치로 봅니다. 안쪽 내용은 그대로 검사합니다.
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <SiteHeader />
        {/* 원본 시안의 `<main class="page">` 입니다. 최대 너비와 좌우 여백을 여기서 잡습니다. */}
        <main className="page">{children}</main>
        <SiteFooter />
        <TabBar />
      </body>
    </html>
  );
}
