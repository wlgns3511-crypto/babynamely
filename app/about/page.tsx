import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About NameBlooms — Methodology, Sources & Editorial Process",
  description:
    "How NameBlooms turns SSA baby-name records into per-page commentary. Data sources, editorial process, what we cover, and what we deliberately don't.",
  alternates: { canonical: "/about/" },
  openGraph: { url: "/about/" },
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <nav className="text-sm text-slate-500 mb-6 not-prose">
        <Link href="/" className="hover:text-purple-700">Home</Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-slate-700">About</span>
      </nav>

      <h1 className="text-3xl font-bold text-purple-700 mb-2">About NameBlooms</h1>
      <p className="text-slate-600 not-prose mb-8">
        A baby-name reference built on Social Security Administration data and per-page editorial commentary.
      </p>

      <p>
        NameBlooms covers <strong>6,782 names</strong> drawn from the US Social Security
        Administration's annual baby-name release (1880–2024), <strong>51 state pages</strong>{" "}
        with state-specific top-10 lists and historical context, <strong>35 year pages</strong>{" "}
        for high-traffic decades, and curated comparisons for the most-searched name pairings. Every
        page is built from the underlying data — we don't generate plausible-sounding paragraphs
        that don't tie back to a verifiable record.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">What we do</h2>
      <ul>
        <li>
          <strong>Per-name pages</strong> — meaning, origin, popularity timeline, peak year, peer
          names that peaked in the same decade, and 7+ FAQ entries with data-derived answers.
        </li>
        <li>
          <strong>State-level analysis</strong> — overlap between each state's top-10 and the
          national top-10, distinctive picks that fall outside the national top-50, and average
          peak-year era profile for the state's top-20.
        </li>
        <li>
          <strong>Year-level snapshots</strong> — #1 boy and girl, top-10 share of all births,
          biggest YoY rank riser, debut count for the year.
        </li>
        <li>
          <strong>Curated comparisons</strong> — 104 head-to-head pages drawn from search-traffic
          evidence and the SSA top-100, deliberately small to avoid scaled thin content.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">What we don't do</h2>
      <ul>
        <li>
          <strong>We don't predict future popularity.</strong> Trajectory readouts come from the
          historical arc, not modeling. When a page says "rising," it means the name's most recent
          decade share is climbing; we do not forecast 2030 rankings.
        </li>
        <li>
          <strong>We don't fabricate cultural commentary.</strong> Era and decade context is
          attached to factual peak years, not invented to fill space. If we don't have data on a
          name's pre-1880 history, we say so rather than inventing etymology.
        </li>
        <li>
          <strong>We don't accept paid placement.</strong> No name appears in our top lists,
          comparison pages, or "similar names" sections because someone paid for it. Placement is
          driven entirely by the SSA record and search-traffic evidence.
        </li>
        <li>
          <strong>We don't cover every possible permutation.</strong> Comparison pages are limited
          to ~104 curated pairs rather than the 22 million theoretically possible — this is a
          deliberate choice against scaled thin content.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data sources</h2>
      <ul>
        <li>
          <strong>SSA national baby names (1880–2024)</strong> — annual release covering every
          first name given to at least 5 babies per gender per year. Names below that threshold are
          excluded by the SSA itself for privacy, not by us.
        </li>
        <li>
          <strong>SSA state-level baby names</strong> — annual state-by-state name frequency
          tables; 51 entries per state per year used for state-page analysis.
        </li>
        <li>
          <strong>Etymology and meaning references</strong> — compiled from authoritative
          onomastic sources. Citations appear on individual name pages where the meaning is
          contested or has multiple traditions.
        </li>
      </ul>
      <p className="text-sm text-slate-600">
        For the exact computation behind each metric (peak share, decade share, rank rise, top-10
        share), see <Link href="/methodology/" className="text-purple-700 underline">our methodology page</Link>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Editorial process</h2>
      <p>
        Every page that includes commentary follows a <strong>FACT → INTERPRETATION → IMPLICATION</strong>{" "}
        pattern: the first sentence cites a verifiable number from the SSA record, the second
        explains what that number tells us about the name in context, and the third draws a
        practical takeaway for parents. Commentary varies deterministically by name slug and page
        key so neighboring pages don't read identically. When new SSA data lands (typically
        mid-May each year), we re-derive every commentary block — old facts don't linger.
      </p>
      <p className="text-sm text-slate-600">
        For the full editorial standards including correction policy, sourcing requirements, and
        author disclosure, see <Link href="/editorial-policy/" className="text-purple-700 underline">our editorial policy</Link>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Update cadence</h2>
      <p>
        The SSA releases new baby-name data each year in mid-May, covering births from the
        previous calendar year. We refresh the database, regenerate all per-page metrics, and
        rebuild the static site within 1–2 weeks of release. Major restructures (new page types,
        new commentary patterns) ship as discrete numbered chunks rather than ad-hoc updates so
        changes are auditable.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p>
        Found an error in a meaning, an etymology, or a popularity figure? Reach us via the{" "}
        <Link href="/contact/" className="text-purple-700 underline">Contact page</Link>. We
        review reader corrections and update the source data when warranted.
      </p>
    </article>
  );
}
