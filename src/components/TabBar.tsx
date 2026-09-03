"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** 모바일 하단 탭바입니다. 1000px 이상에서는 CSS가 `display:none` 으로 숨깁니다. */
export default function TabBar() {
  const pathname = usePathname();
  const board = pathname.startsWith("/board/") ? pathname.split("/")[2] : null;

  return (
    <nav className="tabbar" aria-label="빠른 이동">
      <Link href="/" aria-current={pathname === "/"}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" />
        </svg>
        홈
      </Link>

      <Link href="/board/vote" aria-current={board === "vote"}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8h16v12H4zM8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
          <path d="m9 14 2 2 4-4" />
        </svg>
        투표
      </Link>

      <Link href="/login" className="fab" aria-label="글쓰기">
        <i>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </i>
      </Link>

      <Link href="/board/topic" aria-current={board === "topic"}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10Z" />
          <path d="M9 9h6M9 13h4" />
        </svg>
        토론주제
      </Link>

      <Link href="/my" aria-current={pathname === "/my"}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="8" r="3.6" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </svg>
        내 활동
      </Link>
    </nav>
  );
}
