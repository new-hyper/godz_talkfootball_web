-- 토론주제 게시판의 식별자를 topic 에서 discussion 으로 바꾼다
--
-- 화면에 보이는 이름('토론주제')은 그대로다. 주소와 DB 에서 쓰는 값만 바뀐다.
-- 이 값은 src/lib/boards.ts 의 id 와 반드시 같아야 한다. 코드 쪽도 함께 고쳤다.
--
-- 그냥 이름을 고치지 못하는 이유가 있다.
-- boards.id 는 열쇠이고 posts.board_id 가 그것을 가리키고 있다.
-- 가리키는 대상이 사라지면 글들이 없는 게시판을 가리키게 되므로 DB 가 거절한다.
-- 그래서 새 줄을 먼저 만들고, 글을 옮긴 다음, 빈 옛 줄을 지운다.
--
-- 여기서 대상을 옮기는 update 는 글 트리거를 지나간다.
-- posts_guard_update 는 사무국이 아니면 board_id 를 되돌려 놓는데,
-- 이 마이그레이션은 웹 요청이 아니라 통과한다(0006 참고).
-- 0006 을 아직 올리지 않았다면 이 파일보다 먼저 올려야 한다.

begin;

-- 1) 새 게시판을 옛 게시판과 같은 설정으로 만든다.
insert into public.boards (id, staff_only, reaction)
select 'discussion', staff_only, reaction
from public.boards where id = 'topic';

-- 2) 글을 옮긴다.
update public.posts set board_id = 'discussion' where board_id = 'topic';

-- 3) 아무도 가리키지 않게 된 옛 게시판을 지운다.
delete from public.boards where id = 'topic';

commit;
