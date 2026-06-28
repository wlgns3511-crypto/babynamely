import type { Metadata } from "next";
import { AuthorBox } from "@/components/AuthorBox";
import { DISCLAIMER_REVIEWED } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Disclaimer for NameBlooms — scope of the data, what our SSA OACT-derived analytics do and do not represent, the SSA OACT 5-count privacy threshold, and the limits of our editorial commentary against the underlying SSA OACT record.",
  alternates: { canonical: "/disclaimer/" },
  openGraph: { url: "/disclaimer/" },
};

export default function DisclaimerPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Disclaimer</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last reviewed:{" "}
        <time dateTime={DISCLAIMER_REVIEWED}>{DISCLAIMER_REVIEWED}</time>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Scope of the Site</h2>
      <p>
        NameBlooms is a public-data analytics surface for U.S. baby-name records. Every page is an
        analytical view of one or more publicly available datasets — primarily the US Social Security
        Administration Office of the Chief Actuary (SSA OACT) baby-name file (the SSA OACT national
        file 1880–2024 and the SSA OACT state-level file ~1910–2024) and the U.S. Census Bureau name
        datasets, supplemented by published etymology references for origin and meaning
        annotations. The information is for general informational, research, and family-decision use
        only. While we make every reasonable effort to ensure accuracy, no warranty of completeness,
        timeliness, or suitability for any specific purpose is made.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Not Professional Advice</h2>
      <p>
        Nothing on this website constitutes professional advice of any kind — legal, medical,
        psychological, financial, family-counseling, or otherwise. Decisions like legally registering
        a child&rsquo;s name, navigating a heritage or community-tradition naming convention, or
        handling a name-change request should involve qualified professionals (an attorney, a
        community elder, a registrar) familiar with your specific jurisdiction and circumstances.
        Any reliance on information from this website is strictly at your own risk.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Limitations</h2>
      <p>
        The SSA file excludes any name given to fewer than 5 babies in a year (privacy threshold).
        For very rare or community-specific names, this means the file does not show year-by-year
        counts under that threshold — and may show no data at all for community-bound names. Our
        site reflects what the file contains; it cannot reconstruct what the file omits.
      </p>
      <p>
        Spelling variants are counted as separate names in the SSA file. &ldquo;Aiden&rdquo;,
        &ldquo;Ayden&rdquo;, and &ldquo;Aidan&rdquo; are three distinct rows and we treat them
        as three distinct entries. The aggregate &ldquo;name family&rdquo; count is therefore
        higher than any single spelling&rsquo;s rank suggests.
      </p>
      <p>
        Origin classifications are based on majority etymological references; some names have
        contested or multiple-rooted etymologies, and we document the most-cited root rather than
        enumerating all possibilities. Origin is also distinct from current cultural use — a name
        of, say, Hebrew origin may be most commonly used outside the Hebrew-speaking community, and
        vice versa.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Trajectory Archetypes &amp; Cohort Index</h2>
      <p>
        Our trajectory archetypes (modern, vintage, classic, burst, climber, ancient, fading,
        steady) and Cross-Generation Cohort Index (multi-gen-staple, cross-era-classic,
        single-gen-spike, fading-classic, emergent) are <em>derived</em> classifications computed
        from the underlying SSA series. They are descriptive, not prescriptive: they describe the
        shape of the popularity curve as observed, not the social meaning or future trajectory of
        the name. A name&rsquo;s archetype can shift over time as new data arrives.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">External Links and Citations</h2>
      <p>
        We link out to primary sources (SSA, Census, Wikipedia, Behind the Name) and other
        external references for verification purposes. We have no control over the content,
        privacy practices, or availability of any third-party site. Following an external link
        is at your own discretion.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Advertising and Sponsored Content</h2>
      <p>
        NameBlooms displays advertisements served by third-party ad networks, including Google
        AdSense. Advertisements are selected and served by the network using its own targeting
        rules and your browser settings. The presence of an ad does not constitute an endorsement
        by NameBlooms of the advertised product or service. We do not currently accept paid
        sponsorships, paid product placements, or affiliate-revenue link insertions in editorial
        content; if that policy ever changes, it will be disclosed clearly here and on the
        editorial-policy page.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Limitation of Liability</h2>
      <p>
        In no event shall NameBlooms, its editorial team, the DataPeek Research Network, its
        contributors, or its hosting partners be liable for any direct, indirect, incidental,
        consequential, or punitive damages arising from your use of this website, the information
        contained on it, or any classification or commentary derived from it.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">SSA OACT as the single primary source</h2>
      <p>
        NameBlooms anchors every rank, percentage, peak-year, and trajectory figure to the US
        Social Security Administration&apos;s Office of the Chief Actuary (SSA OACT) baby-name
        files. The SSA OACT national file (1880-present, ~6,782 name-gender combinations covered
        per year on NameBlooms) and the SSA OACT state-level file (51 jurisdictions, ~1910-present)
        are the only datasets the popularity figures on this site originate from. The SSA OACT
        national file and the SSA OACT state file each apply the same 5-occurrence privacy
        threshold (a name given to fewer than 5 babies of the same gender in a given year is
        suppressed from the published SSA OACT file). Because the SSA OACT national and state
        files apply this threshold <em>independently</em>, a name with 3 occurrences in California
        and 3 in Texas (6 total) might appear in the SSA OACT national file but in neither SSA
        OACT state file. We surface what the SSA OACT files contain; we cannot reconstruct what
        the SSA OACT files omit.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">SSA OACT refresh cadence</h2>
      <p>
        SSA OACT publishes the baby-name file once per year, typically each May, covering births
        from the previous calendar year. Between SSA OACT releases the figures on NameBlooms
        reflect the most recently released SSA OACT vintage. We re-ingest the SSA OACT national
        and SSA OACT state files within days of each SSA OACT release, and the page footer on
        every name page reflects the SSA OACT vintage immediately. We do not relabel a stale page
        with the current year to look fresh; if the SSA OACT file has not been updated, the page
        footer reflects the SSA OACT vintage at the time of the last refresh.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">CGCI and Interpretation Strip are NameBlooms editorial constructs</h2>
      <p>
        The Cross-Generation Cohort Index (CGCI) bucket labels (Multi-Generation Staple, Cross-Era
        Classic, Single-Generation Spike, Fading Classic, Emergent) shown on every /name/ page and
        the six Interpretation Strip categories (Legendary Classic, Vintage Revival, Modern
        Mainstream, Niche Pick, Fading, Recent Burst) are NameBlooms editorial classifiers computed
        from the underlying SSA OACT year-by-year series. They are <strong>not</strong> SSA
        OACT-published fields. The 12% carry-share threshold used by the CGCI classifier, the
        seven SSA / Pew-defined generation cohorts on which the CGCI portfolio is computed, and
        the six Interpretation Strip rule boundaries are choices made by the NameBlooms Editorial
        Team. Readers who want to verify the rules can read{" "}
        {" "}
        and{" "}
        {" "}
        or inspect lib/cohort-index.ts and lib/name-classifier.ts in the NameBlooms source.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact and corrections</h2>
      <p>
        If you spot a data error, a misclassified archetype, an SSA OACT citation that no longer
        resolves, or any other content concern, send a correction request via the{" "}
        <a href="/contact/" className="text-purple-700 hover:underline">contact page</a>.
        Include the URL of the page and the specific data point or sentence in question. The full
        correction workflow (severity assessment against the SSA OACT record, response time
        targets, what we will and will not correct on request, when we issue a public correction
        note) is documented on the{" "}
        <a href="/corrections-policy/" className="text-purple-700 hover:underline">corrections policy</a>{" "}
        page. We publish corrections promptly and openly and we do not silently rewrite history.
      </p>

      <AuthorBox />
    </article>
  );
}
