/**
 * Layer 2 — interpretive commentary generation.
 *
 * The earlier draft of this module was fact-stating: "X moved from #N to #M,
 * a drop of K ranks." Accurate, but a parent reading it learned nothing they
 * couldn't have read off the table. This rewrite follows a deliberate
 *
 *     FACT → INTERPRETATION → IMPLICATION
 *
 * pattern for every paragraph:
 *
 *   FACT          — the raw number from Layer 1.
 *   INTERPRETATION — what that number signals about the name's cultural
 *                    shape (rising trend, vintage revival, modern classic,
 *                    fading-to-rare, etc.).
 *   IMPLICATION    — what it means for a parent considering the name today
 *                    (rarity, recognition, classroom-roster expectation,
 *                    cross-generational resonance).
 *
 * Each condition has 3-4 sentence variants; we pick one deterministically
 * by hashing the slug, so the same name always renders the same wording
 * across rebuilds (cache- and crawl-friendly), but every name in the corpus
 * sees a different combination of variants. Two pages cannot end up with
 * the same paragraph because the underlying numbers are unique.
 *
 * Inputs come exclusively from Layer 1 facts; no claim is invented that
 * isn't directly derivable from the SSA dataset.
 */
import type { NameFacts, PeerName } from './name-facts';

// ─────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────────────

const ORDINAL_SUFFIX = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

/** "1 in every N same-gender babies" — a tangible school-roster reference. */
function oneInEveryN(pct: number | null | undefined): string {
  if (!pct || pct <= 0) return 'fewer than 1 in 200,000';
  const oneIn = Math.round(1 / pct);
  if (oneIn <= 200) return `roughly 1 in every ${oneIn}`;
  if (oneIn <= 2_000) return `roughly 1 in every ${Math.round(oneIn / 10) * 10}`;
  if (oneIn <= 20_000) return `roughly 1 in every ${Math.round(oneIn / 100) * 100}`;
  return `roughly 1 in every ${Math.round(oneIn / 1_000) * 1_000}`;
}

/** "a" or "an" depending on the leading sound of the name. Spelling-based heuristic. */
function aOrAn(word: string): string {
  if (!word) return 'a';
  const first = word[0].toLowerCase();
  return 'aeiou'.includes(first) ? 'an' : 'a';
}

/** "Liam (#3, this name × 1.4)" — relative-frequency phrase for peer comparison. */
function ratioPhrase(myPct: number, theirPct: number, theirName: string): string | null {
  if (!myPct || !theirPct || theirPct <= 0) return null;
  const ratio = myPct / theirPct;
  if (ratio >= 1.5) return `chosen about ${ratio.toFixed(1)}× more often than ${theirName}`;
  if (ratio <= 0.67) return `chosen about ${(1 / ratio).toFixed(1)}× less often than ${theirName}`;
  return `chosen at roughly the same rate as ${theirName}`;
}

/** Stable hash for variant selection — same slug → same variant. */
function pickVariant<T>(slug: string, options: T[], salt = 0): T {
  let h = salt;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return options[Math.abs(h) % options.length];
}

// ─────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────

export interface NameCommentary {
  /** Top sentence — sets the frame. Always factual; introduces ranking + rough volume. */
  headline: string;
  /** 1-2 sentences interpreting the YoY/short-term direction. */
  trend: string;
  /** 1-2 sentences interpreting the long-arc history (peak, decline, return). */
  history: string;
  /** Optional: peer-comparison or class-roster implication for the parent reading. */
  context?: string;
  /** Categorical trend bucket used for emoji/chip rendering. */
  trendStatus:
    | 'rising'
    | 'falling'
    | 'stable_top'
    | 'stable_mid'
    | 'stable_long_tail'
    | 'vintage_peak'
    | 'vintage_revival'
    | 'modern_classic'
    | 'fading'
    | 'comeback'
    | 'absent';
}

