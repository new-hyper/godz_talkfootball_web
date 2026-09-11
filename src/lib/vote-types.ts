import type { BallotChoice } from "@/lib/vote-math";

/** 투표 목록·카드에 쓰는 모양. 서버 클라이언트를 끌어오지 않습니다. */
export type VoteRow = {
  id: number;
  title: string;
  created_at: string;
  comment_count: number;
  ends_on: string;
  source_post_id: number | null;
  yes_count: number;
  no_count: number;
  ballot_count: number;
  is_closed: boolean;
  my_choice: BallotChoice | null;
  source_title: string | null;
  source_is_anonymous: boolean | null;
  source_author_nickname: string | null;
};

export type VoteDetail = VoteRow & {
  body: string;
};
