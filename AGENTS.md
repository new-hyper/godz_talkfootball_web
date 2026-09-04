<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 고다지 커뮤니티

유소년 축구 지도자·학부모·선수가 함께 토론하는 커뮤니티 사이트입니다.
협회 사무국이 안건을 투표에 부치고, 회원이 토론주제를 올려 순공감이 쌓이면 사무국이 정식 투표로 개설합니다.

## 작성자에 대해

Flutter 앱 개발자이고 웹 개발은 이번이 두 번째입니다(첫 번째는 `playerlab_web`).
**배우면서 진행하는 것이 목적이므로**, 코드를 던져주기보다 왜 그렇게 하는지 설명을 함께 주세요.
Flutter 개념에 빗대어 설명하면 이해가 빠릅니다(위젯↔컴포넌트, setState↔useState, pubspec.yaml↔package.json 등).
답변은 한국어로 합니다.

## 기술 스택

- Next.js 16 App Router + TypeScript + React 19
- DB와 인증은 Supabase
- 배포는 Vercel (아직 안 함)
- **Tailwind는 쓰지 않습니다.** 원본 시안의 CSS를 그대로 유지합니다

## 원본 시안

`/Users/newhyper/Downloads/godz-community.html` (2,153줄) 한 장짜리 HTML에서 이식하고 있습니다.
그중 526줄이 손으로 짠 CSS이고, 이건 `src/app/globals.css`에 **한 줄도 고치지 않고** 복사했습니다.
새 마크업을 쓸 때도 기존 클래스(`.wrap` `.card` `.row` `.btn` `.chip` `.prose` 등)를 재사용하고, CSS는 되도록 건드리지 않습니다.

원본은 뷰 5개(`v-home` `v-board` `v-post` `v-page` `v-my`)를 자바스크립트로 켜고 껐습니다.
이식하면서 뷰마다 진짜 주소를 갖게 했고, 원본의 `go()` 라우터 코드는 버립니다.
글 링크 공유가 되고 검색엔진에도 잡히게 하려는 목적입니다.

원본의 목업 데이터(`POSTS` `COMMENTS` `REPORTS` 등)는 Supabase 테이블로 옮깁니다.
`PAGES` 의 정적 페이지 8개 본문은 하드코딩된 HTML이라 `src/components/pages/` 에 컴포넌트로 옮겨 뒀습니다.
원본 문장이 하나도 빠지지 않았는지 문장·단어 단위로 대조해서 확인했습니다.

표는 원본이 `<table>` 안에 `<tr>` 을 바로 넣었는데, JSX에서는 `<thead>` `<tbody>` 를 넣어야 React가 경고하지 않습니다.
브라우저가 어차피 자동으로 넣어주던 것이라 보이는 결과는 같습니다.

### CSS에서 딱 한 가지 고친 것

원본은 화면 전환을 자바스크립트로 했기 때문에 **내비게이션이 전부 `<button>`** 이고,
CSS도 `.gnb button` 처럼 **태그 선택자**로 잡혀 있었습니다.
주소를 갖게 하려면 진짜 링크(`<a>`)여야 검색엔진이 따라가고 새 탭 열기도 되므로,
해당 선택자만 `.gnb :is(button,a)` 로 넓혔습니다. 값은 하나도 바꾸지 않았습니다.

고친 선택자는 이게 전부입니다: `.hd-util` `.gnb` `.dr-bd` `.tabbar` `.ft-nav` `.rank` `.tags` `.pager`.
`<a>` 는 기본이 `display:inline` 이라 `height` 가 안 먹는 곳에는 `inline-flex` 만 덧붙였습니다.

`.sorts` `.bchips` `.seg` 는 정렬·필터 토글이라 **진짜 버튼이 맞으므로 그대로 둡니다.**

맨 위 `@import` 두 줄도 추가했습니다. 원본이 `<head>`의 `<link>` 로 불러오던 웹폰트이고,
`playerlab_web` 과 같은 방식입니다.

## 브랜드와 로고

이름은 **고다지 커뮤니티**입니다. 원본 시안의 "GODZ 입축구협회"에서 바뀌었습니다.
`GODZ` 접두사는 뗐습니다. 고다지가 곧 GODZ의 한글 표기라 붙여 쓰면 이름이 두 번 반복됩니다.
`GODZ` 는 헤더·푸터 아래쪽 태그라인 `GODZ TALK FOOTBALL` 에만 남아 있습니다.
그래서 원본 CSS의 `.gz` (민트색 GODZ 로고타이프) 클래스는 지금 쓰는 곳이 없습니다.
원본 CSS는 그대로 두는 원칙이라 규칙 자체는 남겨 뒀습니다.

