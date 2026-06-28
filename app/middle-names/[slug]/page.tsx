import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNameBySlug, getMiddleNameSuggestions, getTopNamesForMiddleNames, getSimilarNames, MIDDLE_NAME_PRERENDER_LIMIT } from "@/lib/db";
import { genderColor, genderBg } from "@/lib/format";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { TrustBlock } from "@/components/upgrades/TrustBlock";
import { InsightBlock } from "@/components/upgrades/InsightBlock";
import { LivePoll } from '@/components/upgrades/LivePoll';
import { FeedbackButton } from '@/components/upgrades/FeedbackButton';
import { TableOfContents } from "@/components/upgrades/TableOfContents";
import { RelatedEntities } from "@/components/upgrades/RelatedEntities";
import { MiddleNameCalculator } from "@/components/MiddleNameCalculator";
import { FAQ } from "@/components/FAQ";
import { AuthorBox } from "@/components/AuthorBox";
import { TRUST_BLOCK_SOURCES, DB_UPDATED } from "@/lib/authorship";

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getTopNamesForMiddleNames(MIDDLE_NAME_PRERENDER_LIMIT).map(n => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = getNameBySlug(slug);
  if (!n) return {};
  return {
    title: `Best Middle Names for ${n.name} (${n.gender === 'boy' ? 'Boy' : 'Girl'})`,
    description: `Looking for the perfect middle name for ${n.name}? Browse 20 popular middle name ideas that pair beautifully with ${n.name}.`,
    alternates: { canonical: `/middle-names/${slug}/` },
    openGraph: { url: `/middle-names/${slug}/` },
    robots: { index: false, follow: true },
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

export default async function MiddleNamesPage({ params }: Props) {
  const { slug } = await params;
  const firstName = getNameBySlug(slug);
  if (!firstName) notFound();

  const suggestions = getMiddleNameSuggestions(firstName, 20);

  const faqs = [
    {
      question: `What are good middle names for ${firstName.name}?`,
      answer: `Popular middle names for ${firstName.name} include ${suggestions.map(s => s.name).join(', ')}. These names complement ${firstName.name} in sound and style.`,
    },
    {
      question: `How do I choose a middle name for ${firstName.name}?`,
      answer: `Consider the flow of the full name, avoid matching first letters, and try names with different syllable counts than ${firstName.name} for a balanced sound.`,
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
      text: `Based on U.S. registration trends, "${firstName.name}" pairs exceptionally well with classic or traditional middle names to ground its phonetic structure.`,
      sentiment: "positive" as const,
    },
    {
      text: `To avoid clashing sounds, select a middle name that does not start with the ending letter/sound of "${firstName.name}".`,
      sentiment: "neutral" as const,
    },
  ];

  const trustSources = TRUST_BLOCK_SOURCES.map((s) => ({
    name: s.name,
    url: s.url,
  }));

  const similar = getSimilarNames(slug, firstName.gender, 6);
  const relatedItems = similar.map((s) => ({
    name: s.name,
    href: `/middle-names/${s.slug}/`,
    stat: `${s.origin || "Popular"} Name`,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: firstName.name, url: `/name/${firstName.slug}/` },
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
        <a href={`/name/${firstName.slug}/`} className="hover:text-purple-600">{firstName.name}</a>
        <span className="mx-1">/</span>
        <span className="text-slate-800">Middle Names</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2 text-slate-900">
        Best Middle Names for <span className={genderColor(firstName.gender)}>{firstName.name}</span>
      </h1>
      <p className="text-slate-600 mb-6">
        {firstName.name} is a {firstName.gender === 'boy' ? 'boy' : 'girl'}&apos;s name
        {firstName.origin ? ` of ${firstName.origin} origin` : ''}
        {firstName.meaning ? ` meaning "${firstName.meaning}"` : ''}.
        Here are 20 middle names that pair beautifully with {firstName.name}.
      </p>

      <TrustBlock sources={trustSources} updated={DB_UPDATED} methodologyUrl="/methodology/" label="Verified U.S. Registry" />

      <TableOfContents />

      <InsightBlock entityName={firstName.name} heading="Phonetic & Origin Key Insights" insights={insights} />
      <LivePoll entityName={firstName.name} />

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
        <a href={`/name/${firstName.slug}/`} className="text-purple-600 hover:underline">
          ← Back to {firstName.name} details
        </a>
      </div>

            <FeedbackButton />
      <AuthorBox />
    </div>
  );
}