// Internal context bundle passed to each sentence-bank function.
interface Ctx {
  name: string;
  slug: string;
  gender: 'boy' | 'girl';
  genderPlural: string;
  genderPossessive: string;
  current: NameFacts['current'];
  recent: NameFacts['recent'];
  cumulative: NameFacts['cumulative'];
  decadeRanks: NameFacts['decadeRanks'];
  peersInRankBand: PeerName[];
  classFreq: string;
  /** A "comparison peer" picked deterministically from peersInRankBand, if any. */
  comparePeer: PeerName | null;
}

// ─────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────

export function generateCommentary(name: string, facts: NameFacts): NameCommentary {
  const { current, recent, cumulative, decadeRanks } = facts;

  const ctx: Ctx = {
    name,
    slug: facts.slug,
    gender: facts.gender as 'boy' | 'girl',
    genderPlural: facts.gender === 'boy' ? 'boys' : 'girls',
    genderPossessive: facts.gender === 'boy' ? "boys'" : "girls'",
    current,
    recent,
    cumulative,
    decadeRanks,
    peersInRankBand: facts.peersInRankBand,
    classFreq: oneInEveryN(current?.pct ?? null),
    comparePeer:
      facts.peersInRankBand.length > 0
        ? pickVariant(facts.slug, facts.peersInRankBand, 7)
        : null,
  };

  // ── Trend status classification ──
  let trendStatus: NameCommentary['trendStatus'] = 'stable_long_tail';
  const peakDecadeBefore1960 = cumulative.bestRankYear < 1960;
  const peakDecadeBefore1980 = cumulative.bestRankYear < 1980;
  const peakPost2000 = cumulative.bestRankYear >= 2000;

  if (!current || recent.direction === 'absent') {
    trendStatus = 'absent';
  } else if (current.rank && current.rank <= 10 && recent.direction === 'stable') {
    trendStatus = 'stable_top';
  } else if (recent.direction === 'rising' && peakDecadeBefore1980) {
    trendStatus = 'vintage_revival';
  } else if (recent.direction === 'rising') {
    trendStatus = 'rising';
  } else if (recent.direction === 'falling' && current.rank && current.rank > 500) {
    trendStatus = 'fading';
  } else if (recent.direction === 'falling') {
    trendStatus = 'falling';
  } else if (peakPost2000 && current.rank && current.rank <= 50) {
    trendStatus = 'modern_classic';
  } else if (peakDecadeBefore1960) {
    trendStatus = 'vintage_peak';
  } else if (current.rank && current.rank <= 200) {
    trendStatus = 'stable_mid';
  }

  return {
    headline: generateHeadline(ctx),
    trend: generateTrendCommentary(trendStatus, ctx),
    history: generateHistoryCommentary(ctx),
    context: generateContextCommentary(trendStatus, ctx),
    trendStatus,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Headline — frame-setter, mostly factual but already with a parent-facing edge
// ─────────────────────────────────────────────────────────────────────────

function generateHeadline(ctx: Ctx): string {
  const { name, current, slug, genderPlural, genderPossessive } = ctx;
  if (current?.rank && current.estimatedBabies) {
    const variants = [
      `In 2024, ${name} was the ${ORDINAL_SUFFIX(current.rank)}-most popular ${genderPossessive} name in the United States — about ${fmtCount(current.estimatedBabies)} ${genderPlural} were given the name that year.`,
      `${name} ranked #${current.rank} on the SSA's national list for ${genderPlural} in 2024, with roughly ${fmtCount(current.estimatedBabies)} new ${genderPlural} carrying the name.`,
      `As of 2024, ${name} sits at #${current.rank} for ${genderPlural} — translating to about ${fmtCount(current.estimatedBabies)} births bearing the name in a single year.`,
    ];
    return pickVariant(slug, variants, 1);
  }
  return `${name} did not clear the SSA's five-births reporting threshold in 2024 — putting it solidly in the genuinely-rare category for ${genderPlural} names today.`;
}

// ─────────────────────────────────────────────────────────────────────────
// Trend — the heart of the rewrite. Each variant carries fact + meaning + implication.
// ─────────────────────────────────────────────────────────────────────────

function generateTrendCommentary(
  status: NameCommentary['trendStatus'],
  ctx: Ctx,
): string {
  const { name, recent, current, slug } = ctx;

  switch (status) {
    case 'rising': {
      if (!recent.priorRank || !current?.rank || recent.rankChange === null) return '';
      const jump = recent.rankChange;
      const pctDelta = recent.fiveYearTrendPct;
      const variants = [
        `${name} climbed from #${recent.priorRank} to #${current.rank} in 2024 — a ${jump}-rank gain in twelve months. Names rising this fast usually catch a cultural moment crystalizing into a naming choice; ${name} is being heard more in 2024 than even a year ago, so ${aOrAn(name)} ${name} born today will likely meet namesakes their older cousins didn't.`,
        `From #${recent.priorRank} to #${current.rank} in a single year is the kind of jump that quietly rewrites school rosters. ${name} is on the upswing — distinctive still, but the window for "rare" is closing. Parents picking it now are catching the curve before the saturation that often follows a fast climb.`,
        `${name} gained ${jump} positions between 2023 and 2024${pctDelta && pctDelta > 0 ? `, with its share of births up ${pctDelta}% over the last five years` : ''}. Whether the rise continues or peaks soon, the choice today is meaningfully different from the choice a decade ago: ${name} is no longer fringe, but isn't yet ordinary either.`,
        `${name}'s ${jump}-rank rise to #${current.rank} traces a recognizable pattern — the kind names take when a generation rediscovers them. The interesting question isn't whether ${name} is "popular" today, but how popular it will feel by the time a child born now starts kindergarten.`,
      ];
      return pickVariant(slug, variants, 2);
    }

    case 'vintage_revival': {
      if (!recent.priorRank || !current?.rank) return '';
      const variants = [
        `${name} is climbing again — from #${recent.priorRank} to #${current.rank} in 2024 — after decades dormant. The shape of the trajectory (long quiet, recent rise) is what name-watchers call a comeback name. Choosing ${name} now puts a child at the front of its second cultural moment, with all the heritage of the first still attached.`,
        `${name} hasn't been this visible in a long time, and the curve is still pointing up: #${recent.priorRank} a year ago, #${current.rank} now. Vintage names do this in waves; ${name} is in the rising half of one. It's an old name being chosen by parents who specifically want depth — and getting it.`,
        `${name} is in revival territory — a generations-old name accelerating again. The numbers (#${recent.priorRank} → #${current.rank}) are still small enough that the name reads as rooted rather than retro. That window — recognizably old, not yet trendy — is where revivals do their best work.`,
      ];
      return pickVariant(slug, variants, 2);
    }

    case 'falling': {
      if (!recent.priorRank || !current?.rank || recent.rankChange === null) return '';
      const drop = Math.abs(recent.rankChange);
      const pctDelta = recent.fiveYearTrendPct;
      const variants = [
        `${name} slipped from #${recent.priorRank} to #${current.rank} in 2024 — ${drop} ranks lower in a year${pctDelta && pctDelta < 0 ? `, with its birth share down ${Math.abs(pctDelta)}% since 2019` : ''}. A name losing popularity isn't losing meaning; ${name} now feels more distinctive than it did a decade ago, when the chances of meeting one in any classroom were noticeably higher.`,
        `${name} dropped ${drop} ranks year-over-year, landing at #${current.rank}. Names on this kind of arc round into "familiar but uncommon" territory — past the saturation peak, before the vintage-revival lift kicks in. For a parent today, that means recognition without the crowd.`,
        `${name}'s slide to #${current.rank} (from #${recent.priorRank}) is steady rather than sudden. The cultural memory is still there; the ubiquity is fading. That's often the most flattering moment to pick a name — when it sounds like a name people know rather than one of several friends share.`,
        `${name} lost ${drop} positions in 2024. For a name in this band, every step down is a step toward "deliberate" rather than "default" — meaning ${aOrAn(name)} ${name} born today reads as a chosen name, not the path-of-least-resistance one their parents heard in their own school years.`,
      ];
      return pickVariant(slug, variants, 2);
    }

    case 'fading': {
      if (!current?.rank) return '';
      const variants = [
        `${name} ranks #${current.rank} in 2024, well below its historical highs. Names this far past peak sit at a fork: either drift further into rarity, or bottom out and begin a vintage-revival arc decades later. For now, ${ctx.classFreq} ${ctx.genderPlural} born this year carries the name — distinctly the "deliberate choice" zone.`,
        `${name} now sits at #${current.rank} after years of decline. That isn't decay so much as the slow turn that lets a once-common name feel newly distinctive again. Parents hearing ${name} today register the recognition; few register the saturation that came with it twenty or thirty years ago.`,
        `${name}'s fall to #${current.rank} keeps it in the SSA dataset but well outside the everyday cluster. Choosing it now is choosing something with cultural depth and very little overlap — only ${ctx.classFreq} ${ctx.genderPlural} born in 2024 share the name.`,
      ];
      return pickVariant(slug, variants, 2);
    }

    case 'stable_top': {
      if (!current?.rank) return '';
      const variants = [
        `${name} held #${current.rank} again in 2024 — anchoring at the top of the ${ctx.genderPossessive} list year after year. Names that stay this long inside the top 10 stop being trends and start being templates: enduring choices that read as timeless rather than stylish.`,
        `At #${current.rank}, ${name} is one of the ten most-given ${ctx.genderPossessive} names in America. That kind of dominance comes with a tradeoff a parent should weigh upfront: ${aOrAn(name)} ${name} born today will almost certainly share their name with classmates by elementary school. The recognition is total; the rarity is gone.`,
        `${name}'s grip on the top 10 — held steady this year — is the strongest signal of staying power in the SSA dataset. The name has cleared the trend cycle and entered the small group of names parents reach for generation after generation, regardless of fashion.`,
        `Holding #${current.rank} year over year puts ${name} in the small handful of ${ctx.genderPossessive} names that act as the era's defaults. Choosing it is choosing maximum recognition at the cost of distinctiveness — a tradeoff some parents specifically want, others actively avoid.`,
      ];
      return pickVariant(slug, variants, 2);
    }

    case 'modern_classic': {
      if (!current?.rank) return '';
      const variants = [
        `${name} reached its all-time peak at #${ctx.cumulative.bestRank} in ${ctx.cumulative.bestRankYear} and still ranks #${current.rank} today. Names that hold near their peak this long usually make the jump from "popular" to "permanent" — ${aOrAn(name)} ${name} born now reads less as on-trend and more as part of the modern canon.`,
        `${name} is a name of the post-2000 wave that didn't fade. Peaking at #${ctx.cumulative.bestRank} in ${ctx.cumulative.bestRankYear} and currently at #${current.rank}, it's tracking the path earlier-generation top names took toward timeless: familiar everywhere, not particularly tied to any one decade.`,
        `${name} has effectively become a modern classic — peak rank #${ctx.cumulative.bestRank} in ${ctx.cumulative.bestRankYear}, current rank #${current.rank}. For a parent, this is one of the safer cells on the popularity matrix: known to every generation a child will encounter, with low risk of dating.`,
      ];
      return pickVariant(slug, variants, 2);
    }

    case 'stable_mid': {
      if (!current?.rank) return '';
      const variants = [
        `${name} sits at #${current.rank} — the "familiar but not dominant" zone. It's used widely enough to feel established (${ctx.classFreq} ${ctx.genderPlural} this year), yet not so widely that namesakes flood every classroom. Parents picking names in this band typically want recognition without ubiquity, and ${name} delivers exactly that.`,
        `At #${current.rank}, ${name} is the kind of name people recognize on first hearing but don't already know three of. Statistically, ${ctx.classFreq} ${ctx.genderPlural} born in 2024 share the name — enough for it to feel established, few enough that it still belongs to the child wearing it.`,
        `${name}'s rank around #${current.rank} puts it in the comfortable middle: well-known, easily spelled, distinctive enough that ${aOrAn(name)} ${name} born today won't be one of several in any given room. That balance is harder to find than it looks.`,
      ];
      return pickVariant(slug, variants, 2);
    }

    case 'stable_long_tail': {
      if (!current?.rank) return '';
      const variants = [
        `${name} ranks #${current.rank} — below the names you'll hear daily, but firmly in the SSA dataset. ${ctx.classFreq.charAt(0).toUpperCase() + ctx.classFreq.slice(1)} ${ctx.genderPlural} born in 2024 received the name, making it a deliberate but not unheard-of choice for parents who want recognition without the crowd.`,
        `At #${current.rank}, ${name} is the kind of name parents pick on purpose rather than by trend. ${ctx.classFreq} ${ctx.genderPlural} born this year carries it — enough that the name feels familiar to anyone who hears it, rare enough that it still belongs to the child wearing it.`,
        `${name}'s position at #${current.rank} marks it as a name with reach but not saturation. There's social recognition with very low overlap — the most useful combination for a parent who wants their child's name to be neither everywhere nor a constant explainer.`,
      ];
      return pickVariant(slug, variants, 2);
    }

    case 'vintage_peak': {
      const variants = [
        `${name} reached its peak at #${ctx.cumulative.bestRank} in ${ctx.cumulative.bestRankYear} — when grandparents and great-grandparents were being named — and now sits at #${current?.rank ?? '—'}. The decline isn't loss; it's the slow turn that lets the name feel newly distinctive again. ${aOrAn(name) === 'an' ? 'An' : 'A'} ${name} born in 2024 carries cross-generational recognition without the crowd.`,
        `${name}'s heyday — #${ctx.cumulative.bestRank} in ${ctx.cumulative.bestRankYear} — came generations ago. The name has aged into what some parents specifically want: a name that sounds adult on a child, with grandparent-era resonance and very little overlap among current peers.`,
        `Records show ${name} hit #${ctx.cumulative.bestRank} in ${ctx.cumulative.bestRankYear}, with current rank #${current?.rank ?? 'below threshold'}. Names with this shape — long-ago peak, faint modern presence — read as "borrowed from another generation," which is increasingly the point for parents looking past the contemporary top 100.`,
      ];
      return pickVariant(slug, variants, 2);
    }

    case 'comeback': {
      const variants = [
        `${name} did the round trip: peak at #${ctx.cumulative.bestRank} in ${ctx.cumulative.bestRankYear}, decades of decline, and now climbing back. Comeback names like this carry cross-generational recognition without feeling overused today — a balance most names can't strike intentionally.`,
        `${name}'s arc — peak in ${ctx.cumulative.bestRankYear}, dip, recovery — is the textbook revival pattern. Choosing it now puts a child somewhere most names can't reach: known to grandparents, fresh to peers.`,
      ];
      return pickVariant(slug, variants, 2);
    }

    case 'absent': {
      const variants = [
        `${name} did not appear in 2024 SSA records with at least five recorded births — the threshold for inclusion. A name in this state is genuinely uncommon: distinctive in modern American use, with whatever cultural recognition it carries built up from earlier generations rather than current popularity.`,
        `${name} fell below the SSA's minimum reporting cutoff in 2024 (five births nationwide). For a parent, that means ${name} sits in the truly rare category — recognized by anyone familiar with its origins, not someone they'll hear at the playground.`,
      ];
      return pickVariant(slug, variants, 2);
    }
  }

  return '';
}

// ─────────────────────────────────────────────────────────────────────────
// History — long-arc framing, weight rather than chronology
// ─────────────────────────────────────────────────────────────────────────

function generateHistoryCommentary(ctx: Ctx): string {
  const { name, cumulative, current, slug, genderPlural } = ctx;
  const peakYear = cumulative.bestRankYear;
  const peakRank = cumulative.bestRank;
  const yearsTracked = cumulative.yearsInRecord;
  const totalBabies = cumulative.estimatedTotal;
  const totalText = totalBabies > 1000 ? fmtCount(totalBabies) : totalBabies.toLocaleString();

  // ── Long history (≥ 100 years tracked): peak meaning + cumulative weight ──
  if (yearsTracked >= 100) {
    const distanceFromPeak = current?.rank && current.rank > peakRank * 5;
    const nearPeak = current?.rank && current.rank <= peakRank + 3;
    const variants = [
      `${name} has been in the SSA records since ${cumulative.firstYear}, and reached its highest rank — #${peakRank} — in ${peakYear}. About ${totalText} ${genderPlural} have carried the name across that span, which is why ${name} now reads as a name with depth rather than novelty.${distanceFromPeak ? ' Its current position is well below that peak, which works in its favor for parents wanting heritage without saturation.' : nearPeak ? ' It is at or near that historical high today — meaning the name is having a generational moment in real time.' : ''}`,
      `Records for ${name} span ${cumulative.firstYear}–${cumulative.lastYear}, with the high-water mark at #${peakRank} in ${peakYear}. Roughly ${totalText} ${genderPlural} have been given the name — enough that it carries a clear cultural fingerprint regardless of where it sits on this year's list.`,
      `${name}'s SSA history goes back to ${cumulative.firstYear}; it peaked at #${peakRank} in ${peakYear} and has been recorded in ${yearsTracked} of the years since. With ${totalText} cumulative ${genderPlural}, the name has the longest possible cross-generational resonance — older relatives, peers, and characters in older media all carry it, which a brand-new name simply cannot offer.`,
    ];
    return pickVariant(slug, variants, 3);
  }

  // ── Medium history (30–99 years tracked) ──
  // Two distinct shapes here:
  //   (a) recent emergence — firstYear ≥ 1950 — a name born of the modern era.
  //   (b) intermittent old name — firstYear ≤ 1900 — present long ago, then
  //       gaps, then re-entry. Different framing required.
  if (yearsTracked >= 30) {
    if (cumulative.firstYear <= 1900) {
      const variants = [
        `${name} first appeared in the SSA data back in ${cumulative.firstYear}, peaked at #${peakRank} in ${peakYear}, and has been recorded intermittently since — present in ${yearsTracked} of the years between then and now. That broken pattern (long stretches in, long stretches missing) is the fingerprint of a name with cycles: in fashion, then out, then potentially in again.`,
        `${name} has a non-continuous SSA history — first recorded in ${cumulative.firstYear}, present in ${yearsTracked} years across the dataset, with its high point at #${peakRank} (${peakYear}). Names with this on-off shape often carry stronger generational specificity than continuously-popular names; they signal the eras they were chosen.`,
      ];
      return pickVariant(slug, variants, 3);
    }
    const variants = [
      `${name} first appeared in the SSA data in ${cumulative.firstYear} and has been tracked for ${yearsTracked} years, peaking at #${peakRank} in ${peakYear}. That makes it a relatively modern entrant — long enough to be familiar, recent enough that it still carries a generational specificity older names have lost.`,
      `${name} entered the dataset in ${cumulative.firstYear} and has been part of it for ${yearsTracked} years now, with its high point at #${peakRank} (${peakYear}). It belongs to the wave of names that emerged during the late-twentieth-century diversification of American naming — not a classic, not new, recognizably contemporary.`,
    ];
    return pickVariant(slug, variants, 3);
  }

  // ── Short history (<30 years) ──
  const variants = [
    `${name} has only been in the SSA data since ${cumulative.firstYear}, peaking at #${peakRank} in ${peakYear}. That short history places it in the modern-emergence bracket: a name parents are still defining the meaning of, rather than inheriting fully formed.`,
    `${name} is a recent arrival on the SSA's national list — first recorded in ${cumulative.firstYear}, peaking at #${peakRank} (${peakYear}). Its cultural footprint is being built right now by the ${genderPlural} carrying it; choosing the name adds to a story still being written.`,
  ];
  return pickVariant(slug, variants, 3);
}

// ─────────────────────────────────────────────────────────────────────────
// Context — class-frequency reference + peer comparison + decade arc
// ─────────────────────────────────────────────────────────────────────────

function generateContextCommentary(
  status: NameCommentary['trendStatus'],
  ctx: Ctx,
): string | undefined {
  const {
    name,
    decadeRanks,
    classFreq,
    genderPlural,
    current,
    comparePeer,
    slug,
  } = ctx;

  const fragments: string[] = [];

  // Fragment 1 — class-roster intuition pump.
  if (current?.pct) {
    const perGrade = current.pct * 100; // share per 100 same-gender births
    if (perGrade >= 0.5) {
      fragments.push(
        `In a school grade with 100 ${genderPlural}, you'd expect roughly ${perGrade.toFixed(1)} to be named ${name} at today's rate — useful for picturing what classrooms will look like five or ten years out.`,
      );
    } else {
      fragments.push(
        `Today's rate works out to ${classFreq} ${genderPlural} — meaning ${aOrAn(name)} ${name} starting kindergarten in five years can expect occasional namesakes through schooling, but no constant overlap.`,
      );
    }
  }

  // Fragment 2 — peer comparison with cause-effect framing, when we have it.
  if (
    comparePeer &&
    current?.pct &&
    typeof comparePeer.pctOrYear === 'number' &&
    comparePeer.pctOrYear > 0
  ) {
    const ratio = ratioPhrase(current.pct, comparePeer.pctOrYear, comparePeer.name);
    if (ratio) {
      const peerVariants = [
        `Among peers in the same band, ${name} is ${ratio} (#${comparePeer.rank}) — a useful proxy for "how often will this name come up in the same room as a name like that one?"`,
        `${name} is ${ratio}, who currently sits at #${comparePeer.rank}. Putting two names side by side this way often clarifies whether a name feels common-by-association or distinct.`,
      ];
      fragments.push(pickVariant(slug, peerVariants, 5));
    }
  }

  // Fragment 3 — decade-arc summary, when the dataset is rich enough.
  if (decadeRanks.length >= 3) {
    const earliest = decadeRanks[0];
    const peak = decadeRanks.reduce(
      (best, d) => (d.avgRank < best.avgRank ? d : best),
      decadeRanks[0],
    );
    const latest = decadeRanks[decadeRanks.length - 1];
    if (peak.decade !== earliest.decade && peak.decade !== latest.decade) {
      const arcVariants = [
        `Across the decades the name's averaged rank tells a complete arc: #${earliest.avgRank} in the ${earliest.decade}s → #${peak.avgRank} at peak in the ${peak.decade}s → #${latest.avgRank} in the ${latest.decade}s.`,
        `Decade-by-decade, ${name} traces a familiar S-curve — #${earliest.avgRank} in the ${earliest.decade}s, climbing to a #${peak.avgRank} average in the ${peak.decade}s, settling at #${latest.avgRank} in the ${latest.decade}s.`,
      ];
      fragments.push(pickVariant(slug, arcVariants, 6));
    } else if (peak.decade === latest.decade) {
      const peakNowVariants = [
        `${name} has reached its highest sustained popularity in the ${latest.decade}s (avg rank #${latest.avgRank}) — meaning today's children are the ones carrying the name's peak generation, not their parents.`,
        `The name's strongest decade in the dataset is the current one (${latest.decade}s, avg rank #${latest.avgRank}). For ${name}, "popular" and "now" are the same answer.`,
        `${latest.decade}s averages put ${name} at its all-time decadal high (#${latest.avgRank}). A child given this name today is being placed inside its peak generation in real time.`,
      ];
      fragments.push(pickVariant(slug, peakNowVariants, 6));
    } else if (peak.decade === earliest.decade && status !== 'absent') {
      const longArcVariants = [
        `${name}'s strongest decade in the dataset was the ${peak.decade}s (avg rank #${peak.avgRank}); it now averages #${latest.avgRank} in the ${latest.decade}s — the typical post-peak shape for a name with cultural staying power.`,
        `From a #${peak.avgRank} average in the ${peak.decade}s to #${latest.avgRank} now, ${name} has settled into the long-tail phase a lot of historically-dominant names eventually reach: known to everyone, common to no one.`,
      ];
      fragments.push(pickVariant(slug, longArcVariants, 6));
    }
  }

  if (fragments.length === 0) return undefined;
  return fragments.join(' ');
}
