import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_PAGES, sitePageOf } from "@/lib/site-pages";
import AboutPage from "@/components/pages/AboutPage";
import OrgPage from "@/components/pages/OrgPage";
import BizPage from "@/components/pages/BizPage";
import RulesPage from "@/components/pages/RulesPage";
import TermsPage from "@/components/pages/TermsPage";
import PrivacyPage from "@/components/pages/PrivacyPage";
import AdsPage from "@/components/pages/AdsPage";
import ContactPage from "@/components/pages/ContactPage";

/**
 * 협회 정적 페이지 8개입니다. 원본 시안의 `v-page` 뷰에 해당합니다.
 *
 * 머리말은 `SITE_PAGES` 에서 오고, 본문은 페이지마다 짜임새가 완전히 달라서
 * slug와 컴포넌트를 1:1로 짝지어 둡니다. 여기 없는 주소는 404가 됩니다.
 */
const BODIES: Record<string, () => React.JSX.Element> = {
  about: AboutPage,
  org: OrgPage,
  biz: BizPage,
  rules: RulesPage,
  terms: TermsPage,
  privacy: PrivacyPage,
  ads: AdsPage,
  contact: ContactPage,
};
export function generateStaticParams() {
  return SITE_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/page/[slug]">) {
  const { slug } = await props.params;
  const page = sitePageOf(slug);
  if (!page) return {};
  return { title: `${page.title} — 고다지 커뮤니티`, description: page.desc };
}

export default async function SitePageView(props: PageProps<"/page/[slug]">) {
  const { slug } = await props.params;
  const page = sitePageOf(slug);
  const Body = BODIES[slug];
  if (!page || !Body) notFound();

  return (
    <section className="view on">
      <div className="cols">
        <div>
          <div className="pg-hd">
            <div className="eyebrow">{page.en}</div>
            <h1>{page.title}</h1>
            <p>{page.desc}</p>
          </div>
          <div className="card">
            <Body />
          </div>
        </div>

        <aside className="side">
          <div className="card">
            <div className="card-hd">
              <span className="spine" />
              <h3>협회 안내</h3>
            </div>
            <div className="card-bd">
              <ul className="rank">
                {SITE_PAGES.map((p, i) => (
                  <li key={p.slug}>
                    <Link href={`/page/${p.slug}`}>
                      <span className="rk-n">{String(i + 1).padStart(2, "0")}</span>
                      <span>
                        <span
                          className="rk-t"
                          style={p.slug === slug ? { color: "var(--mint-d)" } : undefined}
                        >
                          {p.title}
                        </span>
                        <span className="rk-m">{p.en}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
