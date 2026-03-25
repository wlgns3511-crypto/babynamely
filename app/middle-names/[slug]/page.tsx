import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNameBySlug, getMiddleNameSuggestions, getTopNamesForMiddleNames } from "@/lib/db";
import { genderColor, genderBg } from "@/lib/format";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = true;

export async function generateStaticParams() {
  return getTopNamesForMiddleNames(2000).map(n => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = getNameBySlug(slug);
  if (!n) return {};
  return {
    title: `Best Middle Names for ${n.name} (${n.gender === 'boy' ? 'Boy' : 'Girl'})`,
    description: `Looking for the perfect middle name for ${n.name}? Browse 20 popular middle name ideas that pair beautifully with ${n.name}.`,
    alternates: { canonical: `/middle-names/${slug}/` },
  };
}

export default async function MiddleNamesPage({ params }: Props) {
  const { slug } = await params;
  const firstName = getNameBySlug(slug);
  if (!firstName) notFound();

  const suggestions = getMiddleNameSuggestions(firstName, 20);
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nameblooms.com';

  const faqs = [
    {
      question: `What are good middle names for ${firstName.name}?`,
      answer: `Popular middle names for ${firstName.name} include ${suggestions.slice(0, 5).map(s => s.name).join(', ')}. These names complement ${firstName.name} in sound and style.`,
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: firstName.name, url: `/name/${firstName.slug}` },
        { name: `Middle Names for ${firstName.name}`, url: `/middle-names/${slug}/` },
      ])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:text-purple-600">Home</a>
        <span className="mx-1">/</span>
        <a href={`/name/${firstName.slug}`} className="hover:text-purple-600">{firstName.name}</a>
        <span className="mx-1">/</span>
        <span className="text-slate-800">Middle Names</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        Best Middle Names for <span className={genderColor(firstName.gender)}>{firstName.name}</span>
      </h1>
      <p className="text-slate-600 mb-6">
        {firstName.name} is a {firstName.gender === 'boy' ? 'boy' : 'girl'}&apos;s name
        {firstName.origin ? ` of ${firstName.origin} origin` : ''}
        {firstName.meaning ? ` meaning "${firstName.meaning}"` : ''}.
        Here are 20 middle names that pair beautifully with {firstName.name}.
      </p>

      {/* Middle Name Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {suggestions.map((s, i) => (
          <div key={s.slug} className={`${genderBg(firstName.gender)} rounded-lg p-4 border border-slate-100`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold">{firstName.name} {s.name}</span>
                <span className="text-sm text-slate-400 ml-2">#{i + 1}</span>
              </div>
              <a href={`/name/${s.slug}`} className="text-sm text-purple-600 hover:underline">
                View {s.name} →
              </a>
            </div>
            {s.meaning && (
              <p className="text-sm text-slate-500 mt-1">{s.name}: {s.meaning}</p>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      <section className="mt-8 bg-purple-50 border border-purple-100 rounded-lg p-5">
        <h2 className="text-lg font-bold mb-2">Tips for Choosing a Middle Name</h2>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>Say the full name out loud to test the flow</li>
          <li>Avoid names that rhyme with {firstName.name}</li>
          <li>Consider a different number of syllables for balance</li>
          <li>Check the initials don&apos;t spell anything unintended</li>
          <li>Family names or meaningful names make great middle names</li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="border border-slate-200 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer font-medium hover:bg-slate-50">{faq.question}</summary>
              <p className="px-4 pb-3 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Back link */}
      <div className="mt-8">
        <a href={`/name/${firstName.slug}`} className="text-purple-600 hover:underline">
          ← Back to {firstName.name} details
        </a>
      </div>
    </>
  );
}
