"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandCrest from "./BrandCrest";
import LogoutButton from "./auth/LogoutButton";
import { BOARDS } from "@/lib/boards";
import { SITE_PAGES } from "@/lib/site-pages";
import type { CurrentUser } from "@/lib/auth/session";

/**
 * 상단 헤더와 왼쪽 드로어입니다.
 *
 * 원본 시안은 `go()` 함수가 `.view` 를 켜고 끄면서 `aria-current` 를 직접 칠했습니다.
 * 여기서는 주소가 화면을 결정하므로, 현재 주소(`usePathname`)를 보고 어느 메뉴가 켜져 있는지 계산합니다.
 * Flutter로 치면 화면 상태를 변수로 들고 있다가 라우터에게 넘긴 셈입니다.
 *
 * 드로어 열림 여부와 모바일 검색창 토글 때문에 브라우저에서 동작해야 해서 클라이언트 컴포넌트입니다.
 *
 * 로그인한 사람은 스스로 알아내지 않고 `layout.tsx`(서버 컴포넌트)에게서 받습니다.
 * 여기서 직접 물어보면 답이 오는 동안 '로그인' 버튼이 잠깐 보였다가 닉네임으로 바뀝니다.
 */
export default function SiteHeader({ user }: { user: CurrentUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // 드로어가 열려 있는 동안에는 뒤쪽 본문이 같이 스크롤되지 않도록 막습니다.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  // 드로어 안의 링크를 누르면 이동과 함께 닫습니다.
  // 주소 변화를 감지해서 닫을 수도 있지만, 그러면 렌더가 한 번 더 도는 것을 React가 경고합니다.
  const closeDrawer = () => setDrawerOpen(false);

  const isHome = pathname === "/";
  const activeBoard = pathname.startsWith("/board/")
    ? pathname.split("/")[2]
    : null;
  const activePage = pathname.startsWith("/page/") ? pathname.split("/")[2] : null;

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    if (typeof q === "string" && q.trim()) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <>
      <header className="hd">
        <div className="hd-util">
          <div className="wrap">
            <div>
              {SITE_PAGES.slice(0, 4).map((p, i) => (
                <span key={p.slug}>
                  {i > 0 && <span className="sep">|</span>}
                  <Link href={`/page/${p.slug}`}>{p.title}</Link>
                </span>
              ))}
            </div>
            <div>
              {user ? (
                <>
                  <Link href="/my">{user.displayName}</Link>
                  <span className="sep">|</span>
                  <LogoutButton className="" />
                </>
              ) : (
                <>
                  <Link href="/login">로그인</Link>
                  <span className="sep">|</span>
                  <Link href="/signup">회원가입</Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="hd-main">
          <div className="wrap">
            <button
              className="icon-btn"
              aria-label="메뉴 열기"
              style={{ marginLeft: -8 }}
              onClick={() => setDrawerOpen(true)}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>

            <Link href="/" className="brand" aria-label="홈으로">
              <BrandCrest />
              <span className="brand-txt">
                <strong>고다지 커뮤니티</strong>
                <span>GODZ TALK FOOTBALL</span>
              </span>
            </Link>

            <form className="search" onSubmit={onSearch}>
              <label className="sr" htmlFor="q">
                게시글 검색
              </label>
              <input id="q" name="q" type="search" placeholder="글·댓글·작성자 검색" autoComplete="off" />
              <button className="go" type="submit" aria-label="검색">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </form>

            <div className="hd-act">
              <Link href="/login" className="btn-write">
                글쓰기
              </Link>
              <button
                className="icon-btn"
                id="btnMSearch"
                aria-label="검색 열기"
                onClick={() => setSearchOpen((v) => !v)}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
              <Link
                href={user ? "/my" : "/login"}
                className="icon-btn"
                aria-label={user ? "내 활동" : "로그인"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="8" r="3.6" />
                  <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <form className={searchOpen ? "msearch on" : "msearch"} onSubmit={onSearch}>
          <label className="sr" htmlFor="mq">
            게시글 검색
          </label>
          <input id="mq" name="q" type="search" placeholder="글·댓글·작성자 검색" />
        </form>

        <nav className="gnb" aria-label="주 메뉴">
          <div className="wrap">
            <Link href="/" aria-current={isHome}>
              홈
            </Link>
            {BOARDS.map((b) => (
              <Link key={b.id} href={`/board/${b.id}`} aria-current={activeBoard === b.id}>
                {b.name}
                {b.id === "vote" && <span className="hot" />}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <div
        className={drawerOpen ? "scrim on" : "scrim"}
        onClick={() => setDrawerOpen(false)}
      />

      <aside
        className={drawerOpen ? "drawer on" : "drawer"}
        role="dialog"
        aria-label="전체 메뉴"
        aria-modal="true"
      >
        <div className="dr-hd">
          <div className="eyebrow" style={{ color: "var(--mint)" }}>
            GODZ TALK FOOTBALL
          </div>
          <div className="dr-me">
            <span className="av" style={{ background: "rgba(255,255,255,.15)", color: "#fff" }}>
              {user ? user.displayName.slice(0, 1) : "?"}
            </span>
            <span className="t">
              <strong>{user ? user.displayName : "로그인이 필요합니다"}</strong>
              <span>{user?.isAdmin ? "사무국 계정" : "닉네임·익명 모두 활동 가능"}</span>
            </span>
          </div>
        </div>

        <div className="dr-bd">
          <div className="dr-sec">커뮤니티</div>
          <div>
            <Link href="/" aria-current={isHome} onClick={closeDrawer}>
              홈
            </Link>
            {BOARDS.map((b) => (
              <Link
                key={b.id}
                href={`/board/${b.id}`}
                aria-current={activeBoard === b.id}
                onClick={closeDrawer}
              >
                {b.name}
              </Link>
            ))}
            <Link href="/my" aria-current={pathname === "/my"} onClick={closeDrawer}>
              내 활동
            </Link>
          </div>
          <div className="dr-sec">협회</div>
          <div>
            {SITE_PAGES.map((p) => (
              <Link
                key={p.slug}
                href={`/page/${p.slug}`}
                aria-current={activePage === p.slug}
                onClick={closeDrawer}
              >
                {p.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="dr-ft">
          {user ? (
            <>
              <Link href="/my" className="btn ghost" onClick={closeDrawer}>
                내 활동
              </Link>
              <LogoutButton className="btn pri" />
            </>
          ) : (
            <>
              <Link href="/signup" className="btn ghost" onClick={closeDrawer}>
                회원가입
              </Link>
              <Link href="/login" className="btn pri" onClick={closeDrawer}>
                로그인
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
