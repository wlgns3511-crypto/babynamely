import type { Metadata } from "next";
import { AuthorBox } from "@/components/AuthorBox";

export const metadata: Metadata = {
  title: "Our Methodology — How NameBlooms Builds Its Baby Name Data",
  description:
    "Exactly how NameBlooms sources its baby name popularity, origins, and meanings — anchored in the US Social Security Administration record and cross-checked against established onomastic references.",
  alternates: { canonical: "/methodology/" },
  openGraph: { url: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Our Methodology</h1>
      <p className="lead text-lg text-slate-600">
        Choosing a name for your child is a big decision, and you deserve to
        know exactly where our popularity numbers and meaning entries come
        from. This page lays it out plainly — our primary source, how we
        compute trends, and what our data does and does not cover.
      </p>

      <h2>Primary source: US Social Security Administration</h2>
      <p>
        Every popularity number you see on NameBlooms is anchored in the{" "}
        <a
          href="https://www.ssa.gov/oact/babynames/"
          target="_blank"
          rel="noopener noreferrer"
        >
          US Social Security Administration&apos;s Baby Names database
        </a>
        . The SSA has published the annual frequency of every first name
        given to at least five US babies since 1880, drawn from Social
        Security card applications. It is the most complete and
        longest-running record of US naming behavior in existence and is
        the source researchers, journalists, and every other baby-name site
        ultimately rely on.
      </p>
      <p>For each name on NameBlooms, we publish:</p>
      <ul>
        <li>the year-by-year count or percentage from the SSA record,</li>
        <li>
          the peak year (the year in which the name saw its highest share
          of US babies),
        </li>
        <li>
          the peak percentage (the share of babies of that sex who
          received the name in its peak year), and
        </li>
        <li>
          a trend label (classic, rising, falling, vintage revival, new or
          rare) derived deterministically from the SSA time series.
        </li>
      </ul>

      <h2>How we classify trend status</h2>
      <p>
        Trend labels are computed from the SSA popularity curve, not from
        editorial opinion. The rules:
      </p>
      <ul>
        <li>
          <strong>Classic</strong> &mdash; in the US top tier consistently
          for multiple decades, including the current period.
        </li>
        <li>
          <strong>Rising</strong> &mdash; current popularity is meaningfully
          higher than it was a decade ago.
        </li>
        <li>
          <strong>Falling</strong> &mdash; current popularity is
          meaningfully lower than its historical average.
        </li>
        <li>
          <strong>Vintage revival</strong> &mdash; the name peaked 60 or
          more years ago, faded, and is now climbing again.
        </li>
        <li>
          <strong>New or rare</strong> &mdash; the name has limited
          historical depth in the SSA record or sits outside the top
          thousand.
        </li>
      </ul>

      <h2>Origins and meanings</h2>
      <p>
        The SSA publishes names, not etymologies. For origin and meaning we
        maintain a curated reference table built from established
        onomastic sources, including:
      </p>
      <ul>
        <li>
          <a
            href="https://www.behindthename.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Behind the Name
          </a>{" "}
          (Mike Campbell) — an academic-quality onomastic database
          with sourced etymologies for names across languages.
        </li>
        <li>
          Oxford Dictionary of First Names — Patrick Hanks &amp;
          Flavia Hodges (Oxford University Press) — the standard
          reference for English first-name origins.
        </li>
        <li>
          <a
            href="https://en.wikipedia.org/wiki/Category:Masculine_given_names"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wikipedia name articles
          </a>{" "}
          — useful for cross-checking cultural and regional notes.
        </li>
      </ul>
      <p>
        When multiple reputable sources disagree about a name&apos;s
        precise origin (a common situation for names that cross language
        families), we lean on the majority view and note the ambiguity in
        the cultural-background section. Every name page links out to
        Behind the Name and Wikipedia so you can verify the meaning
        yourself.
      </p>

      <h2>Cross-reference and verification</h2>
      <p>
        We publish the sources alongside every name page so you can
        double-check any figure that matters to your decision:
      </p>
      <ul>
        <li>
          <a
            href="https://www.ssa.gov/oact/babynames/"
            target="_blank"
            rel="noopener noreferrer"
          >
            SSA Baby Names
          </a>{" "}
          — the official and definitive source for US popularity.
        </li>
        <li>
          <a
            href="https://www.census.gov/topics/population/genealogy.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            US Census Bureau Genealogy
          </a>{" "}
          — historical records for surname context and deep ancestry.
        </li>
        <li>
          <a
            href="https://www.behindthename.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Behind the Name
          </a>{" "}
          — sourced etymologies for given names across languages.
        </li>
      </ul>

      <h2>Update frequency</h2>
      <p>
        The SSA publishes new baby name data once a year, typically in May,
        with data for the previous calendar year. We refresh our dataset
        within days of each SSA release. Every name page shows the vintage
        of the underlying SSA data so you know exactly how fresh the
        popularity numbers are.
      </p>

      <h2>Limitations you should know about</h2>
      <ul>
        <li>
          <strong>US-only popularity.</strong> The SSA record covers names
          given to US babies. If you are choosing a name in another
          country, trends there may differ substantially.
        </li>
        <li>
          <strong>Minimum-count threshold.</strong> The SSA only publishes
          names given to at least five babies in a given year. Very rare
          names may appear sporadically or not at all.
        </li>
        <li>
          <strong>Sex is recorded binary.</strong> The SSA records names
          against the sex marker on the application. Names used across
          sex lines may appear in our data under whichever group is
          larger.
        </li>
        <li>
          <strong>Spelling variants count separately.</strong> In the SSA
          record, &ldquo;Sophia&rdquo; and &ldquo;Sofia&rdquo; are distinct
          entries. Our ranking reflects that — a name may be more
          popular than it looks if you account for common variants.
        </li>
        <li>
          <strong>Not a prediction.</strong> Popularity curves describe the
          past. A name trending upward today may continue to rise or may
          reverse. Use trend labels as context, not as forecasts.
        </li>
      </ul>

      <h2>SSA OACT files we ingest, in detail</h2>
      <p>
        Two SSA OACT files back every popularity figure on NameBlooms. The SSA OACT
        national file covers 1880-present and lists every first name given to at least
        5 babies of the same gender in a given year nationally; this is the SSA OACT
        file behind the per-name pages and behind the all-time peak-year and trajectory
        figures. The SSA OACT state-level file covers ~1910-present across 51
        jurisdictions (50 states + DC) and applies the same 5-occurrence SSA OACT
        privacy threshold separately within each jurisdiction; this is the SSA OACT
        file behind every state page and behind the state-distinctive-pick analysis.
        Both files are public-domain US government datasets published by SSA OACT at
        ssa.gov/oact/babynames with column definitions, the SSA OACT privacy threshold,
        and the file format documented openly by SSA OACT itself.
      </p>

      <h2>Cross-Generation Cohort Index (CGCI): the rule</h2>
      <p>
        On top of the raw SSA OACT national series, NameBlooms computes the
        Cross-Generation Cohort Index (CGCI), a deterministic 5-bucket classifier
        documented at .
        The CGCI rule sums each name&apos;s SSA OACT-reported births within each of
        seven generation cohorts (Lost Generation, Greatest, Silent, Boomers, Gen X,
        Millennials, Gen Z) using the SSA / Pew-defined cohort year boundaries, then
        bins the name based on how many of those seven cohorts carry at least 12% of
        the name&apos;s all-time SSA OACT-reported births: Multi-Generation Staple
        (4+ cohorts qualify), Cross-Era Classic (3 cohorts), Single-Generation Spike
        (1 cohort), Fading Classic (peak cohort is Boomers or earlier), or Emergent
        (peak cohort is Millennials or Gen Z and total SSA OACT-reported births are
        below a small-corpus floor). The 12% carry-share threshold and the 7 SSA /
        Pew cohort boundaries are fixed in source code at lib/cohort-index.ts and
        are not adjusted per-name.
      </p>

      <h2>Interpretation Strip: the rule</h2>
      <p>
        The Interpretation Strip classifier bins each name into one of six
        interpretation categories based on the SSA OACT trajectory shape, the SSA
        OACT peak year, and the SSA OACT recent-trend slope. The six categories are
        Legendary Classic (large all-time SSA OACT corpus + sustained presence
        across many SSA OACT release-years), Vintage Revival (SSA OACT peak ≥60
        years ago but SSA OACT recent slope is positive), Modern Mainstream (SSA
        OACT peak within the last 30 years and still in the top tier of the most
        recent SSA OACT release), Niche Pick (small SSA OACT corpus but stable),
        Fading (SSA OACT recent slope is negative and SSA OACT peak is past), and
        Recent Burst (SSA OACT peak within the last 10 years and recent slope is
        sharply positive). The rule is fixed in source code at
        lib/name-classifier.ts and documented at{" "}
        .
      </p>

      <h2>What CGCI and the Interpretation Strip do not claim</h2>
      <p>
        Both classifiers describe what the SSA OACT record shows; neither predicts
        what the SSA OACT record will show next year. A Multi-Generation Staple is
        a name whose all-time SSA OACT-reported births are spread across many
        cohorts — it is not a guarantee that the next SSA OACT release will continue
        the pattern. A Recent Burst name is one whose SSA OACT recent slope is
        sharply positive — it is not a guarantee of future SSA OACT growth. The
        classifiers are deterministic descriptions of past SSA OACT behavior; they
        are not forecasts.
      </p>

      <h2>Corrections and feedback</h2>
      <p>
        If you find an origin, meaning, or cultural note you believe is
        wrong, please <a href="/contact/">contact us</a> with the name and
        the source you trust. Corrections from careful readers are how we
        improve the dataset. For SSA OACT-derived figures (popularity, peak year,
        trajectory), the full triage workflow against the underlying SSA OACT
        record lives on the <a href="/corrections-policy/">corrections policy</a>{" "}
        page.
      </p>

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This methodology page was last reviewed on April 1, 2026. Material
        changes to how we source or compute the data will be reflected
        here before they reach production pages.
      </p>

      <AuthorBox />
    </article>
  );
}
