/**
 * Per-name popularity arc — server-rendered SVG, zero client JS.
 *
 * Renders the full SSA popularity series (1880-current) for a single name
 * as one sparkline, normalised to the name's own peak so the visual reads
 * as relative trajectory. Peak year + latest year are explicitly labelled.
 * Gender-tinted (blue for boy, pink for girl) so it reads fast on the name
 * detail page alongside the existing decade bars + interactive timeline.
 *
 * Honest scope:
 *  - Y-axis is SHARE-OF-BIRTHS (pct, 0-1 fraction) — not raw count. Two names
 *    with the same pct on different years had different absolute counts, so
 *    cross-name comparison via pct is direction-of-trend, not magnitude-of-
 *    popularity. The figcaption says so.
 *  - We don't extrapolate. If SSA hasn't released a year, we don't draw it.
 *  - Decade tick labels are derived from the actual min/max year of the
 *    supplied series; no assumed range.
 *
 * Companion: components/tools/PopularityTimeline.tsx (interactive every-5-year
 * picker, client component). This static sparkline is the "at a glance" view.
 */

interface PopularityPoint {
  year: number;
  pct: number;
}

interface Props {
  name: string;
  gender: 'boy' | 'girl' | 'unisex' | string;
  peakYear: number | null;
  peakPct: number | null;
  popularity: PopularityPoint[];
  width?: number;
  height?: number;
  caption?: string;
}

const DEFAULT_W = 720;
const DEFAULT_H = 160;
const PAD_T = 14;
const PAD_R = 96; // room for latest-value label outside the line
const PAD_B = 28; // room for year axis
const PAD_L = 8;

export function NameTrajectorySparkline({
  name,
  gender,
  peakYear,
  peakPct,
  popularity,
  width = DEFAULT_W,
  height = DEFAULT_H,
  caption,
}: Props) {
  if (!popularity || popularity.length < 2) return null;

  const sorted = [...popularity].sort((a, b) => a.year - b.year);
  const minYear = sorted[0].year;
  const maxYear = sorted[sorted.length - 1].year;
  if (maxYear === minYear) return null;

  const seriesMax = Math.max(...sorted.map((p) => p.pct), peakPct ?? 0, 1e-6);

  const plotW = width - PAD_L - PAD_R;
  const plotH = height - PAD_T - PAD_B;
  const xScale = (y: number) =>
    PAD_L + ((y - minYear) / (maxYear - minYear)) * plotW;
  const yScale = (p: number) => PAD_T + plotH - (p / seriesMax) * plotH;

  const isBoy = gender === 'boy' || gender === 'M' || gender === 'male';
  const stroke = isBoy ? '#2563eb' : '#db2777'; // blue-600 / pink-600
  const fill = isBoy ? 'rgba(37,99,235,0.12)' : 'rgba(219,39,119,0.12)';

  const lineD = sorted
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.year).toFixed(2)} ${yScale(p.pct).toFixed(2)}`)
    .join(' ');
  const baseY = (PAD_T + plotH).toFixed(2);
  const areaD = `${lineD} L ${xScale(maxYear).toFixed(2)} ${baseY} L ${xScale(minYear).toFixed(2)} ${baseY} Z`;

  const latest = sorted[sorted.length - 1];
  const peak = peakYear != null ? sorted.find((p) => p.year === peakYear) : undefined;
  const fallbackPeak = !peak
    ? sorted.reduce((a, b) => (b.pct > a.pct ? b : a))
    : peak;

  // Decade tick years (every 20y) clamped to the series range.
  const tickStep = (maxYear - minYear) > 80 ? 20 : 10;
  const decadeTicks: number[] = [];
  for (
    let y = Math.ceil(minYear / tickStep) * tickStep;
    y <= maxYear;
    y += tickStep
  ) {
    decadeTicks.push(y);
  }

  const ariaLabel = `${name} popularity trajectory, ${minYear} to ${maxYear}, peaked ${fallbackPeak.year}`;

  // Latest-label x position — clamp inside the plot so the text never clips.
  const latestLabelX = Math.min(
    xScale(latest.year) + 6,
    width - PAD_R + 4,
  );

  return (
    <figure className="my-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={ariaLabel}
        className="w-full h-auto bg-slate-50 rounded-lg border border-slate-200"
      >
        <title>{ariaLabel}</title>
        {/* Baseline */}
        <line
          x1={PAD_L}
          x2={width - PAD_R}
          y1={PAD_T + plotH}
          y2={PAD_T + plotH}
          stroke="#cbd5e1"
          strokeWidth={1}
        />
        {/* Area fill */}
        <path d={areaD} fill={fill} stroke="none" />
        {/* Line */}
        <path
          d={lineD}
          fill="none"
          stroke={stroke}
          strokeWidth={1.8}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Peak marker */}
        {fallbackPeak && (
          <g>
            <circle
              cx={xScale(fallbackPeak.year)}
              cy={yScale(fallbackPeak.pct)}
              r={4}
              fill="#0f172a"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            <text
              x={xScale(fallbackPeak.year) + 6}
              y={yScale(fallbackPeak.pct) - 6}
              fontSize={11}
              fill="#0f172a"
              fontWeight="600"
            >
              Peak {fallbackPeak.year}
            </text>
          </g>
        )}
        {/* Latest marker + label */}
        <circle
          cx={xScale(latest.year)}
          cy={yScale(latest.pct)}
          r={3.5}
          fill={stroke}
          stroke="#ffffff"
          strokeWidth={1.5}
        />
        <text
          x={latestLabelX}
          y={yScale(latest.pct) + 4}
          fontSize={11}
          fill="#334155"
          fontWeight="500"
        >
          {(latest.pct * 100).toFixed(3)}% ({latest.year})
        </text>
        {/* X-axis decade ticks */}
        {decadeTicks.map((y) => (
          <text
            key={y}
            x={xScale(y)}
            y={height - 8}
            fontSize={10}
            fill="#64748b"
            textAnchor="middle"
          >
            {y}
          </text>
        ))}
      </svg>
      <figcaption className="text-xs text-slate-500 mt-2 leading-relaxed">
        {caption ??
          `${name} share of US births, ${minYear}-${maxYear}. Y-axis = share of all births that year (not raw count), so two names at the same height in different years had different absolute counts. Source: US Social Security Administration baby-names dataset. No interpolation — years SSA hasn't released are simply not plotted.`}
      </figcaption>
    </figure>
  );
}