로고는 `public/brand-mark.png` 이고 `src/components/BrandCrest.tsx` 가 씁니다. 원본 시안의 인라인 SVG 방패는 버렸습니다.

받은 로고 원본은 [말풍선+공 엠블럼] + [민트 줄무늬] + [한글 이름] + [영문 태그라인] 이 한 덩어리인 가로형이었고,
**한글 이름 부분에 "입축구협회"가 이미지로 박혀 있었습니다.** 배경이 투명이고 글자가 흰색이라
흰 화면에서는 안 보이지만 남색 헤더 위에서는 드러납니다.

그래서 **엠블럼(말풍선+공)만 잘라 쓰고, 이름은 HTML 텍스트로 둡니다.**
이름이 또 바뀌어도 이미지를 다시 만들 필요가 없고, 검색엔진과 스크린리더도 이름을 읽습니다.
엠블럼에 겹쳐 있던 민트 줄무늬 조각은 지웠습니다. 엠블럼 자체에는 민트색이 없어서 색으로 걸러냈습니다.

**로고를 다시 만들 일이 생기면 이름 글자가 들어가지 않은 엠블럼 파일을 받으세요.**

## 주소 구성

| 주소 | 내용 | 상태 |
|---|---|---|
| `/` | 홈 (진행 중 투표 히어로, 투표·토론주제 요약, 사이드바) | 뼈대만 |
| `/board/[boardId]` | 게시판 목록 | 머리말만 |
| `/post/[postId]` | 글 상세 + 댓글 | 없음 |
| `/page/[slug]` | 협회 정적 페이지 8개 | **이식 완료** |
| `/search` | 검색 결과 | 뼈대만 |
| `/my` | 내 활동 | 뼈대만 |
| `/login` `/signup` | 로그인·회원가입 | 뼈대만 |
| `/admin` | 사무국 전용 (투표 개설, 신고 처리) | 없음 |

게시판 8개: `notice` `vote` `topic` `free` `parent` `player` `event` `qna`
원본 시안에 있던 `coach`(지도자 라운지)와 `file`(자료실)은 뺐습니다.
정적 페이지 8개: `about` `org` `biz` `rules` `terms` `privacy` `ads` `contact`

## 역할과 익명 정책

한 번 정한 내용이니 다시 제안하지 마세요.

- 역할은 **`user` 와 `admin` 둘뿐**입니다. 원본 시안의 회원 구분(지도자·학부모·선수·심판)은 **쓰지 않습니다**
- 어드민 표시 이름은 항상 **`협회 사무국`** 입니다. 모든 글·댓글의 실제 작성자를 볼 수 있습니다
- 회원가입으로는 어드민을 만들 수 없습니다. **최초 1명만 SQL로 지정**합니다
- 글·댓글마다 **닉네임과 익명 중 작성자가 선택**합니다. 익명이면 `익명의 윙어` 처럼 축구 포지션이 랜덤 배정됩니다
- 본인이 쓴 글·댓글에는 **'본인' 칩**이 붙습니다. 본인에게만 보입니다
- 조회 기록은 남기지 않습니다

## 회원가입 명세 (확정)

```
[1단계] 이메일 · 비밀번호 · 비밀번호 확인 · 닉네임 · 약관동의
   ↓ 닉네임 중복 확인
   ↓ auth.users 생성(미인증) + 트리거로 profiles 생성
   ↓ 6자리 인증번호 메일 발송
[2단계] 인증번호 입력 → 일치 시 자동 로그인 → 홈
```

| 항목 | 값 |
|---|---|
| 인증번호 유효시간 | 10분 |
| 재발송 쿨다운 | 60초 |
| 인증번호 오입력 제한 | 5회 (초과 시 무효화 후 재발송) |
| 비밀번호 최소 길이 | 8자 |
| 닉네임 형식 | 한글·영문·숫자 2~12자, 특수문자·이모지·공백 불가 |
| 닉네임 중복 검사 | 대소문자·공백 무시 (`lower(nickname)` 유니크 인덱스) |
| 닉네임 예약어 차단 | `익명의` 로 시작 금지, `협회`·`사무국`·`운영`·`관리자`·`admin` 포함 금지 |
| 닉네임 변경 | 허용, 30일 1회 |
| 미인증 계정 정리 | 24시간 후 자동 삭제 |
| 약관 동의 기록 | 동의 시각 + 약관 버전 저장 |
| 만 14세 확인 | 체크박스 한 줄 |
| 이미 가입된 이메일 | 그대로 안내 |
| 가입 CAPTCHA | 없음 (이메일 인증이 대신 막습니다) |
| 비밀번호 찾기 | 재설정 **링크** 메일 자동 발송 |

