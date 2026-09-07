import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/next-path";

export const metadata = {
  title: "로그인 — 고다지 커뮤니티",
};

export default async function LoginPage(props: PageProps<"/login">) {
  // 로그인하려다 온 것인지, 글을 쓰려다 막혀서 온 것인지 주소에 적혀 있다.
  const next = safeNextPath((await props.searchParams).next);

  // 이미 로그인한 사람에게 로그인 폼을 보여줄 이유가 없다.
  if (await getCurrentUser()) redirect(next);

  return (
    <section className="view on">
      <div className="card" style={{ maxWidth: 460, margin: "0 auto" }}>
        <div className="board-hd">
          <div className="eyebrow">LOGIN</div>
          <h2>로그인</h2>
          <p>
            {next === "/write"
              ? "글을 쓰려면 로그인이 필요합니다."
              : "이메일과 비밀번호로 로그인합니다."}
          </p>
        </div>
        <div style={{ padding: "18px 16px 22px" }}>
          <LoginForm next={next} />
        </div>
      </div>
    </section>
  );
}
