import Image from "next/image";

/**
 * 고다지 커뮤니티 엠블럼입니다.
 *
 * 원본 로고 이미지에서 말풍선+공 부분만 잘라 `public/brand-mark.png` 로 두었습니다.
 * 이름 글자는 이미지에 넣지 않고 헤더·푸터의 HTML 텍스트로 유지합니다.
 * 그래야 브랜드명이 바뀌어도 이미지를 다시 만들 필요가 없고, 검색엔진도 이름을 읽습니다.
 *
 * 헤더는 36px(넓은 화면 40px), 푸터는 32px로 쓰며 크기는 CSS의 `.crest` 가 정합니다.
 */
export default function BrandCrest({
  variant = "header",
}: {
  variant?: "header" | "footer";
}) {
  const isFooter = variant === "footer";
  const size = isFooter ? 32 : 40;

  return (
    <Image
      className={isFooter ? undefined : "crest"}
      src="/brand-mark.png"
      alt=""
      width={size}
      height={size}
      // 원본이 정사각형에서 살짝 벗어나 있어서, 눌리지 않게 비율을 지킵니다.
      style={{ objectFit: "contain", flex: "0 0 auto" }}
      priority={!isFooter}
    />
  );
}
