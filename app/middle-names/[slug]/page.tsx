import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNameBySlug, getMiddleNameSuggestions, getStaticMiddleNameSlugs, getRelatedMiddleNames, countSyllables } from "@/lib/db";
import { genderColor, genderBg } from "@/lib/format";
import { breadcrumbSchema } from "@/lib/schema";
import { TrustBlock } from "@/components/upgrades/TrustBlock";
import { InsightBlock } from "@/components/upgrades/InsightBlock";
import { FeedbackButton } from '@/components/upgrades/FeedbackButton';
import { TableOfContents } from "@/components/upgrades/TableOfContents";
import { RelatedEntities } from "@/components/upgrades/RelatedEntities";
import { MiddleNameCalculator } from "@/components/MiddleNameCalculator";
import { FAQ } from "@/components/FAQ";
import { AuthorBox } from "@/components/AuthorBox";
import { TRUST_BLOCK_SOURCES, DB_UPDATED } from "@/lib/authorship";
import { isIndexableNameSlug } from "@/lib/index-status";

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;
export const revalidate = 86400;

// 2026-07-24 재건. prerender = 수요(Bing)∩keep 상위 100(getStaticMiddleNameSlugs).
// dynamicParams=false → 그 밖 슬러그는 404, 미들웨어가 그 전에 410 으로 잡는다.
export async function generateStaticParams() {
  return getStaticMiddleNameSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = getNameBySlug(slug);
  if (!n) return {};
  return {
    title: `Best Middle Names for ${n.name} (${n.gender === 'boy' ? 'Boy' : 'Girl'})`,
    description: `Looking for the perfect middle name for ${n.name}? Browse 20 middle name ideas matched to ${n.name} by syllable rhythm, sound, and era.`,
    alternates: { canonical: `/middle-names/${slug}/` },
    openGraph: { url: `/middle-names/${slug}/` },
    robots: { index: true, follow: true },
  };
}

