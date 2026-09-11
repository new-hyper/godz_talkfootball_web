import { createClient } from "@/lib/supabase/server";
import { boardOf } from "@/lib/boards";

/**
 * 글을 읽어 오는 곳입니다.
 *
 * 화면 파일 안에서 Supabase를 직접 부르지 않고 여기로 모읍니다.
 * 게시판 목록과 검색과 내 활동이 결국 같은 표를 다르게 읽는 것이라,
 * 조건이 흩어지면 "지운 글이 검색에만 나오는" 식의 사고가 납니다.
 *
 * 읽을 때는 `posts` 가 아니라 `posts_view` 를 씁니다.
 * 글 표에는 `author_uid` 가 들어 있어서 익명 글의 작성자가 그대로 드러나므로
 * 아예 읽을 권한을 빼 두었고, 뷰가 이름만 골라서 내보냅니다.
 * 익명 글이면 그 이름조차 `null` 로 나옵니다.
 */

/** 한 쪽에 몇 개를 보여줄지. 원본 시안의 `PER` 과 같습니다. */
export const POSTS_PER_PAGE = 10;

/** 목록 한 줄에 필요한 것만 담습니다. 본문은 상세에서만 읽습니다. */
export type PostRow = {
  id: number;
  board_id: string;
  title: string;
  is_anonymous: boolean;
  like_count: number;
  up_count: number;
  down_count: number;
  created_at: string;
  /** 익명 글이면 null. 어드민에게는 익명이어도 실제 닉네임이 옵니다. */
  author_nickname: string | null;
  /** 내가 쓴 글인지. 로그인하지 않았으면 null 입니다. */
  is_mine: boolean | null;
  comment_count: number;
  /** 추천에서 비추천을 뺀 값. 토론주제 인기순에 씁니다. */
  net_count: number;
};

const ROW_COLUMNS =
  "id, board_id, title, is_anonymous, like_count, up_count, down_count, created_at, author_nickname, is_mine, comment_count, net_count";

export type Sort = "new" | "hot";

/**
 * 주소에서 받은 `?sort=` 를 믿지 않고 아는 값인지 확인합니다.
 * 모르는 값이 오면 최신순으로 떨어뜨립니다.
 */
export const parseSort = (value: string | undefined): Sort =>
  value === "hot" ? "hot" : "new";

/** 주소에서 받은 `?page=` 도 마찬가지입니다. 1보다 작거나 숫자가 아니면 1쪽입니다. */
export function parsePage(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

/**
 * 게시판 한 쪽을 읽습니다. 글과 총 개수를 한 번에 받습니다.
 *
 * Supabase에 한 번 물어보는 데 드는 시간이 하는 일과 거의 무관하게 일정합니다.
 * 8줄짜리 표를 읽든 글 목록을 읽든 비슷하게 걸립니다.
 * 그래서 무엇을 얼마나 읽느냐보다 **몇 번 물어보느냐**가 화면 속도를 정합니다.
 * 개수와 목록을 따로 물어보면 그 시간이 그대로 두 배가 됩니다.
 *
 * `count: "exact"` 를 붙이면 목록과 함께 총 개수도 실어서 보내 줍니다.
 *
 * 다만 없는 쪽을 달라고 하면 오류가 납니다. 글이 세 건인데 `?page=9` 로 들어오면
 * "81번째부터 달라"가 되는데 그런 구간이 없기 때문입니다.
 * 주소는 누구나 고쳐 넣을 수 있으니 화면이 깨지면 안 됩니다.
 * 흔한 일이 아니므로 그때만 1쪽으로 다시 물어봅니다.
 * 늘 일어나는 일에 비용을 물리지 않고, 드문 일에만 한 번 더 갑니다.
 */
export async function listPosts(options: {
  boardId: string;
  sort: Sort;
  page: number;
}): Promise<{ rows: PostRow[]; total: number; page: number }> {
  const { boardId, sort } = options;
  const supabase = await createClient();

  const read = async (page: number) => {
    let query = supabase
      .from("posts_view")
      .select(ROW_COLUMNS, { count: "exact" })
      .eq("board_id", boardId);

    // 인기순의 뜻이 게시판마다 다릅니다.
    // 토론주제는 순공감(추천 − 비추천), 나머지는 좋아요입니다.
    if (sort === "hot") {
      const column = boardOf(boardId)?.reaction === "updown" ? "net_count" : "like_count";
      query = query.order(column, { ascending: false });
    }

    // 인기순으로 볼 때도 같은 점수끼리는 최신 글이 위로 오게 합니다.
    // 이 줄이 없으면 점수가 같은 글들의 순서가 매번 달라져서
    // 2쪽으로 넘겼을 때 1쪽에서 본 글이 또 보이거나 어떤 글은 아예 안 보일 수 있습니다.
    query = query.order("created_at", { ascending: false });

    const from = (page - 1) * POSTS_PER_PAGE;
    return query.range(from, from + POSTS_PER_PAGE - 1);
  };

  let page = options.page;
  let { data, count, error } = await read(page);

  // PGRST103 은 "그런 구간은 없다"는 뜻입니다.
  if (error?.code === "PGRST103" && page !== 1) {
    page = 1;
    ({ data, count, error } = await read(page));
  }
  if (error) throw error;

  return { rows: (data ?? []) as PostRow[], total: count ?? 0, page };
}

/** 상세 화면에서 쓰는 것. 목록에 없던 본문과 수정 시각이 더 있습니다. */
export type PostDetail = PostRow & {
  body: string;
  updated_at: string | null;
};

/**
 * 글 하나를 읽습니다. 없거나 지워졌으면 null 을 돌려줍니다.
 *
 * 주소에서 받은 번호를 그대로 넘기지 않고 숫자인지 먼저 봅니다.
 * `/post/abc` 처럼 이상한 주소가 오면 DB 까지 갈 것 없이 여기서 끝냅니다.
 *
 * `maybeSingle()` 은 없을 때 오류 대신 null 을 줍니다.
 * `single()` 을 쓰면 지워진 글을 열었을 때 화면이 통째로 깨집니다.
 */
export async function getPost(postId: string): Promise<PostDetail | null> {
  const id = Number(postId);
  if (!Number.isInteger(id) || id < 1) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts_view")
    .select(`${ROW_COLUMNS}, body, updated_at`)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as PostDetail | null) ?? null;
}

