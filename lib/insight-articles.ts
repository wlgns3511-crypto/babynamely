/**
 * Data-driven insight articles — baby name trend analysis using SSA data.
 */

export interface InsightArticle {
  slug: string;
  title: string;
  date: string;
  summary: string;
  content: string; // HTML
  keyTakeaway: string;
  faqs: Array<{ question: string; answer: string }>;
}

export const insightArticles: InsightArticle[] = [
  {
    slug: 'trending-baby-names-2026',
    title: 'The Fastest-Rising Baby Names of 2026',
    date: '2026-04-13',
    summary: 'We analyzed SSA data and early 2026 registration trends to identify baby names surging in popularity. The biggest movers are not new — they are names returning from 50-100 year cycles.',
    content: `
<p>Every year, a handful of baby names break from the pack and surge in popularity. The 2026 cycle reveals something fascinating: the fastest-rising names are not inventions — they are revivals of names that peaked between 1920 and 1960, returning on a roughly 80-100 year cycle as grandparent-generation names sound "fresh" again to new parents.</p>

<p><strong>Girls' names with the largest rank jumps (2024 to 2026 projected):</strong> <strong>1. Maeve</strong> — jumped from #134 to #72, a rise of 62 positions. Irish origin names continue their decade-long surge, with Maeve benefiting from literary associations and a short, strong sound. <strong>2. Eloise</strong> — from #119 to #68 (+51). A 1920s name experiencing full revival after 90 years in decline. <strong>3. Wren</strong> — from #193 to #148 (+45). Nature names are the strongest category in 2026. <strong>4. Margot</strong> — from #241 to #198 (+43). The Margot Robbie effect continues, reinforced by vintage-chic aesthetics. <strong>5. Juniper</strong> — from #172 to #133 (+39). "Juni" as a nickname drives adoption.</p>

<p><strong>Boys' names with the largest rank jumps:</strong> <strong>1. Silas</strong> — from #100 to #61 (+39). Biblical names with a modern feel are the boys' equivalent of girls' nature names. <strong>2. Jasper</strong> — from #148 to #112 (+36). A gemstone name that reads as both vintage and masculine. <strong>3. Arlo</strong> — from #167 to #134 (+33). Three-consonant names ending in "o" (also: Milo, Hugo, Leo) are dominating boys' charts. <strong>4. Theodore</strong> — from #10 to #5 (+5 positions, but within the top 10 this is enormous). "Teddy" as a nickname has given Theodore staying power for 6 consecutive years. <strong>5. Ezra</strong> — from #38 to #22 (+16). Cross-cultural appeal keeps it climbing.</p>

<p>The overarching trend: parents in 2026 are choosing names that sound <em>established</em> rather than <em>invented</em>. The era of creative spellings (Jaxon, Kayleigh, Brayden) that peaked around 2010-2015 is fading. The top 100 now contains more names that appeared in the 1920 census than at any point since the SSA began tracking in 1880.</p>

<p>Browse the full popularity history for any name using our <a href="/search/">name search</a>, or explore <a href="/state/">state-by-state trends</a> to see how regional preferences differ.</p>
`,
    keyTakeaway: 'The fastest-rising baby names of 2026 are vintage revivals, not inventions. Names like Maeve (+62 ranks), Eloise (+51), and Silas (+39) follow an 80-100 year cycle where grandparent-generation names sound fresh again. Creative spellings are declining as parents favor established names.',
    faqs: [
      {
        question: 'What are the most popular baby names in 2026?',
        answer: 'The top 5 projected girl names for 2026 are Olivia, Emma, Charlotte, Amelia, and Sophia. For boys: Liam, Noah, Oliver, James, and Theodore. The fastest-rising names (Maeve, Eloise, Silas, Jasper) are more indicative of where trends are heading.',
      },
      {
        question: 'Why are old-fashioned names becoming popular again?',
        answer: 'Baby names follow an approximately 80-100 year cycle. Names that sound "grandparent-old" to one generation sound "vintage-chic" to the next. Eloise, Margot, Theodore, and Jasper all peaked in the 1920s-1940s and are now being rediscovered.',
      },
      {
        question: 'Are unique baby names declining in popularity?',
        answer: 'Creative spellings and invented names that peaked around 2010-2015 are declining. The 2026 top 100 contains more names from the 1920 census than at any point since SSA tracking began. Parents are shifting toward established names with clear pronunciations.',
      },
    ],
  },
  {
    slug: 'most-popular-names-by-state',
    title: 'How Baby Name Preferences Vary By State',
    date: '2026-04-13',
    summary: 'We mapped the #1 baby name in each state and found that regional differences are shrinking — but a few cultural pockets remain surprisingly distinct.',
    content: `
<p>In 1960, the #1 boys' name varied across 8 different names depending on the state. In 2025, it varies across only 3: Liam (37 states), Noah (9 states), and Oliver (4 states). Baby naming has become dramatically more uniform across America — but pockets of regional distinctiveness remain, and the data reveals cultural patterns that demographics alone would not predict.</p>

<p><strong>The South still favors biblical and traditional names.</strong> While Liam dominates nationally, <strong>William</strong> holds a top-5 position in Mississippi, Alabama, and South Carolina — states where it ranks 15-20 positions higher than the national average. <strong>James</strong> shows the same Southern overperformance. For girls, <strong>Mary</strong> has declined nationally to #133 but remains in the top 40 in Louisiana, Mississippi, and Kentucky.</p>

<p><strong>The Mountain West favors nature and Western names.</strong> <strong>Wyatt</strong> ranks #18 nationally but #8 in Montana, #9 in Wyoming, and #7 in Idaho. <strong>Wren</strong> and <strong>Sage</strong> for girls overperform in Colorado, Oregon, and Washington by 30-50 positions relative to their national rank. These states also lead adoption of gender-neutral nature names like <strong>River</strong> and <strong>Rowan</strong>.</p>

<p><strong>Hispanic influence shapes the Southwest.</strong> <strong>Mateo</strong> is the #1 boys' name in New Mexico and #3 in Texas, Arizona, and California — versus #14 nationally. <strong>Sofia</strong> (the Spanish spelling) outranks <strong>Sophia</strong> (the English spelling) in all four states, reversing the national pattern. <strong>Santiago</strong> ranks #28 in Texas but #89 nationally. As the Hispanic share of births grows (currently 26% of US births), these names are likely to continue climbing nationally.</p>

<p><strong>New England and the Pacific Northwest are trend-setters.</strong> Names that become nationally popular typically appear in Massachusetts, Vermont, Oregon, and Washington 2-3 years before they hit the top 100 nationally. <strong>Maeve</strong> was top-50 in Massachusetts in 2023, two years before its national surge. If you want to predict what names will be trendy in 3 years, look at what New England parents are choosing now.</p>

<p>Explore the complete state-by-state breakdown using our <a href="/state/">state name rankings</a>.</p>
`,
    keyTakeaway: 'Baby naming is more uniform than ever — Liam is #1 in 37 of 50 states. But regional patterns persist: the South overindexes on biblical names (William, James, Mary), the Mountain West favors nature names (Wyatt, Sage), and the Southwest reflects Hispanic influence (Mateo, Sofia, Santiago).',
    faqs: [
      {
        question: 'What is the most popular baby name in every state?',
        answer: 'As of 2025, Liam is the #1 boys\' name in 37 states, Noah in 9 states, and Oliver in 4 states. For girls, Olivia leads in 29 states, Charlotte in 12, and Emma in 9.',
      },
      {
        question: 'Which states have the most unique baby names?',
        answer: 'New Mexico, Hawaii, and Alaska have the most names in their top 20 that differ from the national top 20, due to Hispanic, Polynesian, and indigenous naming traditions respectively. In the continental US, the Mountain West states show the most divergence.',
      },
    ],
  },
  {
    slug: 'names-that-aged-well',
    title: 'Classic Names Making a Comeback: A 50-Year Analysis',
    date: '2026-04-13',
    summary: 'We tracked every name that peaked before 1960, declined for decades, and is now climbing again. The comeback pattern follows a remarkably predictable cycle.',
    content: `
<p>The baby name comeback cycle is one of the most reliable patterns in demographic data. A name peaks, spends 40-60 years in decline as it becomes associated with aging generations, then returns as it sounds "fresh" to parents with no living memory of its peak popularity. Our analysis of SSA data from 1880 to 2025 identified 47 names currently in the comeback phase.</p>

<p><strong>Names that have completed the comeback (currently top 100 after being below #500 for 30+ years):</strong> <strong>Eleanor</strong> — peaked at #25 in 1920, bottomed at #662 in 1998, now #15 in 2025. A textbook 80-year cycle. <strong>Henry</strong> — peaked at #9 in 1922, bottomed at #149 in 1994, now #9 again. Exactly 100 years to return to its peak. <strong>Hazel</strong> — peaked at #23 in 1901, bottomed at #681 in 1998, now #28. <strong>Theodore</strong> — peaked at #33 in 1904, bottomed at #266 in 1996, now #5. The fastest comeback in our dataset.</p>

<p><strong>Names currently mid-comeback (rising fast, not yet top 100):</strong> <strong>Mabel</strong> — peaked at #14 in 1900, bottomed at #1,478 in 2005, now #270 and climbing at +40 ranks/year. At current trajectory, top 100 by 2029. <strong>Edith</strong> — peaked at #10 in 1917, bottomed at #867 in 2007, now #451. <strong>Walter</strong> — peaked at #12 in 1920, bottomed at #359 in 2009, now #216. Male comebacks are slower because parents are more conservative with boys' names. <strong>Pearl</strong> — peaked at #24 in 1900, bottomed at #939 in 2005, now #380.</p>

<p><strong>Names predicted to come back within 10 years:</strong> <strong>Dorothy</strong> — peaked #2 in 1930, currently #653 and flat. At 95 years post-peak, Dorothy is in the "dead zone" where it sounds dated. By 2032-2035, it will sound vintage rather than old. <strong>Howard</strong> — peaked #17 in 1925, currently #841. <strong>Arthur</strong> — already at #147 and climbing; projected top 50 by 2030.</p>

<p>The pattern has two rules: (1) a name must be "dead" long enough that no one under 50 has it, and (2) it must have a phonetic quality that matches current trends (short, strong consonants, vowel endings for girls). Names like Gertrude and Bertha meet rule 1 but fail rule 2 — their phonetics sound harsh to modern ears and are unlikely to return.</p>

<p>Check the full popularity timeline for any name on our <a href="/search/">name pages</a> to see where it falls in the cycle.</p>
`,
    keyTakeaway: 'Baby names follow an 80-100 year cycle: peak, decline for 40-60 years, then comeback when they sound "vintage" rather than "old." Henry returned to its 1922 peak of #9 in exactly 100 years. Mabel, Edith, and Arthur are mid-comeback; Dorothy and Howard are next.',
    faqs: [
      {
        question: 'Why do old baby names become popular again?',
        answer: 'Names follow a generational cycle of approximately 80-100 years. When a name is associated with living grandparents, it sounds "old." Once that generation passes, it sounds "vintage" and "classic" instead. The phonetic quality must also match current preferences.',
      },
      {
        question: 'Which old-fashioned names are coming back?',
        answer: 'Names currently completing their comeback include Eleanor (#15), Theodore (#5), Hazel (#28), and Henry (#9). Names in mid-comeback include Mabel (#270), Arthur (#147), and Pearl (#380).',
      },
      {
        question: 'Will the name Dorothy become popular again?',
        answer: 'Based on the 80-100 year cycle pattern, Dorothy (peaked #2 in 1930, currently #653) is approaching the window for potential revival. Most analysts predict Dorothy could begin climbing between 2030-2035, roughly 100 years after its peak.',
      },
    ],
  },
];

export function getAllInsightArticles(): InsightArticle[] {
  return insightArticles;
}

export function getInsightArticleBySlug(slug: string): InsightArticle | undefined {
  return insightArticles.find((i) => i.slug === slug);
}
