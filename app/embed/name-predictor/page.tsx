import { Metadata } from "next";
import { NamePopularityPredictor } from "@/components/NamePopularityPredictor";

export const metadata: Metadata = {
  title: "Name Popularity Predictor - Embeddable Widget",
  robots: "noindex, nofollow",
};

export default function EmbedNamePredictorPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <NamePopularityPredictor />
      <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 12 }}>
        Powered by{" "}
        <a href="https://nameblooms.com" target="_blank" rel="noopener" style={{ color: "#3b82f6", textDecoration: "underline" }}>
          NameBlooms
        </a>
      </p>
    </div>
  );
}
