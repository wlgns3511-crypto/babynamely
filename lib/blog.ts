export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  readingTime: number;
  content: string;
}

const posts: BlogPost[] = [
  {
    slug: "most-popular-baby-names-2024",
    title: "Most Popular Baby Names of 2024 (SSA Official Data)",
    description:
      "The Social Security Administration tracks every name given to babies born in the US. Here are the top 10 boy and girl names of 2024, why they dominate, and how regional preferences differ.",
    publishedAt: "2024-10-08",
    updatedAt: "2025-01-10",
    category: "Name Trends",
    readingTime: 5,
    content: `
<h2>How the SSA Tracks Baby Names</h2>
<p>Each year, the Social Security Administration (SSA) compiles a list of names given to babies born in the US, based on Social Security card applications. The SSA only reports names given to at least 5 babies to protect privacy. The database covers names from 1880 to the present and is updated annually — making it the most comprehensive and reliable baby name dataset available.</p>
<p>The 2024 rankings reflect babies born in 2024 whose parents applied for Social Security cards. Because some parents apply months after birth, the final 2024 data may be updated in the following year.</p>

<h2>Top 10 Boy Names of 2024</h2>
<table>
  <thead>
    <tr><th>Rank</th><th>Name</th><th>Origin</th><th>Meaning</th></tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>Liam</td><td>Irish</td><td>Strong-willed warrior</td></tr>
    <tr><td>2</td><td>Noah</td><td>Hebrew</td><td>Rest, comfort</td></tr>
    <tr><td>3</td><td>Oliver</td><td>Latin/Norse</td><td>Olive tree</td></tr>
    <tr><td>4</td><td>James</td><td>Hebrew</td><td>Supplanter</td></tr>
    <tr><td>5</td><td>Elijah</td><td>Hebrew</td><td>My God is Yahweh</td></tr>
    <tr><td>6</td><td>Mateo</td><td>Spanish/Hebrew</td><td>Gift of God</td></tr>
    <tr><td>7</td><td>Theodore</td><td>Greek</td><td>Gift of God</td></tr>
    <tr><td>8</td><td>Henry</td><td>Germanic</td><td>Ruler of the home</td></tr>
    <tr><td>9</td><td>Lucas</td><td>Latin/Greek</td><td>Light, illumination</td></tr>
    <tr><td>10</td><td>William</td><td>Germanic</td><td>Resolute protector</td></tr>
  </tbody>
</table>

<h2>Top 10 Girl Names of 2024</h2>
<table>
  <thead>
    <tr><th>Rank</th><th>Name</th><th>Origin</th><th>Meaning</th></tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>Olivia</td><td>Latin</td><td>Olive tree</td></tr>
    <tr><td>2</td><td>Emma</td><td>Germanic</td><td>Whole, universal</td></tr>
    <tr><td>3</td><td>Charlotte</td><td>French</td><td>Free woman</td></tr>
    <tr><td>4</td><td>Amelia</td><td>Germanic</td><td>Work, industriousness</td></tr>
    <tr><td>5</td><td>Sophia</td><td>Greek</td><td>Wisdom</td></tr>
    <tr><td>6</td><td>Mia</td><td>Scandinavian/Hebrew</td><td>Mine, beloved</td></tr>
    <tr><td>7</td><td>Isabella</td><td>Hebrew/Italian</td><td>Devoted to God</td></tr>
    <tr><td>8</td><td>Ava</td><td>Latin/Hebrew</td><td>Life, bird</td></tr>
    <tr><td>9</td><td>Evelyn</td><td>English</td><td>Wished for child</td></tr>
    <tr><td>10</td><td>Luna</td><td>Latin</td><td>Moon</td></tr>
  </tbody>
</table>

<h2>Why These Names Dominate</h2>
<p>The top names reflect several trends: <strong>classic names with modern feel</strong> (Olivia, Charlotte, Henry), <strong>short, strong names</strong> (Liam, Ava, Mia), and <strong>multicultural picks</strong> (Mateo, Luna) reflecting the growing Hispanic influence on US naming culture.</p>
<p>Olivia has held the #1 spot for girls for multiple consecutive years — a rare feat that reflects both its beautiful sound and cultural resonance (Shakespeare's Olivia in Twelfth Night, plus many beloved Olivias in popular culture).</p>
<p>Liam's dominance for boys reflects a broader shift from traditional American names (John, Michael, David) to Celtic-origin names that feel simultaneously classic and fresh.</p>

<h2>Regional Variations</h2>
<p>While national rankings show the above, regional preferences vary:</p>
<ul>
  <li><strong>Southern states</strong>: More traditional names (William, James, Elizabeth) rank higher</li>
  <li><strong>Western states</strong>: Nature and unique names (River, Sage, Atlas) are more popular</li>
  <li><strong>Texas, California, Florida</strong>: Spanish-origin names (Mateo, Sofia, Isabella) rank higher due to Hispanic population</li>
  <li><strong>New England</strong>: Preppy classics (Henry, Eleanor, George, Caroline) perform above average</li>
</ul>
<p>Use <a href="/names/gender/boy/">NameBlooms</a> to explore full popularity trends for any name over time, including regional breakdowns.</p>
`,
  },
  {
    slug: "unique-baby-names-that-age-well",
    title: "Unique Baby Names That Won't Sound Weird at Age 40",
    description:
      "Standing out is great, but some 'unique' names become burdens. Learn how to find names that are genuinely distinctive without being bizarre — names that will serve your child through a lifetime.",
    publishedAt: "2024-10-20",
    category: "Name Guides",
    readingTime: 6,
    content: `
<h2>The Uniqueness Spectrum</h2>
<p>Baby name uniqueness exists on a spectrum: from names everyone has heard but few use, to names that exist only in your family, to names that are essentially invented words. The goal for most parents isn't to be at the extreme end of that spectrum — it's to find names that feel special without becoming a burden.</p>
<p>A useful mental model: <strong>distinctive vs. unusual vs. bizarre</strong>. Distinctive names are uncommon but have a recognizable feel — they sound like names. Unusual names might require explanation but are still clearly names. Bizarre names are genuinely puzzling to most people who hear them.</p>

<h2>Names That Are Distinctive Without Being Outlandish</h2>
<p>These names are given to fewer than 2,000 babies per year (well outside the top 100) but have strong, recognizable sounds and rich histories:</p>
<h3>For Girls</h3>
<ul>
  <li><strong>Juniper</strong> — the juniper tree; fresh, botanical, not overused</li>
  <li><strong>Lyra</strong> — Greek for "lyre"; musical, celestial (Lyra constellation), literary (His Dark Materials)</li>
  <li><strong>Marlowe</strong> — English surname origin; literary (Christopher Marlowe); unisex but skewing feminine</li>
  <li><strong>Saoirse</strong> — Irish for "freedom" (pronounced SEER-sha); bold choice but internationally recognized</li>
  <li><strong>Thessaly</strong> — Greek region name; distinctive, grounded, not invented</li>
</ul>
<h3>For Boys</h3>
<ul>
  <li><strong>Atlas</strong> — Greek Titan who held up the sky; strong, mythological, no nickname needed</li>
  <li><strong>Cassian</strong> — Latin origin; Roman feel; gaining recognition (Andor, the Star Wars series)</li>
  <li><strong>Stellan</strong> — Scandinavian; calm strength; recognizable from actor Stellan Skarsgård</li>
  <li><strong>Leif</strong> — Old Norse for "heir, descendant"; simple, strong, unmistakably name-like</li>
  <li><strong>Caspian</strong> — C.S. Lewis's Prince Caspian; geographic but used as a name for decades</li>
</ul>

<h2>Vintage Names That Feel Fresh Again</h2>
<p>The 80–100 year cycle of name popularity means your great-grandparents' generation's names sound fresh today without any association with current peers:</p>
<ul>
  <li><strong>Girls</strong>: Ada, Iris, Vera, Hazel, Clara, Edith, Margot, Beatrice, Winifred</li>
  <li><strong>Boys</strong>: Felix, Jasper, Clement, Cormac, Hugo, Rupert, Barnaby, Alistair</li>
</ul>

<h2>The Job Interview Test</h2>
<p>Ask yourself: "When my child is 40 years old and introducing themselves as a professional, will this name work?" This isn't about limiting creativity — it's about recognizing that names serve your child across many contexts: job applications, medical forms, international travel, and decades of social interactions.</p>
<p>Names like Pilot Inspektor, Apple, or Hashtag (yes, that's real) fail this test. Names like Atlas, Lyra, or Cassian pass it easily.</p>

<h2>How to Check If a Name Is Truly Unique</h2>
<p>Using the SSA database (accessible through <a href="/names/gender/boy/">NameBlooms</a>), a name with fewer than 500 births in a given year is genuinely uncommon. Fewer than 50 births means your child will almost certainly be the only one with that name in their school. Fewer than 5 births and the SSA doesn't even report the name — that's the "genuinely unique" threshold.</p>
<p>Check popularity trends over time — some names appear rare today because they were popular 40+ years ago and now have an age association. True uniqueness means low numbers across recent decades, not just the most recent year.</p>
`,
  },
  {
    slug: "baby-name-trends-2024-2025",
    title: "Baby Name Trends: What's Rising, What's Falling, What's Next",
    description:
      "Baby names follow cultural cycles driven by nature, pop culture, and shifting aesthetics. Here's what's trending up, what's declining, and what forecast suggests for the next wave.",
    publishedAt: "2024-11-12",
    updatedAt: "2025-02-05",
    category: "Name Trends",
    readingTime: 6,
    content: `
<h2>What's Rising: The Current Wave</h2>

<h3>Nature Names</h3>
<p>Nature-inspired names are in a sustained upswing, driven by ecological awareness and the aesthetic appeal of organic, earthy sounds:</p>
<ul>
  <li><strong>Girls</strong>: River, Sage, Violet, Ivy, Aurora, Flora, Wren, Meadow, Willow, Briar</li>
  <li><strong>Boys</strong>: Ash, Reed, Birch, River (unisex), Stone, Flint, Forest, Cove</li>
</ul>
<p>Violet, Ivy, and Wren have crossed from "unusual" into the mainstream — all now rank in the top 200 nationally. If you want the nature-name feel without the ubiquity, look to less-used botanical names: Linden, Sorrel, Hawthorn, Fern.</p>

<h3>Short, Strong Names</h3>
<p>One-syllable and short two-syllable names are thriving — they feel modern, bold, and easy across languages:</p>
<ul>
  <li><strong>Boys</strong>: Kai, Knox, Jax, Cruz, Blaze, Crew, Zane, Bo</li>
  <li><strong>Girls</strong>: Wren, Blaire, Sloane, Quinn, Blythe, Clove</li>
</ul>

<h3>-a and -ia Endings for Girls</h3>
<p>Girl names ending in flowing vowels continue to dominate: Sophia, Mia, Luna, Aria, Nadia, Olivia, Lydia, Amelia. This pattern reflects a preference for names that feel melodic and femininely coded without being frilly.</p>

<h3>Classic Formal Names for Boys</h3>
<p>After a generation of nickname-as-formal-name (Jake, Josh, Ryan), parents are returning to full formal names: Theodore, Sebastian, Frederick, Cornelius, Edmund. These names feel weighty and serious without being stuffy — they carry the confidence of formality.</p>

<h2>What's Falling: The Fading Names</h2>
<ul>
  <li><strong>Peaked late-2000s names</strong>: Kaylee, Jayden, Brayden, Caden, Aiden (the "-ayden" wave) are declining as they become associated with a specific generation</li>
  <li><strong>Heavy -y endings for girls</strong>: Tammy, Becky, Wendy, Brittany — these carry strong Baby Boomer/Gen X associations</li>
  <li><strong>Traditional nicknames as formal names</strong>: Bobby, Jimmy, Billy — these now feel informal or retro in a less appealing way</li>
  <li><strong>Surnames-as-first-names that peaked</strong>: Madison, Mackenzie, Mason — still popular but declining from their peaks</li>
</ul>

<h2>The TV/Movie Effect on Baby Names</h2>
<p>Pop culture drives name spikes reliably. The most famous example: Khaleesi/Daenerys spiked in 2012–2014 as Game of Thrones rose to cultural dominance. After Daenerys's controversial final season, usage dropped sharply — a cautionary tale about tying a name to a narrative that can change.</p>
<p>More successful cultural imports: names from beloved characters tend to persist — Hermione (Harry Potter) remains popular; Arya (Game of Thrones, but also Sanskrit for "noble") has stuck because it had independent appeal beyond the show.</p>
<p>Upcoming cultural influences to watch: names from major streaming franchises, Korean and Japanese cultural imports (as K-pop and anime influence naming in the US), and vintage revival names featured in prestige television period dramas.</p>

<h2>What's Coming Next</h2>
<p>Based on current cultural trajectories:</p>
<ul>
  <li>More <strong>mythology names</strong>: Orion, Callisto, Perseus, Athena, Clio — ancient names with strong sounds</li>
  <li><strong>Irish and Scottish Gaelic names</strong>: Declan, Aoife, Niamh, Saoirse — as Celtic heritage enjoys renewed interest</li>
  <li><strong>Gemstone and mineral names</strong>: Onyx, Jasper, Garnet, Coral, Opal — extending the nature-name trend</li>
  <li>More <strong>gender-neutral names</strong>: The trend toward names that don't signal binary gender continues</li>
</ul>
<p>Explore full popularity trends for any name on <a href="/names/gender/girl/">NameBlooms</a> — including year-by-year charts from 1880 to today.</p>
`,
  },
  {
    slug: "how-to-choose-baby-name-parents-agree",
    title: "How to Choose a Baby Name Both Parents Will Love",
    description:
      "Name disagreements are one of the most common parenting conflicts. Here are proven strategies to find a name you both genuinely love — not just one you can both tolerate.",
    publishedAt: "2024-11-28",
    category: "Name Guides",
    readingTime: 7,
    content: `
<h2>Why Name Disagreements Are So Common</h2>
<p>Baby names carry enormous emotional weight. Every name is associated with someone — an ex-partner, a beloved grandparent, a bully from middle school. Names trigger memories and associations that aren't always rational but are very real. Add two people with different histories and different aesthetic preferences, and disagreement is almost inevitable.</p>
<p>The good news: with the right framework, almost every couple can find a name they both genuinely love — not just one they can both live with.</p>

<h2>The Elimination Method</h2>
<p>The most effective structured approach:</p>
<ol>
  <li><strong>Each parent independently writes 20 names</strong> they love (no discussing, no editing each other's lists)</li>
  <li><strong>Compare lists and highlight overlaps</strong> — names on both lists are strong candidates</li>
  <li><strong>Share your top 5</strong> and discuss what draws you to each</li>
  <li><strong>Apply the veto</strong> — each parent gets a limited number of vetoes (agree on the number: typically 5–10)</li>
</ol>
<p>This approach works because it starts with what you love, not with defending names from attack. Many couples are surprised to find 2–4 names in common when they do this exercise honestly.</p>

<h2>Setting Up Veto Rules</h2>
<p>Vetoes should be used thoughtfully, not reflexively. Common veto categories to agree on in advance:</p>
<ul>
  <li><strong>Strong personal association</strong>: An ex's name, a family member you have a difficult relationship with, someone who bullied you</li>
  <li><strong>Names the child will struggle with</strong>: Difficult pronunciation, obvious negative nicknames, embarrassing initials</li>
  <li><strong>Non-negotiable aesthetic preferences</strong>: Some people genuinely cannot warm to certain sounds or syllable patterns</li>
</ul>
<p>Vetoes should not be used as negotiating chips. If you veto a name, be prepared to explain why sincerely — "I just don't like it" wears thin and leads to resentment.</p>

<h2>Sorting by Non-Negotiables</h2>
<p>Before generating lists, agree on any absolute requirements:</p>
<ul>
  <li><strong>Family names</strong>: Is there a family naming tradition or a grandparent you want to honor?</li>
  <li><strong>Cultural significance</strong>: Does the name need to reflect a cultural heritage?</li>
  <li><strong>Initials</strong>: Avoid acronyms that spell something embarrassing (ASS, FAT, etc.)</li>
  <li><strong>Sibling coordination</strong>: Does the name need to fit with existing children's names in terms of style and length?</li>
</ul>

<h2>Testing a Name</h2>
<p>Before finalizing, put the name through these tests:</p>
<ul>
  <li><strong>Call it out loud</strong> in different contexts: "Dinner's ready, [Name]!" / "[Name] Reynolds, please come to the front."</li>
  <li><strong>Imagine a teacher calling roll</strong> — how does it sound in a classroom?</li>
  <li><strong>Sign it on art</strong> — does the name work well in a signature?</li>
  <li><strong>Google it</strong> — is there a prominent person with this name you hadn't considered?</li>
  <li><strong>Consider the nickname</strong> — what will their friends call them? Can you live with that?</li>
</ul>

<h2>Middle Name as Compromise Territory</h2>
<p>The middle name is the ideal compromise space. If one parent loves a name the other merely tolerates, putting it in the middle honors the sentiment without making it the primary name.</p>
<p>Middle names are also where family names, unusual names, and sentimental picks work best — the child can choose to use their middle name professionally or personally if they prefer it as an adult.</p>

<h2>What to Do If You Truly Can't Agree</h2>
<p>If you've exhausted the structured process and still can't agree:</p>
<ul>
  <li><strong>Set a deadline</strong>: Agree that you will decide by a certain date and commit to it. Open-ended decisions get more fraught over time.</li>
  <li><strong>Narrow to a final two</strong>: Each person picks their single favorite from the shortlist; flip a coin or agree that whoever delivered the baby gets final say.</li>
  <li><strong>Consider waiting until birth</strong>: Many parents report that seeing their baby makes the right name obvious. You don't have to decide before the baby arrives.</li>
</ul>
<p>Use <a href="/compare/">NameBlooms Compare</a> to research and compare names you're considering — popularity trends, meanings, and alternative spellings can all help both parents make a more informed decision.</p>
`,
  },
  {
    slug: "classic-baby-names-comeback-2025",
    title: "Classic Baby Names Making a Comeback in 2025",
    description:
      "Grandparent names skip a generation before becoming fashionable again. The vintage cycle is in full swing — here are the classic names that feel surprisingly fresh in 2025.",
    publishedAt: "2024-12-10",
    updatedAt: "2025-01-25",
    category: "Name Trends",
    readingTime: 5,
    content: `
<h2>The 80–100 Year Popularity Cycle</h2>
<p>Baby naming follows a remarkably consistent generational cycle. Names popular in the 1920s–1940s (your great-grandparents' generation) feel fresh and distinctive today, while names popular in the 1970s–1990s (your parents' generation) still feel "dated" to many.</p>
<p>The psychology behind this: names become associated with the age group that bore them. Names like Barbara, Linda, and Gary feel middle-aged because most people named Barbara, Linda, and Gary are now in their 60s–80s. But Eleanor, Beatrice, and Frederick — names from two generations back — have aged long enough that they no longer feel old. They feel <em>vintage</em>.</p>

<h2>Classic Girls' Names Staging a Comeback</h2>
<ul>
  <li><strong>Hazel</strong> — peaked in the early 1900s; now back in the top 50 and rising fast. Literary (Hazel Grace Lancaster in The Fault in Our Stars), botanical, and beautifully balanced.</li>
  <li><strong>Violet</strong> — strong, colorful, undeniably feminine. Already cracked the top 50 and still rising.</li>
  <li><strong>Eleanor</strong> — presidential, dignified, and offers flexible nicknames (Ellie, Nora, Nell). Rising steadily for a decade.</li>
  <li><strong>Beatrice</strong> — Shakespearean (Much Ado About Nothing), royal (Princess Beatrice), literary (Dante's Beatrice). Ready for wider revival.</li>
  <li><strong>Florence</strong> — geographically romantic, musically associated (Florence + the Machine), medically inspiring (Florence Nightingale). Feeling fresh.</li>
  <li><strong>Ida</strong> — short, strong, almost bold in its simplicity. Danish and Scandinavian roots. Genuinely rare today.</li>
  <li><strong>Pearl</strong> — gemstone names are back; Pearl was top 100 in the early 1900s and feels ripe for revival.</li>
  <li><strong>Edith</strong> — longer to rehabilitate than Hazel or Violet, but gaining ground. Downton Abbey's Lady Edith helped.</li>
</ul>

<h2>Classic Boys' Names Staging a Comeback</h2>
<ul>
  <li><strong>Henry</strong> — already back in the top 10; the vintage revival champion. Royal, strong, easily nicknamed (Hank, Harry).</li>
  <li><strong>Theodore</strong> — similarly top 10 and climbing. Presidential, dignified, offers Theo as a modern nickname.</li>
  <li><strong>Arthur</strong> — Arthurian legend meets great-grandfather charm. Solid top 100 and still rising.</li>
  <li><strong>George</strong> — the royal effect (Prince George) accelerated what was already a gradual revival.</li>
  <li><strong>Walter</strong> — Breaking Bad's Walter White complicated the name temporarily, but it's recovering. Strong, short, unambiguously masculine.</li>
  <li><strong>Eugene</strong> — not yet back in fashion but getting early adopter attention from name enthusiasts. Nickname Gene works for any generation.</li>
  <li><strong>Harvey</strong> — complicated by the Weinstein era but recovering. The name is older and more venerable than its recent associations.</li>
  <li><strong>Roscoe</strong> — genuinely rare today (fewer than 200 births annually), this 1920s classic is ready for discovery.</li>
</ul>

<h2>How to Tell Vintage-Cool from Vintage-Stodgy</h2>
<p>Not every old name is ripe for revival. The difference between Eleanor (vintage-cool) and Bertha (vintage-stodgy) involves several factors:</p>
<ul>
  <li><strong>Sound</strong>: Names with flowing vowel sounds and soft consonants age better than harsh or heavy names</li>
  <li><strong>Cultural anchors</strong>: Names with literary, artistic, or historical associations beyond their peak era age better</li>
  <li><strong>Nickname potential</strong>: Names with modern-sounding short forms (Eleanor → Nell, Theodore → Theo) bridge generations</li>
  <li><strong>Current usage in other countries</strong>: Names still popular in the UK, Australia, or Scandinavia signal wider viability</li>
</ul>
<p>Explore full SSA popularity trends for any classic name on <a href="/names/gender/girl/">NameBlooms</a> — the year-by-year chart immediately shows where a name is in its cycle.</p>
`,
  },
];

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllCategories(): string[] {
  return [...new Set(posts.map((p) => p.category))];
}