export default async function MiddleNamesPage({ params }: Props) {
  const { slug } = await params;
  const firstName = getNameBySlug(slug);
  if (!firstName) notFound();

  const suggestions = getMiddleNameSuggestions(firstName, 20);

  // 2026-07-26 — keep 은 이제 클릭 earner 를 name-keep 밖에서도 살린다(59장). 그 이름들의
  // /name/<slug>/ 는 410 이라 링크·breadcrumb 에서 빼야 한다. 제안 목록은 getKeptNames()
  // 기반이라 원래 안전하다.
  const hasNamePage = isIndexableNameSlug(firstName.slug);

  const faqs = [
    {
      question: `What are good middle names for ${firstName.name}?`,
      answer: `Middle names that pair well with ${firstName.name} include ${suggestions.slice(0, 10).map(s => s.name).join(', ')}. These are matched to ${firstName.name} by syllable rhythm, ending sound, and era rather than raw popularity.`,
    },
    {
      question: `How do I choose a middle name for ${firstName.name}?`,
      answer: `Consider the flow of the full name, avoid matching first letters, and try names with a different syllable count than ${firstName.name} for a balanced sound.`,
    },
    {
      question: `Is ${firstName.name} a ${firstName.gender === 'boy' ? 'boy' : 'girl'} name?`,
      answer: `Yes, ${firstName.name} is a ${firstName.gender} name${firstName.origin ? ` of ${firstName.origin} origin` : ''}${firstName.meaning ? ` meaning "${firstName.meaning}"` : ''}.`,
    },
  ];

  const fSyl = countSyllables(firstName.name);
  const insights = [
    {
      text: `The name "${firstName.name}" has ${fSyl} ${fSyl === 1 ? 'syllable' : 'syllables'}. Phonetic styling suggests pairing it with a middle name of different syllable length (e.g. ${fSyl === 2 ? '1 or 3 syllables' : '2 syllables'}) for the best rhythmic balance.`,
      sentiment: "neutral" as const,
    },
    {
      text: `Our pairings favor middle names that peaked in a similar era to "${firstName.name}"${firstName.peak_year ? ` (around ${firstName.peak_year})` : ''}, so the first-and-middle combination reads as one coherent style instead of a mismatch of decades.`,
      sentiment: "positive" as const,
    },
    {
      text: `To avoid clashing sounds, the list below excludes middle names that start with the ending letter/sound of "${firstName.name}".`,
      sentiment: "neutral" as const,
    },
  ];

  const trustSources = TRUST_BLOCK_SOURCES.map((s) => ({
    name: s.name,
    url: s.url,
  }));

  const related = getRelatedMiddleNames(slug, firstName.gender, 6);
  const relatedItems = related.map((s) => ({
    name: s.name,
    href: `/middle-names/${s.slug}/`,
    stat: `${s.origin || "Popular"} Name`,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: 'Home', url: '/' },
        ...(hasNamePage ? [{ name: firstName.name, url: `/name/${firstName.slug}/` }] : []),
        { name: `Middle Names for ${firstName.name}`, url: `/middle-names/${slug}/` },
      ])) }} />
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.answer,
                },
              })),
            }),
          }}
        />
      )}

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:text-purple-600">Home</a>
        <span className="mx-1">/</span>
        {hasNamePage ? (
          <>
            <a href={`/name/${firstName.slug}/`} className="hover:text-purple-600">{firstName.name}</a>
            <span className="mx-1">/</span>
          </>
        ) : null}
        <span className="text-slate-800">Middle Names</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2 text-slate-900">
        Best Middle Names for <span className={genderColor(firstName.gender)}>{firstName.name}</span>
      </h1>
      <p className="text-slate-600 mb-6">
        {firstName.name} is a {firstName.gender === 'boy' ? 'boy' : 'girl'}&apos;s name
        {firstName.origin ? ` of ${firstName.origin} origin` : ''}
        {firstName.meaning ? ` meaning "${firstName.meaning}"` : ''}.
        Here are 20 middle names matched to {firstName.name} by rhythm, sound, and era.
      </p>

      <TrustBlock sources={trustSources} updated={DB_UPDATED} methodologyUrl="/methodology/" label="Verified U.S. Registry" />

      <TableOfContents />

      <InsightBlock entityName={firstName.name} heading="Phonetic & Origin Key Insights" insights={insights} />
      {/* Middle Name Suggestions */}
      <h2 id="middle-name-suggestions" className="text-xl font-bold mb-4 text-slate-900">Popular Middle Name Pairings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {suggestions.map((s, i) => (
          <div key={s.slug} className={`${genderBg(firstName.gender)} rounded-lg p-4 border border-slate-100`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold text-slate-900">{firstName.name} {s.name}</span>
                <span className="text-sm text-slate-400 ml-2">#{i + 1}</span>
              </div>
              <a href={`/name/${s.slug}/`} className="text-sm text-purple-600 hover:underline">
                View {s.name} →
              </a>
            </div>
            {s.meaning && (
              <p className="text-sm text-slate-500 mt-1">{s.name}: {s.meaning}</p>
            )}
          </div>
        ))}
      </div>

      <MiddleNameCalculator firstName={firstName.name} gender={firstName.gender} />

      {/* Tips */}
      <section className="mt-8 bg-purple-50 border border-purple-100 rounded-lg p-5">
        <h2 className="text-lg font-bold mb-2 text-purple-900">Tips for Choosing a Middle Name</h2>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>Say the full name out loud to test the flow</li>
          <li>Avoid names that rhyme with {firstName.name}</li>
          <li>Consider a different number of syllables for balance</li>
          <li>Check the initials don&apos;t spell anything unintended</li>
          <li>Family names or meaningful names make great middle names</li>
        </ul>
      </section>

      <FAQ items={faqs} />

      <RelatedEntities entityName={firstName.name} items={relatedItems} heading={`Explore Middle Names for Similar Names`} />

      {/* Back link */}
      <div className="mt-8 border-t border-slate-200 pt-6">
        {hasNamePage ? (
          <a href={`/name/${firstName.slug}/`} className="text-purple-600 hover:underline">
            ← Back to {firstName.name} details
          </a>
        ) : (
          <a href={`/names/year/${firstName.peak_year ?? 2024}/`} className="text-purple-600 hover:underline">
            ← {firstName.name} in the {firstName.peak_year ?? 2024} SSA ranking
          </a>
        )}
      </div>

            <FeedbackButton />
      <AuthorBox />
    </div>
  );
}
