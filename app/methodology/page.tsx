import type { Metadata } from "next";

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

      <h2>Corrections and feedback</h2>
      <p>
        If you find an origin, meaning, or cultural note you believe is
        wrong, please <a href="/contact/">contact us</a> with the name and
        the source you trust. Corrections from careful readers are how we
        improve the dataset.
      </p>

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This methodology page was last reviewed in March 2026. Material
        changes to how we source or compute the data will be reflected
        here before they reach production pages.
      </p>
    </article>
  );
}
