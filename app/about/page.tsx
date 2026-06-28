import type { Metadata } from "next";
import Link from "next/link";
import { AuthorBox } from "@/components/AuthorBox";

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
          <strong>Cultural commentary is tied to factual peak years.</strong> Era and decade
          context is anchored to the SSA OACT peak year, not added to fill space. For a name
          with no pre-1880 SSA OACT presence, the page says so and stops there rather than
          extending the etymology speculatively.
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

      <h2 className="text-xl font-semibold mt-8 mb-3">SSA OACT as the single primary source</h2>
      <p>
        Every rank, percentage, peak year, and trajectory figure on NameBlooms originates from the
        US Social Security Administration&apos;s Office of the Chief Actuary (SSA OACT) annual
        baby-name release. Two SSA OACT files back the site: the SSA OACT national file (1880-
        present, covering every first name given to at least 5 babies of the same gender per year
        nationally) and the SSA OACT state-level file (51 jurisdictions, ~1910-present, applying
        the same SSA OACT 5-count threshold separately to each state). The SSA OACT national file
        and the SSA OACT state files are public-domain US government datasets. SSA OACT publishes
        the methodology, the column definitions, and the 5-count privacy threshold openly at
        ssa.gov/oact/babynames so any reader can verify how the SSA OACT figures behind any
        NameBlooms page were collected and what they omit.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">SSA OACT-derived levers atop the raw record</h2>
      <p>
        On top of the SSA OACT record we compute two NameBlooms editorial classifiers. The Cross-
        Generation Cohort Index (CGCI) bins each name into one of five buckets (Multi-Generation
        Staple, Cross-Era Classic, Single-Generation Spike, Fading Classic, Emergent) based on
        which SSA / Pew-defined generation cohorts carry at least 12% of the name&apos;s all-time
        SSA OACT-reported births. The Interpretation Strip classifier bins each name into one of
        six interpretation categories (Legendary Classic, Vintage Revival, Modern Mainstream,
        Niche Pick, Fading, Recent Burst) based on the name&apos;s SSA OACT trajectory shape. Both
        classifiers are NameBlooms editorial constructs computed from the SSA OACT series; they
        are not SSA OACT-published fields. We document the rules at /guide/cgci-explainer/ and
        /guide/interpretation-strip-categories/ so any reader can verify the math against the
        underlying SSA OACT record.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">SSA OACT refresh cadence and dataset vintage</h2>
      <p>
        SSA OACT publishes the baby-name file once per year, typically each May, covering births
        from the previous calendar year. We re-ingest the SSA OACT national file and the SSA OACT
        state-level files within days of each SSA OACT release. The page footer on every name
        page shows the SSA OACT vintage (the SSA OACT release date) so a reader can see at a
        glance how fresh the SSA OACT-derived figures are. Between SSA OACT releases, we do not
        re-stamp pages with a current date that the SSA OACT file does not support.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact and corrections</h2>
      <p>
        Found an error in a meaning, an etymology, an SSA OACT-derived popularity figure, a CGCI
        bucket assignment, or an Interpretation Strip category label? Reach us via the{" "}
        <Link href="/contact/" className="text-purple-700 underline">Contact page</Link>. Our
        full correction workflow is documented on the{" "}
        <Link href="/corrections-policy/" className="text-purple-700 underline">corrections policy</Link>{" "}
        page, including how we triage SSA OACT upstream errors versus interpretation-layer bugs
        and how we forward SSA OACT-level concerns to SSA OACT directly.
      </p>

      <AuthorBox />
    </article>
  );
}
