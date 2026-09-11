import Link from "next/link";
import DiscussionCard from "@/components/board/DiscussionCard";
import VoteCard from "@/components/board/VoteCard";
import { getCurrentUser } from "@/lib/auth/session";
import { ago, formatVoteEndsOn } from "@/lib/format";
import { authorLabel, getMyReactions, listHomeTopics } from "@/lib/posts";
import { listOpenVotes } from "@/lib/votes";

/**
 * 홈입니다.
 *
 * 투표·토론주제 카드는 원본 시안의 `paintHomeVotes` / `paintHomeTopics` 입니다.
 * 히어로(큰 찬반 배너)와 공지 티커는 아직 비어 있습니다.
 */
export default async function HomePage() {
  const [user, votes, topics] = await Promise.all([
    getCurrentUser(),
    listOpenVotes(),
    listHomeTopics(3),
  ]);
  const myRecs = await getMyReactions(topics.map((t) => t.id));

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
