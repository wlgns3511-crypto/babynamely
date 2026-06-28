import type { Metadata } from "next";
import { AuthorBox } from "@/components/AuthorBox";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Reach the NameBlooms editorial team — corrections, feedback, partnerships, and questions about how we source and classify baby-name data.",
  alternates: { canonical: "/contact/" },
  openGraph: { url: "/contact/" },
};

export default function ContactPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Contact Us</h1>

      <p>
        We would love to hear from you. Whether you have a question about a specific data point, a
        suggestion for a new analytical view, want to report an error in our trajectory archetype
        or Cross-Generation Cohort Index classification, or are looking to discuss a partnership
        with the broader DataPeek Research Network — please get in touch.
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Get in Touch</h2>
        <p className="mb-2">
          <strong>Email:</strong>{" "}
          <a href="mailto:datapeekfacts@gmail.com" className="text-purple-600 hover:underline">
            datapeekfacts@gmail.com
          </a>
        </p>
        <p className="text-sm text-slate-500 mt-4">
          We typically respond within 1–2 business days. We&rsquo;re a small editorial team based
          across multiple time zones, so urgent inquiries (broken pages, security concerns) are
          best flagged with a clear subject line.
        </p>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3">Editorial Corrections</h2>
      <p>
        We take corrections seriously and publish them transparently. If you spot an error — a
        miscounted name, a misattributed origin, an archetype classification that doesn&rsquo;t
        match the actual curve, an outdated peak year, a broken external citation — please email
        us with:
      </p>
      <ul>
        <li>The full URL of the page in question (e.g., <code>/name/sarah/</code>).</li>
        <li>The specific data point, sentence, or classification you believe is incorrect.</li>
        <li>A reference to a primary source supporting the correction (the SSA OACT file,
          Census data, Behind the Name, or an academic onomastic reference) when possible.</li>
      </ul>
      <p>
        For SSA data discrepancies specifically: please remember that the SSA file omits names
        given to fewer than 5 babies in any year (privacy threshold) and that spelling variants
        are counted separately. Many apparent &ldquo;errors&rdquo; turn out to be edge cases of
        these two rules. We document the rules on the{" "}
        <a href="/methodology/" className="text-purple-700 hover:underline">methodology page</a>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Feature &amp; Data Suggestions</h2>
      <p>
        New analytical views, additional auxiliary datasets, regional language groupings,
        community-tradition naming references, and similar suggestions are very welcome.
        We can&rsquo;t commit to building every request, but we read each one and our roadmap
        is meaningfully shaped by reader input — particularly from parents, name-research
        hobbyists, and academics in onomastics and demographic statistics.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Press &amp; Citation Inquiries</h2>
      <p>
        Journalists, podcasters, and researchers may freely cite our charts, classifications, or
        commentary with attribution to nameblooms.com. For longer republications, image use
        beyond a thumbnail, or interview requests with the editorial team, please email us with
        the publication details and deadline.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Privacy &amp; Data Requests</h2>
      <p>
        We do not collect personal information beyond standard analytics (page views, anonymized
        device class, referrer). Our privacy practices are described in detail at{" "}
        <a href="/privacy/" className="text-purple-700 hover:underline">/privacy/</a>. If you have
        a question about our handling of analytics or advertising data, or wish to make a request
        under a regional privacy regime (GDPR, CCPA, etc.), please email the address above.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">DataPeek Research Network</h2>
      <p>
        NameBlooms is part of the{" "}
        <a href="https://datapeekfacts.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
          DataPeek Research Network
        </a>{" "}
        — a public-data analytics group covering U.S. housing, tax, healthcare, and other civic
        domains. For general inquiries about the network, cross-site partnerships, or
        domain-wide methodology questions, contact the DataPeek team at{" "}
        <a href="mailto:datapeekfacts@gmail.com" className="text-blue-600 hover:underline">
          datapeekfacts@gmail.com
        </a>.
      </p>

      <AuthorBox />
    </article>
  );
}
