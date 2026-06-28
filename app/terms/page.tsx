import type { Metadata } from "next";
import { AuthorBox } from "@/components/AuthorBox";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for NameBlooms — usage rules, content licensing, third-party advertising, liability limits, and how disputes are resolved.",
  alternates: { canonical: "/terms/" },
  openGraph: { url: "/terms/" },
};

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Terms of Service</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: April 1, 2026</p>

      <p>
        Welcome to NameBlooms. These Terms of Service govern your access to and use of nameblooms.com,
        operated by the NameBlooms Editorial Team as part of the DataPeek Research Network. By accessing
        or using our website, you agree to be bound by these terms in full. If you do not agree, please
        discontinue use of the site.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Eligible Use</h2>
      <p>
        NameBlooms publishes baby name data, meanings, origins, classification archetypes, cohort
        indices, and popularity trends derived from publicly available datasets — primarily the U.S.
        Social Security Administration baby-name files (1880–2024) and U.S. Census Bureau name
        datasets. The site is intended for personal, non-commercial research and family-decision use.
        Use by individuals under the age of 13 should be supervised by a parent or guardian.
      </p>
      <p>
        You agree not to (a) scrape, mirror, or republish bulk content; (b) attempt to circumvent
        rate limits, access controls, or paywalls if any are added in the future; (c) submit
        automated traffic that materially exceeds typical browser usage; or (d) misrepresent the
        site as your own work or commission for resale.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Accuracy of Data</h2>
      <p>
        We invest substantial effort in cross-referencing every name entry against the SSA national
        and state files plus auxiliary etymology references. Despite that effort, all data on this
        site is provided <strong>&ldquo;as is&rdquo;</strong> without warranty of completeness or
        accuracy. Naming choices are deeply personal — please verify any data point that materially
        affects a real-world decision (e.g., legal name registration, ethnic-community
        consultation, family-tradition decisions) against primary sources before acting on it.
      </p>
      <p>
        We publish a methodology document at <a href="/methodology/" className="text-purple-600 hover:underline">/methodology/</a> describing how
        we ingest, transform, and classify the underlying data. If you find an error, please send
        a correction request via the <a href="/contact/" className="text-purple-600 hover:underline">contact page</a>; we publish corrections
        promptly and openly.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Intellectual Property</h2>
      <p>
        Original analytical work — including but not limited to: trajectory archetype
        classifications, Cross-Generation Cohort Index buckets, interpretation strip categorizations,
        editorial commentary, page layout, and visual design — is the property of NameBlooms and
        is protected by copyright, trademark, and other applicable intellectual property laws.
      </p>
      <p>
        Underlying source data (SSA, U.S. Census Bureau, public-domain etymology references) is
        not our property; we cite each source on the relevant page. Where source data is published
        under a Creative Commons or public-domain license, we honor that license and you may use
        the underlying data under the same terms — but our derived analytics, commentary, and
        layout are our own work and require attribution if reused.
      </p>
      <p>
        You may quote brief excerpts (under 200 words per quotation) for non-commercial review,
        academic, or journalistic purposes with attribution to nameblooms.com. Bulk reuse,
        commercial republication, or AI-training ingestion requires written permission.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Third-Party Links and Advertising</h2>
      <p>
        We display advertisements served by third-party ad networks, including Google AdSense.
        These advertisements are selected and served by the ad network based on its own targeting
        rules and your browser settings — we do not select individual ads. Your interactions with
        third-party advertisers are solely between you and the advertiser. We may also link out
        to third-party sources (SSA, Census, Wikipedia, etymology dictionaries) for verification
        purposes; we are not responsible for the content or privacy practices of those external
        sites.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, NameBlooms, its editorial team, and the DataPeek
        Research Network shall not be liable for any indirect, incidental, special, consequential,
        or punitive damages arising from or related to your use of this website — including, but
        not limited to, damages for loss of profits, lost data, naming-decision regret, classroom-overlap
        outcomes, or any other intangible loss. The site is informational; we are not a legal,
        medical, psychological, or family-counseling service.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Changes to These Terms</h2>
      <p>
        We may revise these Terms of Service from time to time. Material revisions will be
        announced at the top of this page and accompanied by a new &ldquo;Last updated&rdquo; date.
        Your continued use of the site after such posting constitutes acceptance of the revised
        terms; if you disagree with the revised terms, please discontinue use.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p>
        Questions about these terms or any other policy on nameblooms.com can be sent via the{" "}
        <a href="/contact/" className="text-purple-600 hover:underline">contact page</a>.
        For editorial corrections, please use the same channel and include the URL of the page in
        question and the specific data point you believe is incorrect.
      </p>

      <AuthorBox />
    </article>
  );
}
