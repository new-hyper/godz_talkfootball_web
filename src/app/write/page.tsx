import { redirect } from "next/navigation";
import WriteForm from "@/components/board/WriteForm";
import { BOARDS } from "@/lib/boards";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * 글쓰기입니다. 원본 시안에서는 모달이었고, 여기서는 주소를 가진 페이지입니다.
 *
 * `?board=free` 로 어느 게시판에 쓸지 미리 고를 수 있습니다.
 * 게시판 목록의 '글쓰기' 버튼이 그렇게 넘겨 줍니다.
 *
 * 쓸 수 있는 게시판을 고르는 판단은 여기 서버에서 합니다.
 * 브라우저에서 판단하면 개발자 도구로 목록을 늘릴 수 있기 때문인데,
 * 그렇게 해도 DB 쪽에서 다시 막히긴 합니다. 여기서 거르는 것은
 * 눌러 봐야 실패할 선택지를 애초에 보여주지 않으려는 것입니다.
 */
export const metadata = {
  title: "글쓰기 — 고다지 커뮤니티",
};

export default async function WritePage(props: PageProps<"/write">) {
  const user = await getCurrentUser();

  // 로그인하지 않았으면 로그인 화면으로 보냅니다.
  // 어디로 가려 했는지 함께 넘겨 두면 로그인 뒤에 되돌려 보낼 수 있습니다.
  if (!user) redirect("/login?next=/write");

  const params = await props.searchParams;
  const asked = Array.isArray(params.board) ? params.board[0] : params.board;

  // 투표는 찬반 데이터가 따로 필요해서 이 화면으로 만들지 않습니다.
  // 사무국 전용 개설 화면을 따로 만듭니다.
  const writable = BOARDS.filter(
    (b) => b.id !== "vote" && (!b.staffOnly || user.isAdmin),
  ).map((b) => b.id);

  const initial =
    asked && writable.includes(asked) ? asked : (writable[0] ?? "free");

  return (
    <section className="view on">
      <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <WriteForm boards={writable} initialBoardId={initial} />
      </div>
    </section>
  );
}
