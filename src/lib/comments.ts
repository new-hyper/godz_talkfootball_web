import { createClient } from "@/lib/supabase/server";

/**
 * 댓글을 읽어 오는 곳입니다.
 *
 * 읽을 때는 `comments` 가 아니라 `comments_view` 를 씁니다.
 * 글과 같은 이유입니다. 표에는 `author_uid` 가 들어 있어 익명 댓글의 작성자가
 * 그대로 드러나므로 읽을 권한을 빼 두었고, 뷰가 이름만 골라서 내보냅니다.
 */

export type CommentRow = {
  id: number;
  post_id: number;
  parent_id: number | null;
  body: string;
  is_anonymous: boolean;
  anon_no: number | null;
  created_at: string;
  updated_at: string | null;
  author_nickname: string | null;
  is_mine: boolean | null;
  is_post_author: boolean;
};

const COLUMNS =
  "id, post_id, parent_id, body, is_anonymous, anon_no, created_at, updated_at, author_nickname, is_mine, is_post_author";

export async function listComments(postId: number): Promise<CommentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments_view")
    .select(COLUMNS)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CommentRow[];
}

/**
 * 원댓글 아래에 답글을 붙입니다.
 *
 * 부모가 지워진 답글은 뷰에 남을 수 있습니다. 소프트 삭제는 그 행만 가리기 때문입니다.
 * 그런 답글은 맨 위에 원댓글처럼 두어서 말이 통째로 사라지지 않게 합니다.
 */
export function nestComments(rows: CommentRow[]): { parent: CommentRow; replies: CommentRow[] }[] {
  const visible = new Set(rows.filter((c) => c.parent_id == null).map((c) => c.id));
  const replies = new Map<number, CommentRow[]>();
  const orphans: CommentRow[] = [];

  for (const row of rows) {
    if (row.parent_id == null) continue;
    if (!visible.has(row.parent_id)) {
      orphans.push(row);
      continue;
    }
    const list = replies.get(row.parent_id) ?? [];
    list.push(row);
    replies.set(row.parent_id, list);
  }

  const threaded = [
    ...orphans.map((parent) => ({ parent, replies: [] as CommentRow[] })),
    ...rows
      .filter((c) => c.parent_id == null)
      .map((parent) => ({ parent, replies: replies.get(parent.id) ?? [] })),
  ];

  return threaded.sort((a, b) => a.parent.created_at.localeCompare(b.parent.created_at));
}

/** 익명이면 '익명1'. 번호는 저장해 둔 값이므로 누가 지워도 바뀌지 않습니다. */
export const commentAuthorLabel = (c: Pick<CommentRow, "is_anonymous" | "anon_no" | "author_nickname">) =>
  c.is_anonymous ? `익명${c.anon_no ?? ""}` : (c.author_nickname ?? "탈퇴한 회원");