export type ReactionKind = "like" | "up" | "down";

/**
 * 이 글에 내가 무엇을 눌러 두었는지 봅니다. 누른 적이 없으면 null 입니다.
 *
 * 조건에 내 번호를 적지 않았는데도 내 것만 옵니다.
 * 반응 표의 읽기 정책이 "내가 누른 것만 본다"로 되어 있어서,
 * 남이 무엇을 눌렀는지는 로그인해도 아예 조회되지 않습니다.
 * 화면에 필요한 것은 "내가 눌렀는지"와 "전부 몇 개인지" 둘뿐이고,
 * 개수는 글 표에 따로 적혀 있는 집계 값을 씁니다.
 */
export async function getMyReaction(postId: number): Promise<ReactionKind | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("post_reactions")
    .select("kind")
    .eq("post_id", postId)
    .maybeSingle();

  return (data?.kind as ReactionKind | undefined) ?? null;
}

/**
 * 여러 글에 내가 누른 것을 한 번에 읽습니다. 홈처럼 카드가 몇 장일 때
 * 글마다 물어보면 그 횟수만큼 느려집니다.
 */
export async function getMyReactions(
  postIds: number[],
): Promise<Record<number, ReactionKind>> {
  if (postIds.length === 0) return {};

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_reactions")
    .select("post_id, kind")
    .in("post_id", postIds);

  if (error) throw error;

  const mine: Record<number, ReactionKind> = {};
  for (const row of data ?? []) {
    mine[row.post_id] = row.kind as ReactionKind;
  }
  return mine;
}

/** 홈 토론주제 카드. 본문 앞부분이 미리보기에 필요합니다. */
export type TopicPreview = PostRow & { excerpt: string };

/** 원본이 body 첫 문단을 카드에 넣던 것과 같습니다. */
export function firstParagraph(body: string): string {
  const found = body.split(/\n\s*\n/).map((chunk) => chunk.trim()).find(Boolean);
  return found ?? "";
}

/**
 * 홈에 올릴 토론주제입니다. 순공감이 높은 것 최대 3개. 원본 `paintHomeTopics` 와 같습니다.
 */
export async function listHomeTopics(limit = 3): Promise<TopicPreview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts_view")
    .select(`${ROW_COLUMNS}, body`)
    .eq("board_id", "discussion")
    .order("net_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const { body, ...rest } = row as PostRow & { body: string };
    return { ...rest, excerpt: firstParagraph(body) };
  });
}

/**
 * 목록 한 줄에 쓸 작성자 이름입니다.
 *
 * 익명 글이면 그냥 '익명' 입니다. 원본 시안은 '익명의 윙어' 처럼 포지션을 붙였지만,
 * 글마다 포지션이 달라지면 같은 사람이 여러 명처럼 보입니다.
 *
 * 어드민에게는 익명 글의 실제 닉네임이 오는데, 그렇다고 그대로 띄우면
 * 어깨 너머로 화면을 본 사람에게도 신원이 드러납니다.
 * 익명이라는 사실은 그대로 두고, 누구인지는 사무국 화면에서 따로 봅니다.
 */
export const authorLabel = (post: Pick<PostRow, "is_anonymous" | "author_nickname">) =>
  post.is_anonymous ? "익명" : (post.author_nickname ?? "탈퇴한 회원");
