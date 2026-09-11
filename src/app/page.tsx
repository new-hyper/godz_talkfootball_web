import Link from "next/link";
import DiscussionCard from "@/components/board/DiscussionCard";
import VoteCard from "@/components/board/VoteCard";
import HomeHero from "@/components/home/HomeHero";
import { ADMIN_DISPLAY_NAME, getCurrentUser } from "@/lib/auth/session";
import { boardOf } from "@/lib/boards";
import { ago, formatVoteEndsOn } from "@/lib/format";
import {
  authorLabel,
  firstParagraph,
  getMyReactions,
  listHomeTopics,
  listRecentPosts,
} from "@/lib/posts";
import { getFeaturedVote, listOpenVotes } from "@/lib/votes";

/**
 * 홈입니다.
 *
 * 맨 위 남색 칸은 원본 시안의 `.hero` 입니다.
 * 진행 중 안건 중 참여가 가장 많은 것 하나와, 방금 올라온 글입니다.
 */
export default async function HomePage() {
  const [user, featured, votes, topics, recent] = await Promise.all([
    getCurrentUser(),
    getFeaturedVote(),
    listOpenVotes(),
    listHomeTopics(3),
    listRecentPosts(5),
  ]);
  const myRecs = await getMyReactions(topics.map((t) => t.id));
  const excerpt = featured ? firstParagraph(featured.body).replace(/\*\*/g, "") : "";

  return (
    <section className="view on">
      <HomeHero
        vote={featured}
        excerpt={excerpt}
        endsLabel={featured ? formatVoteEndsOn(featured.ends_on) : ""}
      >
        {recent.length === 0 ? (
          <p className="sub" style={{ marginTop: 14 }}>
            아직 올라온 글이 없습니다.
          </p>
        ) : (
          <ul style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 13 }}>
            {recent.map((post) => (
              <li key={post.id}>
                <Link href={`/post/${post.id}`} style={{ textAlign: "left", width: "100%", display: "block" }}>
                  <div
                    style={{
                      fontSize: 10.5,
                      fontFamily: "var(--util)",
                      fontWeight: 600,
                      color: "var(--mint)",
                      letterSpacing: ".08em",
                    }}
                  >
                    {boardOf(post.board_id)?.en ?? post.board_id}
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      lineHeight: 1.45,
                      marginTop: 3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "#fff",
                    }}
                  >
                    {post.title}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.42)", marginTop: 2 }}>
                    {post.board_id === "vote" ? ADMIN_DISPLAY_NAME : authorLabel(post)} · {ago(post.created_at)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </HomeHero>

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
            <div className="pnote">
              투표 개설은 <b>협회 사무국만</b> 합니다. 회원은{" "}
              <Link className="lk" href="/board/discussion">
                토론주제
              </Link>
              에 주제를 올리고, 추천이 쌓인 주제를 사무국이 안건으로 올립니다.
            </div>
            {votes.length === 0 ? (
              <div className="empty">
                <strong>아직 표시할 안건이 없습니다</strong>
                <p>협회 사무국이 안건을 개설하면 여기에 표시됩니다.</p>
              </div>
            ) : (
              votes.map((vote) => (
                <VoteCard
                  key={vote.id}
                  vote={vote}
                  endsLabel={formatVoteEndsOn(vote.ends_on)}
                  userUid={user?.uid ?? null}
                  nextPath="/"
                />
              ))
            )}
          </div>

          <div className="card">
            <div className="card-hd">
              <span className="spine" style={{ background: "var(--amber)" }} />
              <h3>토론주제</h3>
              <Link className="more" href="/board/discussion">
                전체보기
              </Link>
            </div>
            <div className="pnote amber">
              주제는 <b>회원 누구나</b> 올릴 수 있습니다. 추천·비추천으로 공감을 표시해 주세요.
            </div>
            {topics.length === 0 ? (
              <div className="empty">
                <strong>아직 올라온 주제가 없습니다</strong>
                <p>다뤘으면 하는 주제를 누구나 올릴 수 있습니다.</p>
              </div>
            ) : (
              topics.map((topic) => (
                <DiscussionCard
                  key={topic.id}
                  topic={topic}
                  author={authorLabel(topic)}
                  when={ago(topic.created_at)}
                  userUid={user?.uid ?? null}
                  mine={myRecs[topic.id] ?? null}
                  nextPath="/"
                />
              ))
            )}
            <div style={{ padding: "14px 16px" }}>
              <Link className="btn ghost" href="/write?board=discussion" style={{ width: "100%", height: 42 }}>
                토론주제 올리기
              </Link>
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
