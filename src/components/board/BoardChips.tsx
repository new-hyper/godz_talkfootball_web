"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BOARDS } from "@/lib/boards";

/**
 * 게시판 칩 줄입니다.
 *
 * 브라우저에서 도는 컴포넌트인 이유는 하나뿐입니다.
 * **누른 칩을 곧바로 선택된 모습으로 바꾸기 위해서**입니다.
 *
 * 글 목록을 읽어 오는 데 200ms 남짓 걸립니다. 그동안 화면은 보던 게시판 그대로인데,
 * 이게 짧아 보여도 아무 반응이 없으면 눌리지 않은 것처럼 느껴집니다.
 * 그렇다고 뼈대나 로딩 표시를 띄우면 화면이 두 번 바뀌어 어수선합니다.
 *
 * 그래서 색 하나만 먼저 옮깁니다. 자리도 크기도 그대로라 움직이는 것이 없고,
 * 누른 사람은 자기 조작이 먹혔다는 것을 곧바로 압니다.
 *
 * 주소가 실제로 바뀌면 미리 옮겨 둔 표시를 지웁니다.
 * 이때부터는 서버가 보내 준 진짜 값이 맞으므로 짐작한 값을 붙들고 있을 이유가 없습니다.
 * 뒤로 가기로 돌아왔을 때 엉뚱한 칩이 켜져 있는 것도 이 정리가 막아 줍니다.
 */
export default function BoardChips({
  currentBoardId,
}: {
  /** 검색 화면처럼 게시판이 아니면 null. 칩을 누르면 그 게시판으로 갑니다. */
  currentBoardId: string | null;
}) {
  const pathname = usePathname();
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    setPending(null);
  }, [pathname]);

  const active = pending ?? currentBoardId;

  return (
    <div className="bchips">
      {BOARDS.map((b) => (
        <Link
          key={b.id}
          href={`/board/${b.id}`}
          aria-current={b.id === active}
          onClick={() => setPending(b.id)}
        >
          {b.name}
        </Link>
      ))}
    </div>
  );
}
