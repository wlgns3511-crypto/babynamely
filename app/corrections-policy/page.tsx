import type { Metadata } from "next";
import { AuthorBox } from "@/components/AuthorBox";
import { CORRECTIONS_REVIEWED } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "Corrections Policy — NameBlooms",
  description:
    "How NameBlooms triages, fixes, and discloses errors — data errors at the SSA OACT upstream, interpretation errors in our CGCI lever and Interpretation Strip classifier, and editorial errors in legal or methodology pages. Reporting channel, response time targets, and SSA OACT contact reference.",
  alternates: { canonical: "/corrections-policy/" },
  openGraph: { url: "/corrections-policy/" },
};

export default function CorrectionsPolicyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Corrections Policy</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last reviewed:{" "}
        <time dateTime={CORRECTIONS_REVIEWED}>{CORRECTIONS_REVIEWED}</time>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Why we publish a corrections policy</h2>
      <p>
        NameBlooms publishes per-name, per-state, per-year, and per-trajectory views of US baby-name
        data. Every popularity figure on the site traces back to a single primary source: the US
        Social Security Administration&apos;s Office of the Chief Actuary (SSA OACT) annual baby-
        name release. Because parents reading our pages make a meaningful real-world decision (what
        to name a child) based on the rank, trajectory, and cohort-share figures we present, we
        treat correction intake, triage, and remediation as a core editorial function and document
        it publicly so readers can verify how we handle reported errors against the SSA OACT record.
      </p>
      <p>
        This policy applies to errors at NameBlooms itself. Errors in the underlying SSA OACT
        national or state-level baby-name files are governed by the SSA&apos;s own publication
        process; we forward upstream-level errors to SSA OACT rather than maintaining a fork of
        the public file.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Three error categories we recognize</h2>
      <p>We triage every reported error into one of three buckets:</p>
      <ol>
        <li>
          <strong>Data error at the SSA OACT upstream.</strong> Example: the SSA OACT national file
          lists a count for a name-year-gender combination that disagrees with another official SSA
          publication; the SSA OACT state-level file shows a name in California that the underlying
          birth-certificate records would not support; a recently released SSA OACT file overwrites
          a prior figure without notation. Because we ingest the SSA OACT national and state files
          verbatim and do not maintain a fork, the most effective fix is at the upstream source. We
          forward these reports to SSA OACT and refresh on our next ingest cycle following the next
          SSA OACT release (typically each May).
        </li>
        <li>
          <strong>Interpretation error in our lever output.</strong> Example: the Cross-Generation
          Cohort Index incorrectly buckets a name because the 12% carry-share threshold computation
          misreads the cohort summation; the Interpretation Strip&apos;s six-category classifier
          assigns "Recent Burst" to a name whose recent-trend signal does not meet the documented
          rule; the dominant-cohort attribution picks the wrong cohort on a tie. These are bugs in
          our code (lib/cohort-index.ts, lib/name-classifier.ts and related modules) computed atop
          the SSA OACT series, and we fix them in source.
        </li>
        <li>
          <strong>Editorial error in static content.</strong> Example: a methodology page misstates
          when an SSA OACT publication schedule shifted; a guide entry confuses the SSA OACT
          national file with the SSA OACT state-level file (they have different 5-count thresholds
          applied separately); an authority citation points to an obsolete SSA OACT URL; a hub
          explainer overstates what cohort-share figures can predict. These are fixed by editing
          the static content and re-deploying.
        </li>
      </ol>

      <h2 className="text-xl font-semibold mt-8 mb-3">How we triage</h2>
      <p>On receiving a reported error, we apply the following triage:</p>
      <ul>
        <li>
          <strong>Severity assessment.</strong> A high-severity error is one that could materially
          mislead a parent about a name&apos;s current rank, peak year, dominant cohort, or
          trajectory archetype — for example, a name page showing a rank that is off by 50+
          positions from the SSA OACT-published figure, or a CGCI bucket assignment that flips a
          Multi-Generation Staple to an Emergent label because of an aggregation bug. High-severity
          errors take priority over other editorial work and are addressed within five business
          days.
        </li>
        <li>
          <strong>Reproducibility check.</strong> We verify the reported error by reading the
          relevant source. For a rank or count claim, we read the SSA OACT national file (at
          ssa.gov/oact/babynames/) and the SSA OACT state-level file directly. For a cohort
          attribution claim, we recompute the cohort-share array from the SSA OACT year-by-year
          series and apply the documented 12% carry-share threshold. We do not fix unreproducible
          reports without first confirming the underlying issue against the SSA OACT record.
        </li>
        <li>
          <strong>Root-cause classification.</strong> We classify the error into one of the three
          buckets above (upstream SSA OACT data, interpretation, editorial). The fix path differs
          by bucket; correctly classifying upfront avoids fixing the wrong layer.
        </li>
        <li>
          <strong>Disclosure decision.</strong> For corrections that materially change a rank
          figure, a CGCI bucket label, an Interpretation Strip category assignment, or an SSA OACT
          citation, we note the change inline on the affected page and update the vintage date.
          Minor typographical fixes do not warrant a separate disclosure; substantive factual
          corrections always do.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Response time targets</h2>
      <p>
        We commit to the following response timelines from receipt of a clear, reproducible error
        report:
      </p>
      <ul>
        <li>
          <strong>High-severity rank, cohort, or trajectory errors:</strong> initial response
          within two business days, fix or upstream forward within five business days. This covers
          cases like a national rank substantially off the SSA OACT-published figure, a state-level
          top-10 list that disagrees with the SSA OACT state file, or a CGCI bucket assignment that
          conflicts with the documented carry-share threshold.
        </li>
        <li>
          <strong>Interpretation-layer bugs (CGCI, Interpretation Strip, trajectory archetype):</strong>{" "}
          fix deployed within fourteen days. The fix typically requires a code change in
          lib/cohort-index.ts or lib/name-classifier.ts, an audit re-run, and production
          verification across name / state / year / trajectory surfaces.
        </li>
        <li>
          <strong>Editorial errors in static content (methodology, guide, about, disclaimer,
          legal):</strong> fix deployed within seven days, faster if the error involves an SSA
          OACT publication-schedule citation or an SSA OACT contact-channel reference.
        </li>
        <li>
          <strong>Upstream SSA OACT data errors:</strong> forwarded to SSA OACT within seven days
          of report. The actual correction timing depends on the SSA OACT release cycle (the SSA
          OACT publishes the baby-name file once per year, typically each May) and is outside our
          direct control. The next NameBlooms ingest cycle picks up the corrected SSA OACT data
          automatically on our next refresh.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">How to report an error</h2>
      <p>
        The fastest way to reach us is via the{" "}
        <a href="/contact/" className="text-purple-700 hover:underline">Contact page</a>. When
        reporting, please include:
      </p>
      <ul>
        <li>
          The URL of the affected page (e.g., /name/emma/, /state/california/, /year/2024/,
          /trajectory/vintage-revival/, /guide/cgci-explainer/).
        </li>
        <li>The specific claim or output you believe is wrong, with a quote or screenshot.</li>
        <li>
          The basis for the correction — a link to the SSA OACT national-file row, a link to the
          SSA OACT state-level file, a published demographic reference, or your own arithmetic
          showing how the cohort-share computation should resolve under the documented 12%
          carry-share threshold.
        </li>
        <li>
          Whether the error is at the SSA OACT upstream (we forward to SSA OACT), in our
          interpretation (we fix in code), or in editorial content (we edit and re-deploy).
        </li>
      </ul>
      <p>
        For SSA OACT data corrections, the most effective fix is filed directly at the SSA OACT
        contact channel at{" "}
        <a
          href="https://www.ssa.gov/oact/babynames/"
          target="_blank"
          rel="noopener noreferrer"
        >
          ssa.gov/oact/babynames
        </a>
        . SSA OACT reviews reported file issues alongside its annual release cycle, and our next
        NameBlooms ingest picks up upstream changes automatically once SSA OACT republishes. If you
        report an upstream-level SSA OACT issue to us, we forward it to the appropriate SSA OACT
        channel.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">What we do not correct on request</h2>
      <p>
        Some reported "errors" are not factual errors and we do not change them on request:
      </p>
      <ul>
        <li>
          <strong>CGCI bucket disagreements.</strong> If a parent or reader disagrees with our
          Cross-Generation Cohort Index bucket assignment (e.g., believes a name should be
          Multi-Generation Staple rather than Cross-Era Classic), we will not move individual names
          outside the published cutoff logic. The cutoffs are documented at{" "}
          ; bucket reassignments would
          undermine the consistency of the lever. We will consider revising the 12% carry-share
          threshold itself if the empirical distribution of US baby-name cohort shares shifts
          substantially or if SSA OACT changes how it aggregates cohort-spanning years.
        </li>
        <li>
          <strong>Interpretation Strip category disagreements.</strong> The six categories
          (Legendary Classic, Vintage Revival, Modern Mainstream, Niche Pick, Fading, Recent Burst)
          are documented at {" "}
          with their qualifying rules. We do not reassign individual names outside the documented
          rules. We do consider revising the rules themselves if the SSA OACT publication
          framework shifts.
        </li>
        <li>
          <strong>SSA OACT 5-occurrence threshold disagreements.</strong> SSA OACT excludes any
          name given to fewer than 5 babies of the same gender in a given year from its public
          national file (and applies the same threshold separately to its state files). We do not
          fill suppressed values on request with interpolated estimates from neighboring years or
          from peer names, because doing so would imply a precision the underlying SSA OACT sample
          does not support. The SSA OACT 5-count threshold is a privacy measure documented by SSA
          OACT itself; NameBlooms inherits it directly.
        </li>
        <li>
          <strong>Cultural or popularity-prediction requests.</strong> We do not forecast future
          rank, future cohort shift, or future SSA OACT-derived popularity. We report what the SSA
          OACT record shows and what the cohort math computes; we do not extrapolate beyond the
          most recent SSA OACT release.
        </li>
        <li>
          <strong>Removal of a name from the catalog.</strong> We do not remove names from the
          catalog on operator or third-party request. The catalog reflects the names SSA OACT has
          published in the public baby-name file; removal requests for individual records should
          be addressed to SSA OACT directly.
        </li>
        <li>
          <strong>Endorsement or de-endorsement of a naming convention.</strong> We will not
          remove or soften citations of SSA OACT, the SSA national file, the SSA OACT state file,
          or any related Census Bureau name resource because a particular reader or advocacy
          organization disagrees with how SSA OACT collects or publishes name data. Our role is to
          compile and decode the SSA OACT record as it stands.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">When we issue a public correction</h2>
      <p>
        We publish a visible correction note on the affected page (with a vintage date update)
        when:
      </p>
      <ul>
        <li>
          A CGCI bucket label changes for one or more names as a result of the correction (for
          example, a fix to the 12% carry-share threshold computation that moves several names
          between buckets).
        </li>
        <li>
          An Interpretation Strip category assignment changes for one or more names as a result of
          a classifier fix.
        </li>
        <li>
          An SSA OACT citation, a SSA OACT URL, or a SSA OACT publication-schedule statement is
          updated to reflect the current SSA OACT release framework.
        </li>
        <li>
          A rank, peak year, peak-share percentage, or state-level top-10 entry changes for a
          specific name as a result of an upstream SSA OACT correction.
        </li>
        <li>
          A methodology page section is revised to reflect a change in how the SSA OACT national
          file or SSA OACT state-level file is ingested, or how the cohort-share computation
          handles boundary years between SSA-defined generation cohorts.
        </li>
      </ul>
      <p>
        Minor typographical and styling fixes do not warrant a separate disclosure. Substantive
        factual corrections, SSA OACT citation updates, and lever-output changes always do. The
        editorial team retains discretion about the form of the disclosure (inline note vs.
        separate changelog) based on how prominent and persistent the affected claim was.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Severe-error escalation</h2>
      <p>
        If you believe NameBlooms has presented information that could lead a reader toward a
        materially wrong decision about naming a child (for instance, a CGCI bucket assignment so
        far off the SSA OACT-derived cohort shares that it would mislead about generational
        prevalence), please escalate via the{" "}
        <a href="/contact/" className="text-purple-700 hover:underline">Contact page</a> with the
        subject line beginning "PRIORITY:". We monitor this channel daily and aim to respond
        within one business day. For any direct concern about how SSA OACT collects, publishes, or
        thresholds baby-name data, contact SSA OACT directly at the public contact channels listed
        on ssa.gov/oact/babynames; SSA OACT has primary authority over the underlying file.
      </p>

      <AuthorBox />
    </article>
  );
}
