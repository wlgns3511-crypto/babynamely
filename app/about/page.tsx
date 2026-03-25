import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About NameBlooms",
  description: "Learn about NameBlooms, our mission, and data sources.",
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">About NameBlooms</h1>

      <p>
        NameBlooms is a free resource for parents, name enthusiasts, and researchers to explore baby names. With data
        on over 6,000 names spanning more than a century of history, we help you discover the perfect name by
        providing meanings, origins, popularity trends, and side-by-side comparisons.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Our Mission</h2>
      <p>
        Choosing a name for your child is one of the most meaningful decisions you will make as a parent. Our mission
        is to make that journey easier and more enjoyable by providing comprehensive name data in a beautiful,
        easy-to-use format. We want every parent to feel confident and inspired when choosing a name.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>
        All popularity data on this site comes from the <strong>U.S. Social Security Administration (SSA)</strong>{" "}
        baby names database, which tracks name registrations going back to 1880. Name meanings and origins are
        compiled from authoritative etymological and onomastic references. We update our data annually as new SSA
        releases become available.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p>
        Have questions or feedback? Visit our <a href="/contact" className="text-purple-600 hover:underline">Contact page</a> to get in touch.
      </p>
    </article>
  );
}
