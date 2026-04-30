import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Policy — How NameBlooms Publishes Name Data",
  description:
    "How NameBlooms researches, publishes, and corrects baby name data. Source-first reporting, named methodology, and a transparent record of the dataset vintage we publish against.",
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
          US Social Security Administration baby name dataset
        </a>{" "}
        — the same record demographers and journalists draw on. Origin and
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

      <h2>What we do not do</h2>
      <ul>
        <li>
          We do not invent expert credentials. Pages do not carry fabricated
          author bios, fake doctorates, or claims of professional review
          that did not happen.
        </li>
        <li>
          We do not relabel last year&apos;s SSA data with this year&apos;s
          headline. If the dataset has not been updated, the page says so.
        </li>
        <li>
          We do not auto-generate page variants whose only difference is a
          template-substituted token (state, year, gender) without
          incremental information. When a derivative would be thin, we keep
          it inside the parent page rather than minting a new URL.
        </li>
        <li>
          We do not publish AI-only content. Programmatic pages combine
          structured SSA data with a written editorial scaffold that a
          human author has reviewed.
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

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This editorial policy was last reviewed in April 2026. Substantive
        changes will be noted with a date and a short summary of what
        changed.
      </p>
    </article>
  );
}
