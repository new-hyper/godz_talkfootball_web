import { createClient } from "@/lib/supabase/server";
import { POSTS_PER_PAGE, type Sort } from "@/lib/posts";
import type { VoteDetail, VoteRow } from "@/lib/vote-types";

/**
 * 투표 안건을 읽어 오는 곳입니다.
 *
 * 글 본문은 `posts_view` 로도 읽을 수 있지만, 마감일·찬반 숫자·내가 찍은 표는
 * `vote_posts_view` 에만 있습니다. 자유게시판 목록에 빈 칸이 생기지 않게
 * 표를 나눠 둔 것과 같은 이유입니다.
 */

const ROW_COLUMNS =
  "id, title, created_at, comment_count, ends_on, source_post_id, yes_count, no_count, ballot_count, is_closed, my_choice, source_title, source_is_anonymous, source_author_nickname";

export async function listVotes(options: {
  sort: Sort;
  page: number;
}): Promise<{ rows: VoteRow[]; total: number; page: number }> {
  const supabase = await createClient();

  const read = async (page: number) => {
    let query = supabase.from("vote_posts_view").select(ROW_COLUMNS, { count: "exact" });

    if (options.sort === "hot") {
      query = query.order("ballot_count", { ascending: false });
    }
    query = query.order("created_at", { ascending: false });

    const from = (page - 1) * POSTS_PER_PAGE;
    return query.range(from, from + POSTS_PER_PAGE - 1);
  };

  let page = options.page;
  let { data, count, error } = await read(page);

  if (error?.code === "PGRST103" && page !== 1) {
    page = 1;
    ({ data, count, error } = await read(page));
  }
  if (error) throw error;

  return { rows: (data ?? []) as VoteRow[], total: count ?? 0, page };
}

export async function getVote(postId: number): Promise<VoteDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vote_posts_view")
    .select(`${ROW_COLUMNS}, body`)
    .eq("id", postId)
    .maybeSingle();

  if (error) throw error;
  return (data as VoteDetail | null) ?? null;
}

/**
 * 홈에 올릴 진행 중 안건입니다. 마감된 것은 게시판 전체보기에서 봅니다.
 */
export async function listOpenVotes(): Promise<VoteRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vote_posts_view")
    .select(ROW_COLUMNS)
    .eq("is_closed", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as VoteRow[];
}

/**
 * 홈 히어로에 올릴 진행 중 안건 하나.
 * 참여(ballot_count)가 가장 많은 것, 같으면 더 최근에 개설된 것.
 */
export async function getFeaturedVote(): Promise<VoteDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vote_posts_view")
    .select(`${ROW_COLUMNS}, body`)
    .eq("is_closed", false)
    .order("ballot_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as VoteDetail | null) ?? null;
}
