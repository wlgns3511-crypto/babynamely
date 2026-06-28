import type { Metadata } from "next";
import { AuthorBox } from "@/components/AuthorBox";
import { EDITORIAL_REVIEWED } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "Editorial Policy — How NameBlooms Publishes Name Data",
  description:
    "How NameBlooms researches, publishes, and corrects baby name data — anchored in the SSA OACT national and SSA OACT state-level files, with documented CGCI and Interpretation Strip classifier rules and a transparent SSA OACT release-cycle refresh cadence.",
  alternates: { canonical: "/editorial-policy/" },
  openGraph: { url: "/editorial-policy/" },
};

export default function EditorialPolicyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Editorial Policy</h1>
      <p className="lead text-lg text-slate-600">
        NameBlooms publishes baby name data so parents can make a meaningful
        decision with grounded information rather than search-engine noise.
        This page explains how we source, write, and revise that material —
        and what we will not do to grow page count.
      </p>

      <h2>Source-first reporting</h2>
      <p>
        Every popularity number on this site originates from the{" "}
        <a
          href="https://www.ssa.gov/oact/babynames/"
          target="_blank"
          rel="noopener noreferrer"
        >
          US Social Security Administration Office of the Chief Actuary (SSA OACT)
          baby name dataset
        </a>{" "}
        — the same SSA OACT record demographers and journalists draw on, with
        the SSA OACT 5-occurrence privacy threshold and the SSA OACT column
        definitions documented at ssa.gov/oact/babynames so that any reader can
        verify the SSA OACT-derived figures on NameBlooms against the SSA OACT
        primary source itself. Origin and
        meaning entries are compiled from established onomastic references,
        primarily{" "}
        <a
          href="https://www.behindthename.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Behind the Name
        </a>{" "}
        and the Oxford Dictionary of First Names. Where references disagree,
        we surface the disagreement on the name page rather than picking a
        single version silently. The exact dataset vintage powering each
        page is shown on the page itself.
      </p>

      <h2>How we publish</h2>
      <ul>
        <li>
          <strong>Data vintage on the page.</strong> Every name page shows
          which SSA release year the popularity numbers are drawn from. We
          do not relabel a stale page with the current year just to look
          fresh.
        </li>
        <li>
          <strong>Method explained, not hidden.</strong> Trend labels
          (classic, rising, falling, vintage revival, new or rare) come
          from a deterministic rule documented on our{" "}
          <a href="/methodology/">methodology page</a>. There is no
          editorial scoring layered on top.
        </li>
        <li>
          <strong>Outbound links to the primary source.</strong> Every name
          page links back to the SSA record and to Behind the Name so a
          reader can verify any number that matters to their decision.
        </li>
        <li>
          <strong>One canonical page per name.</strong> Where derivative
          views exist (for example, middle-name suggestions for a given
          first name), the canonical first-name page remains the indexed
          surface. Derivative views are not announced as separate
          search-result pages.
        </li>
      </ul>

      <h2>Boundary lines we hold</h2>
      <ul>
        <li>
          Author bios reflect a real editor who actually worked on the page.
          The team behind NameBlooms is one editor plus the SSA OACT record
          itself; there are no third-party reviewers and we describe the
          authorship that way on the AuthorBox.
        </li>
        <li>
          The dataset vintage on the page footer matches the SSA OACT
          release the figures came from. If SSA OACT has not published a
          newer release, the page footer reflects the older SSA OACT
          vintage rather than the current calendar year.
        </li>
        <li>
          Derivative views (middle-name suggestions, peer-name lists)
          stay inside the parent name page. We add a derivative URL only
          when the page carries incremental information beyond a
          template-substituted token.
        </li>
        <li>
          Programmatic pages combine structured SSA OACT data with a
          written editorial scaffold an editor wrote and maintains. The
          scaffold is reviewed against the SSA OACT record at every
          refresh cycle.
        </li>
      </ul>

      <h2>Authorship and review</h2>
      <p>
        NameBlooms is operated by a single editor who has worked with US
        Census and SSA name data since 2019. Programmatic pages
        (per-name and per-state) are generated from the SSA dataset using
        a fixed editorial template the editor wrote and maintains. Long-form
        guide and blog content is written and reviewed by the same editor.
        We do not commission ghostwritten or syndicated content.
      </p>

      <h2>Corrections</h2>
      <p>
        If you spot an error in a popularity figure, an etymology, or a
        cultural note, use the{" "}
        <a href="/contact/">contact page</a>. Material corrections are
        reviewed against the underlying SSA release or onomastic source
        and reflected on the page within a reasonable window. We do not
        silently rewrite history — when a correction changes a published
        figure, the page notes the date and the nature of the change.
      </p>

      <h2>Update cadence</h2>
      <p>
        The SSA publishes new baby name data once per year, typically in
        May, covering the previous calendar year. We refresh the dataset
        within days of each release, and the page footer reflects the new
        vintage immediately. Editorial content (guides, blog posts) is
        reviewed at least annually and updated where the underlying
        evidence has shifted.
      </p>

      <h2>Advertising and independence</h2>
      <p>
        NameBlooms displays advertising to fund the editor&apos;s time on
        the dataset. Advertisers do not see articles before publication, do
        not influence which names or trends we cover, and have no input
        into trend labels, methodology, or corrections. There are no paid
        placements, sponsored name entries, or affiliate redirects on data
        pages.
      </p>

      <h2>SSA OACT-derived classifiers: documented rules, not opinions</h2>
      <p>
        On top of the raw SSA OACT national and SSA OACT state-level series, NameBlooms computes
        two editorial classifiers. The Cross-Generation Cohort Index (CGCI) bins every name into
        one of five buckets (Multi-Generation Staple, Cross-Era Classic, Single-Generation Spike,
        Fading Classic, Emergent) based on which of seven SSA / Pew-defined generation cohorts
        carry at least 12% of the name&apos;s all-time SSA OACT-reported births. The Interpretation
        Strip classifier bins each name into one of six interpretation categories based on the
        SSA OACT trajectory shape, the SSA OACT peak year, and the SSA OACT recent-trend slope.
        Both classifiers are documented at /guide/cgci-explainer/ and /guide/interpretation-strip-
        categories/ respectively, with the full SSA OACT cohort summation logic and the 12% carry-
        share threshold spelled out. We change the rules only when SSA OACT changes its publication
        framework, when the empirical SSA OACT distribution shifts substantially, or when a
        reader-help failure case warrants a small adjustment — never silently or per-name.
      </p>

      <h2>SSA OACT refresh cadence</h2>
      <p>
        SSA OACT publishes the baby-name file once per year, typically each May, covering births
        from the previous calendar year. We re-ingest the SSA OACT national file and SSA OACT
        state-level files within days of each SSA OACT release, recompute the CGCI and
        Interpretation Strip classifications against the refreshed SSA OACT series, and update
        the page footer to reflect the new SSA OACT vintage. Between SSA OACT releases the
        figures on NameBlooms reflect the most recently released SSA OACT vintage; we do not
        re-stamp pages with a current date the SSA OACT file does not support.
      </p>

      <h2>Conflict of interest disclosure</h2>
      <p>
        We have no commercial relationship with SSA OACT, the US Census Bureau, Behind the Name,
        or any other source authority we cite. We have no financial relationship with baby-name
        registration services, baby-product retailers, or naming-consultancy operators. The CGCI
        bucket cutoffs and the Interpretation Strip category rules are fixed in source code and
        do not vary by advertiser, and we do not accept payment to surface or suppress any name in
        our top-lists, comparison pages, or hub explainers.
      </p>

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This editorial policy was last reviewed on{" "}
        <time dateTime={EDITORIAL_REVIEWED}>{EDITORIAL_REVIEWED}</time>. Substantive changes are
        noted with a date and a short summary of what changed. The full corrections workflow,
        including SSA OACT upstream-forward rules, lives on the{" "}
        <a href="/corrections-policy/">corrections policy</a> page.
      </p>

      <AuthorBox />
    </article>
  );
}