**인증번호는 Supabase Auth가 발급·만료·대조를 다 합니다.** 직접 테이블을 만들어 구현하지 마세요.
메일 템플릿에서 `{{ .ConfirmationURL }}` 을 `{{ .Token }}` 으로 바꾸면 6자리 숫자가 발송됩니다.

## 메일 발송

Supabase 내장 메일은 시간당 몇 통이라 가입 인증에 못 씁니다. **Custom SMTP** 로 Gmail을 씁니다.

```
Host: smtp.gmail.com
Port: 465
User: godztalkfootball@gmail.com
Pass: (Google 앱 비밀번호 16자리 — 2단계 인증을 켜야 발급 메뉴가 보입니다)
Sender name: 고다지 커뮤니티
```

오픈 전에 도메인을 사서 Resend로 갈아탈 예정입니다. **대시보드 설정만 바꾸면 되고 코드는 안 바뀝니다.**

## 보안에서 반드시 지킬 것

- **`signUp()` 메타데이터는 클라이언트가 마음대로 채웁니다.** 트리거는 거기서 **닉네임만** 읽고 `role` 은 항상 `'user'` 로 하드코딩합니다
- **프로필 수정 RLS는 관리자 승격 통로가 됩니다.** RLS는 행 단위라 "이 컬럼만 못 바꾼다"를 표현하지 못합니다.
  `role` 과 `status` 변경을 막는 **BEFORE UPDATE 트리거**를 함께 겁니다
- **이메일을 `profiles` 에 복사하지 않습니다.** `auth.users` 에만 두고 필요할 때 서버에서 읽습니다
- 닉네임 사전 중복 확인은 **UX용일 뿐 최종 방어선이 아닙니다.** 실제로 막는 건 유니크 제약이고,
  이때 나오는 `Database error saving new user` 를 "이미 사용 중인 닉네임입니다" 로 번역해야 합니다

## Supabase 클라이언트가 세 벌인 이유

`playerlab_web` 은 로그인이 없어서 `lib/supabase.ts` 한 개로 충분했습니다.
여기는 로그인이 핵심이라 세션을 **쿠키**에 넣어야 브라우저와 서버가 같이 볼 수 있습니다. 그래서 `@supabase/ssr` 을 씁니다.

- `src/lib/supabase/client.ts` — 브라우저용 (버튼 클릭, 폼 제출)
- `src/lib/supabase/server.ts` — 서버 컴포넌트용 (목록·상세 조회)
- `src/middleware.ts` — 요청마다 세션 갱신

Flutter로 치면 하나의 클라이언트를 앱 전체에서 공유하던 걸 **실행 위치에 따라 세 개로 나누는** 셈입니다.

## 마이그레이션 규칙

`supabase/migrations/0001_xxx.sql` 처럼 번호순으로 만들고, **주석과 RLS 정책명을 한국어**로 적어
"왜 그렇게 했는지"가 파일만 봐도 남게 합니다.

## 아직 안 정한 것

게시판 단계에 들어갈 때 정합니다.

- 익명 별칭에 쓸 포지션 목록 (원본은 10개, 회원 수 대비 확장 필요)
- 투표·추천 집계 방식과 순공감 100 도달 시 처리
- 신고 처리 상태값
- 도메인 (미정, Vercel 임시 주소로 먼저 배포)
- **개인정보처리방침의 '수집하는 항목' 표가 확정 명세와 다릅니다.**
  원본 시안 기준이라 `아이디`, `회원 구분` 이 적혀 있는데 지금은 닉네임을 받고 회원 구분은 쓰지 않습니다.
  법적 문서라 임의로 안 고치고 그대로 뒀습니다. 오픈 전에 정리해야 합니다.
- 토스트(`.toast`)는 아직 안 만들었습니다. 원본은 여러 기능에서 공통으로 썼으니 상호작용 붙일 때 한 번에 만듭니다.
