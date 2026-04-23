/**
 * Long-form evergreen guides — US baby name data, naming trends,
 * and the science of choosing a name. Hub pages that link deep into
 * the name explorer and rankings matrix.
 */

export interface Guide {
  slug: string;
  title: string;
  description: string;
  intro: string; // HTML
  sections: Array<{ heading: string; html: string }>;
  faqs: Array<{ question: string; answer: string }>;
  category: string;
  updatedAt: string;
}

const u = '2026-04-10';

export const guides: Guide[] = [
  {
    slug: 'ssa-baby-name-data',
    title: 'How SSA Baby Name Data Works: Sources, Limits, and What It Actually Measures',
    description: 'The Social Security Administration has tracked US baby names since 1880. Learn how the data is collected from birth certificates, what the 5-occurrence threshold means, and what the dataset cannot tell you.',
    category: 'Data Sources',
    updatedAt: u,
    intro: `<p>Every baby name trend article you have ever read is based on a single dataset: the Social Security Administration's baby names file. It covers over 350 million name records stretching back to 1880 and is updated each May for the previous calendar year. But the dataset has significant blind spots that most articles never mention. This guide explains exactly how the data is collected, what the thresholds mean, and where the numbers fall short.</p>`,
    sections: [
      {
        heading: 'How SSA collects name data',
        html: `<p>The data comes from Social Security card applications (Form SS-5), not from birth certificates directly. When a parent applies for a Social Security number for their newborn, the name on that application enters the dataset. Before 1937, coverage was spotty because Social Security did not exist until 1935 and most applications came from working-age adults. Coverage became essentially universal by the late 1940s.</p><p>Each record includes the child's first name, sex assigned at birth, state of birth, and year of birth. Middle names are not recorded. Hyphenated first names are recorded as a single entry (Mary-Jane, not Mary + Jane). Suffixes like Jr. or III are stripped.</p>`,
      },
      {
        heading: 'The 5-occurrence privacy threshold',
        html: `<p>Any name given to fewer than 5 babies of the same sex in a given year is excluded from the public file. This is a privacy measure, not a data quality filter. It means the published dataset undercounts rare names significantly. In any given year, roughly 4,000 to 6,000 unique name-sex combinations fall below this threshold and are suppressed.</p><p>The practical effect: if you are researching a truly unusual name, the SSA file may show zero occurrences even though 1-4 babies received it that year. The national file and the state-level files apply this threshold independently, so a name with 3 occurrences in California and 3 in Texas (6 total) might appear in the national file but not in either state file.</p>`,
      },
      {
        heading: 'What changed after 1937 and again after 1986',
        html: `<p>Two legislative events reshaped the dataset. First, Social Security expanded coverage in 1937, which dramatically increased the number of infant applications. Pre-1937 data is heavily biased toward names common among adults who applied for work-related Social Security numbers.</p><p>Second, the Tax Reform Act of 1986 required parents to list a child's SSN on tax returns to claim the dependent deduction. Before 1986, many parents delayed SSN applications for years. After 1986, applications became nearly universal at birth. This is why post-1986 data is considered the most reliable era for name frequency analysis.</p>`,
      },
      {
        heading: 'What the dataset cannot tell you',
        html: `<p>Several important dimensions are missing:</p><ul><li><strong>Gender-neutral tracking</strong> — the dataset assigns every name to exactly one sex category per record. A name like "Avery" appears in both the male and female files, but you cannot tell how many parents chose it specifically as a gender-neutral name. There is no non-binary or unspecified category in historical data.</li><li><strong>Race and ethnicity</strong> — SSA does not record race. You cannot determine from this dataset alone whether a name is more common in one ethnic group.</li><li><strong>Spelling intent</strong> — Kaitlyn, Katelyn, Caitlin, and Katelynn are four separate entries. There is no built-in way to group spelling variants.</li><li><strong>Pronunciation</strong> — two identically spelled names with different pronunciations (e.g., "Andrea" with stress on the first vs. second syllable) are merged.</li></ul>`,
      },
      {
        heading: 'How NameBlooms uses SSA data',
        html: `<p>Our <a href="/search/">name search</a> pulls directly from the most recent SSA national file and normalize for annual birth volume. When we say a name was "#47 in 2024," we mean it was the 47th most frequently applied-for name on SS-5 forms that year. We group common spelling variants in our <a href="/">explorer</a> so you can see combined popularity, and we flag names that cross the gender boundary in our trend charts.</p><p>For historical trends, we use the full 1880-present file but add a reliability flag for pre-1937 data. Any trend line before 1937 should be interpreted with caution due to the adult-application bias described above.</p>`,
      },
      {
        heading: 'Annual release schedule',
        html: `<p>SSA publishes the previous year's data each May, typically in the second or third week. The exact date is not announced in advance. The release includes both the national file and 51 state-level files (50 states plus DC). Territories like Puerto Rico and Guam are not included in the standard release. Each file is a simple CSV with three columns: name, sex, and count.</p>`,
      },
    ],
    faqs: [
      { question: 'How far back does SSA baby name data go?', answer: 'The public file starts in 1880, but data before 1937 is unreliable because Social Security did not exist yet and most records came from adult applicants rather than infants. Post-1986 data is the most accurate.' },
      { question: 'Why does the SSA list show zero results for my name?', answer: 'If fewer than 5 babies of the same sex received your name in a given year, the SSA suppresses it for privacy. Your name was used, but the count was too low to publish.' },
      { question: 'Does SSA track middle names?', answer: 'No. Only the first name from the Social Security card application is recorded. Middle names, nicknames, and preferred names are not included in the dataset.' },
      { question: 'How accurate are the SSA name counts?', answer: 'After 1986, when the Tax Reform Act made infant SSN applications nearly universal, the counts are considered highly accurate for names above the 5-occurrence threshold. They may undercount by 1-2% due to delayed applications.' },
      { question: 'Can I find name data broken down by race or ethnicity?', answer: 'Not from SSA. The Social Security application does not collect race or ethnicity. For demographic breakdowns, researchers use state vital statistics records, which some states publish with race categories.' },
      { question: 'Why do different baby name sites show different rankings?', answer: 'Most sites use the same SSA data but may group spelling variants differently, use different years, or count both sexes together. Always check which year and whether variants are merged.' },
      { question: 'Does SSA track non-binary or gender-neutral name assignments?', answer: 'No. Every record in the SSA file is tagged as either male or female based on the sex recorded on the application. There is no gender-neutral or non-binary category in the historical data.' },
    ],
  },
  {
    slug: 'name-popularity-cycles',
    title: 'The 100-Year Name Cycle: Why Your Grandmother\'s Name Is Trending Again',
    description: 'Baby names follow a roughly 100-year popularity cycle. Learn why names like Evelyn, Hazel, and Theodore are back, how phonetic trends spread, and what predicts the next wave.',
    category: 'Trends',
    updatedAt: u,
    intro: `<p>In 2024, Evelyn ranked #9 for girls and Theodore ranked #10 for boys. Both names were top-20 names around 1910-1920 and spent decades in obscurity before their revival. This is not a coincidence. Baby name researchers have documented a predictable cycle: a name rises, peaks, declines over 50-60 years until it sounds "old," then sits dormant for another 30-40 years until it sounds "vintage" rather than "dated." The full cycle is roughly 100 years. This guide explains the mechanism and how to spot what is coming next.</p>`,
    sections: [
      {
        heading: 'The generational taste engine',
        html: `<p>Parents almost never name children after their own generation. The names of your peers feel overused and boring. But your grandparents' names are far enough removed to feel fresh. This is the core mechanism: each generation skips one and revives the one before.</p><p>Sociologist Stanley Lieberson documented this pattern in his 2000 study of naming fashions. He found that parents actively avoid names they associate with people their own age, but feel positive about names two generations back. The result is a roughly 80-110 year cycle depending on the name and the culture.</p>`,
      },
      {
        heading: 'The phonetic wave effect',
        html: `<p>Names do not revive in isolation. They come back as part of phonetic clusters. In the 2000s, the "-aiden" sound exploded: Aiden, Jayden, Brayden, Kayden, Hayden. By 2010, parents who liked the sound but wanted something less common shifted to Zayden and Raiden. By 2015, the entire cluster was declining as it became associated with a specific generation.</p><p>The same mechanism is visible in girls' names: the "-ella" cluster (Ella, Isabella, Arabella, Gabriella) peaked around 2010-2015 and is now gradually declining. The rising replacement cluster appears to be "-ina" and "-ona" endings: Serena, Leona, Ramona.</p><p>Explore phonetic patterns across decades in our <a href="/search/">name search</a> tool.</p>`,
      },
      {
        heading: 'Cross-cultural diffusion',
        html: `<p>Names also spread geographically. A name that peaks in Scandinavia often appears in the US 10-15 years later, especially through popular culture. Liam was a top-10 name in Ireland for decades before it hit #1 in the US in 2017. Similarly, Mateo came from Spanish-speaking countries, and Kai from Hawaiian and Northern European roots.</p><p>The diffusion pattern typically follows: origin culture (peak) -> diaspora communities in the US -> mainstream adoption -> saturation -> decline. The full US adoption cycle from first appearance in the top-1000 to peak usually takes 15-25 years.</p>`,
      },
      {
        heading: 'Why some names never come back',
        html: `<p>Not every name completes the cycle. Names that become permanently associated with a single famous person (Adolf, Katrina after the hurricane) or with a negative cultural moment can be suppressed indefinitely. Names that sound like common words also struggle: Gay was a top-500 name through the 1960s but has not returned due to its evolving meaning in English.</p><p>Conversely, names with strong positive cultural associations tend to revive faster. Charlotte got a significant boost from the British royal family, and Arya surged after the television adaptation of A Song of Ice and Fire.</p>`,
      },
      {
        heading: 'The compression effect in the internet era',
        html: `<p>The 100-year cycle may be shortening. Social media exposes parents to a wider range of names faster, which accelerates both the adoption and exhaustion phases. Names that would have taken 20 years to peak in the pre-internet era now peak in 10-12 years. The "vintage revival" window may also be shrinking, as parents discover old names through digital baby name tools rather than waiting for them to feel naturally fresh.</p><p>This compression makes prediction harder. The window between "undiscovered vintage gem" and "overused trend name" is getting narrower every year.</p>`,
      },
      {
        heading: 'How to predict the next wave',
        html: `<p>Three indicators reliably predict which names will surge in the next 5-10 years:</p><ol><li><strong>Rising from below rank 500</strong> — names climbing from obscurity at a rate of 50+ ranks per year are on the acceleration curve. Use our <a href="/search/">search tool</a> to spot these movers.</li><li><strong>100 years past the last peak</strong> — look at the top names from 1920-1935. Names like Dorothy, Harold, and Frances that have not yet revived are statistically likely candidates.</li><li><strong>Phonetic similarity to current hits</strong> — if Hazel is top-30 now, other two-syllable names ending in "-el" (Mabel, Ethel, Muriel) have elevated odds of revival.</li></ol>`,
      },
    ],
    faqs: [
      { question: 'Why do baby names go in and out of style?', answer: 'Parents avoid names that feel "current" (their own peers) and gravitate toward names that feel either novel or charmingly vintage (two generations back). This creates a roughly 100-year cycle where names decline, go dormant, and then revive.' },
      { question: 'Is the 100-year cycle exact?', answer: 'No, it ranges from roughly 80 to 120 years depending on the name, cultural events, and whether a celebrity or fictional character accelerates the revival. It is a tendency, not a clock.' },
      { question: 'What old names are coming back right now?', answer: 'As of 2024-2025, the fastest-rising vintage revivals include names from the 1910-1930 era: Theodore, Hazel, Josephine, Arthur, Cora, and Felix. Check our rankings for the latest year-over-year movers.' },
      { question: 'Why did everyone name their kids Aiden at the same time?', answer: 'Phonetic clusters spread through social networks. Once Aiden became popular, parents who liked the sound but wanted variation created Jayden, Brayden, Kayden, and Hayden. The entire -aiden cluster peaked between 2008-2012 and is now declining.' },
      { question: 'Can a name become permanently extinct?', answer: 'Effectively, yes. Names with strong negative associations (linked to dictators, disasters, or slurs) can be suppressed indefinitely. However, most merely "unfashionable" names eventually return given enough time.' },
      { question: 'Do names spread from one country to another?', answer: 'Yes. Names typically peak in their culture of origin first, then appear in diaspora communities, then enter mainstream use in the US 10-15 years later. Liam, Mateo, and Kai all followed this pattern.' },
    ],
  },
  {
    slug: 'cultural-name-trends',
    title: 'Cultural Naming Traditions in the US: Hispanic, Asian-American, African-American, and Jewish Patterns',
    description: 'How cultural heritage shapes baby naming in the US. From compound Hispanic names and Asian-American dual naming to African-American linguistic innovation and Jewish memorial naming.',
    category: 'Culture',
    updatedAt: u,
    intro: `<p>The United States is one of the few countries where naming traditions from dozens of cultures coexist and cross-pollinate. The SSA top-1000 list increasingly reflects this diversity, with names like Mateo, Kai, and Aaliyah climbing alongside traditional Anglo names. But the SSA data alone misses the cultural logic behind these choices. This guide examines four major naming traditions and how they interact in the American context.</p>`,
    sections: [
      {
        heading: 'Hispanic naming patterns',
        html: `<p>Hispanic naming in the US draws from multiple traditions. In many Latin American cultures, children receive two given names (nombre compuesto): Juan Carlos, Maria Fernanda, Jose Luis. The SSA dataset records only the first name on the application, so compound names are often split or only the first element is captured.</p><p>Saint names (santos) remain influential, especially for families with Catholic roots. The tradition of naming a child for the saint on whose feast day they were born has declined but persists in some communities. Names like Santiago ("Saint James"), Guadalupe, and Milagros carry religious significance.</p><p>Among US-born Hispanic families, a common pattern is pairing a Spanish first name with an English-compatible middle name or vice versa. This dual-compatibility strategy helps the child navigate both cultural contexts.</p>`,
      },
      {
        heading: 'Asian-American dual naming',
        html: `<p>Many Asian-American families maintain a dual naming system: a legal English name for official documents and an ethnic-language name used within the family and community. Chinese-American families might name a child "Emily" on the birth certificate while using "Mei-Ling" at home. Korean-American families often choose a Korean given name following generational naming conventions (dolimja) and a separate English name.</p><p>A growing trend among younger Asian-American parents is choosing names that work in both languages. "Hana" works in Japanese (flower), Korean (one/first), and English. "Kai" works in Hawaiian, Japanese, and English. These cross-linguistic names have been rising sharply in SSA data since 2015.</p>`,
      },
      {
        heading: 'African-American naming innovation',
        html: `<p>African-American naming practices are among the most linguistically creative in the country. Research by sociologist Lieberson and linguist Lisa Green identifies several distinct patterns:</p><ul><li><strong>Phonetic innovation</strong> — creating new names by combining familiar sounds in novel ways: DeShawn, LaToya, Jamal, Shaniqua. These names follow consistent phonological rules (common prefixes like De-, La-, Ja-, Sha-; common suffixes like -awn, -ique, -isha).</li><li><strong>Afrocentric revival</strong> — choosing names from African languages, especially Swahili (Imani, Amara, Zuri) and Yoruba (Ayodele, Oluwaseun). This trend gained momentum during the 1960s-70s Black Power movement and continues today.</li><li><strong>Unique spelling</strong> — intentional respelling of common names to create distinctiveness: Jaxon, Kayla, Jayceon.</li></ul><p>The Bertrand and Mullainathan 2004 resume study unfortunately demonstrated that distinctive African-American names face discrimination in hiring, which has created tension between cultural expression and economic pragmatism in naming choices.</p>`,
      },
      {
        heading: 'Jewish naming traditions',
        html: `<p>Ashkenazi Jewish tradition names children after deceased relatives as a memorial (no living namesakes). Sephardic Jewish tradition names children after living grandparents as an honor. These opposing customs sometimes create confusion in mixed Ashkenazi-Sephardic families.</p><p>A common American adaptation is the "initial match": if the deceased relative was named "Samuel," the child might be named "Sophia" — preserving the first letter while choosing a modern English name. This practice explains why certain letters cycle in popularity within Jewish families across generations.</p><p>Hebrew names are often given alongside English names, used during religious ceremonies (bar/bat mitzvah, synagogue honors). The Hebrew name typically follows the format "[name] ben/bat [father's name]" and increasingly "[name] ben/bat [father's and mother's names]."</p>`,
      },
      {
        heading: 'Cross-cultural convergence',
        html: `<p>The most significant trend in US naming data is convergence. Names like Noah (Hebrew origin), Liam (Irish), Mateo (Spanish), and Kai (Hawaiian/Japanese) now appear together in the top 20 regardless of the family's ethnic background. This cross-cultural borrowing accelerates through social media, where parents discover names outside their own tradition.</p><p>However, convergence is asymmetric. Anglo and European names are freely adopted across cultures, but African-American innovative names and Hispanic compound names are less frequently borrowed by other groups. Researchers attribute this to social signaling: names carry information about perceived social class and ethnicity, and adoption patterns follow existing power dynamics.</p>`,
      },
      {
        heading: 'Practical implications for name research',
        html: `<p>When exploring names on our <a href="/">name explorer</a>, keep in mind that SSA data flattens cultural context. "Maria" as a standalone first name and "Maria" as the first element of "Maria Fernanda" are counted identically. A name's rank tells you how many babies received it, but not the cultural reasoning behind the choice.</p><p>For cultural context, pair our <a href="/search/">name data</a> with knowledge of your own family's traditions. The "best" name is one that honors your heritage, works in the communities your child will navigate, and does not create unnecessary friction in daily life.</p>`,
      },
    ],
    faqs: [
      { question: 'What are the most popular Hispanic baby names in the US?', answer: 'As of 2024, Mateo, Santiago, and Leonardo rank highest for boys. Sofia, Isabella, and Valentina lead for girls. These names rank well overall because they work in both Spanish and English.' },
      { question: 'Why do some African-American names use prefixes like De- or La-?', answer: 'These prefixes follow systematic phonological rules in African-American English and function as name-formation tools similar to how "-son" works in English surnames. They are a form of linguistic creativity, not random invention.' },
      { question: 'What does it mean to name a child after a deceased relative in Jewish tradition?', answer: 'In Ashkenazi (Eastern European) Jewish tradition, naming after a living person is considered bad luck. Children are named after deceased family members to honor their memory. The child may receive the same name or a name sharing the first letter.' },
      { question: 'Do Asian-American families register their child with an English or ethnic name?', answer: 'Practices vary widely. Many families register an English name on the birth certificate and maintain an ethnic-language name informally. Some register the ethnic name as a legal middle name. A growing number choose cross-linguistic names that work in both languages.' },
      { question: 'Is it cultural appropriation to choose a name from another culture?', answer: 'This is a personal and evolving question. Names like Kai, Aria, and Maya have been widely adopted across cultural boundaries. Many naming experts suggest understanding the name meaning and origin and ensuring it is used respectfully, especially for names with deep religious or sacred significance.' },
    ],
  },
  {
    slug: 'unique-vs-common-name-impact',
    title: 'Does Your Baby\'s Name Affect Their Future? What the Research Actually Says',
    description: 'From the Figlio teacher-bias study to the Freakonomics chapter, here is what peer-reviewed research actually shows about how names influence life outcomes.',
    category: 'Research',
    updatedAt: u,
    intro: `<p>Parents agonize over whether an unusual name will help their child stand out or hold them back. The internet is full of confident claims in both directions, most of them citing the same handful of studies out of context. This guide examines the actual peer-reviewed research on names and outcomes: what it found, what it did not find, and what it means for your decision.</p>`,
    sections: [
      {
        heading: 'The Figlio study: teacher expectations',
        html: `<p>In 2005, economist David Figlio published a study using Florida school records to test whether teachers graded students differently based on name. He found that students with names linguistically associated with lower socioeconomic status (measured by phonetic patterns, not race) received lower teacher expectations in subjective evaluations but not in standardized test scores.</p><p>The critical nuance: the name did not affect the child's actual ability. It affected the teacher's initial perception, which was corrected once objective test data was available. The effect was small (roughly 0.1 standard deviations) and disappeared in settings with blind grading.</p>`,
      },
      {
        heading: 'The resume study: hiring discrimination',
        html: `<p>Bertrand and Mullainathan's 2004 field experiment sent identical resumes to job postings with either stereotypically White names (Emily, Greg) or stereotypically African-American names (Lakisha, Jamal). "White-sounding" names received 50% more callbacks.</p><p>This study demonstrated real discrimination in hiring, but it is frequently misinterpreted. The study tested employer bias, not name effects. An employer who rejects "Lakisha" is discriminating based on perceived race, not based on the name itself. Giving an African-American child a traditionally White name does not eliminate racial discrimination — it may slightly reduce one specific type of resume screening bias while creating other identity costs.</p>`,
      },
      {
        heading: 'The Freakonomics claim — and why researchers dispute it',
        html: `<p>In their 2005 book, Levitt and Doniger argued that a child's name does not cause better or worse outcomes — it merely correlates with the socioeconomic status of the parents who chose it. A boy named "Winner" will not win more than a boy named "Loser" (and in the famous case they cited, Loser Lane actually had a more successful career than Winner Lane).</p><p>This conclusion is broadly supported by the data but oversimplified. More recent research shows that names can have small independent effects through social signaling, teacher expectations, and hiring callbacks. The name is not destiny, but it is not zero-signal either. The effect size is small — dwarfed by family income, education, and neighborhood — but it exists.</p>`,
      },
      {
        heading: 'LinkedIn data and career outcomes',
        html: `<p>Several analyses of LinkedIn profiles have found correlations between name characteristics and career outcomes. Names that are easy to pronounce are associated with higher-ranking positions and more connection requests. Names that are culturally ambiguous (could belong to any ethnicity) are associated with slightly higher callback rates in international job markets.</p><p>However, these are correlations, not experiments. People with easy-to-pronounce names may also come from families with more social capital. The causal effect of name pronunciation on career success, if any, is likely very small.</p>`,
      },
      {
        heading: 'The initials effect and name-letter studies',
        html: `<p>A 1999 study in the Journal of Psychosomatic Research claimed that men with "negative" initials (like D.I.E. or P.I.G.) died earlier than men with "positive" initials (like A.C.E. or V.I.P.). This became widely cited as proof that names affect health outcomes.</p><p>The study has not replicated. A 2015 reanalysis with larger data found no effect. The original result was likely a statistical artifact of multiple comparisons — when you test thousands of initial combinations, some will show random patterns. The scientific consensus today is that initials do not affect lifespan.</p><p>A related line of research, the "name-letter effect," shows that people have a slight unconscious preference for letters in their own name. People named Dennis are marginally overrepresented among dentists. But the effect size is tiny and contested, and subsequent research suggests it may be a statistical artifact rather than a real psychological phenomenon.</p>`,
      },
      {
        heading: 'What this means for choosing a name',
        html: `<p>The honest summary of the research:</p><ul><li>Names have small, real effects on first impressions and callback rates</li><li>These effects are dwarfed by family socioeconomic status, education quality, and individual ability</li><li>Unusual names do not harm children; discrimination against perceived ethnicity harms children</li><li>Easy-to-pronounce names have a small practical advantage in professional contexts</li><li>The initials effect and name-letter effect are likely not real</li></ul><p>Choose a name you love. If you want to minimize social friction, consider pronunciation clarity and international compatibility. But do not believe anyone who tells you a name determines success or failure — the evidence does not support that claim. Explore options in our <a href="/">name explorer</a>.</p>`,
      },
    ],
    faqs: [
      { question: 'Do unusual names hurt children?', answer: 'The research shows no consistent negative effect from unusual names themselves. Discrimination based on perceived ethnicity or socioeconomic status (which names can signal) does have measurable effects, but those are problems of bias, not of names.' },
      { question: 'Is the Freakonomics chapter about names accurate?', answer: 'Broadly yes — the core claim that names correlate with but do not cause outcomes is supported. However, more recent research shows small independent effects through hiring callbacks and teacher expectations that the original analysis did not capture.' },
      { question: 'Do employers discriminate based on names?', answer: 'Yes. The Bertrand/Mullainathan study found a 50% callback gap between stereotypically White and African-American names on identical resumes. This reflects employer discrimination, not an inherent property of names.' },
      { question: 'Do initials really affect lifespan?', answer: 'Almost certainly not. The original 1999 study claiming people with "negative" initials die younger has failed to replicate in larger datasets. The scientific consensus considers it a statistical artifact.' },
      { question: 'Should I choose an easy-to-pronounce name?', answer: 'Easy pronunciation correlates with slightly more positive first impressions in professional settings. But this is a small advantage, not a determining factor. Many highly successful people have names that require explanation. Choose based on meaning and heritage first.' },
      { question: 'Does name popularity matter for outcomes?', answer: 'There is no evidence that common names lead to better outcomes than uncommon ones. The slight advantage of recognizability is offset by the slight advantage of memorability. Pick based on personal preference, not rank.' },
      { question: 'What is the name-letter effect?', answer: 'A hypothesis that people prefer letters in their own name and may unconsciously gravitate toward careers, cities, or partners matching those letters. The effect is contested in current research and likely too small to matter for practical decisions.' },
    ],
  },
  {
    slug: 'choosing-baby-name-data',
    title: 'Choosing a Baby Name with Data: Sound Symbolism, Initials, and Practical Factors',
    description: 'A research-backed guide to the practical science of choosing a baby name. Covers sound symbolism, the initials myth, spelling considerations, and international compatibility.',
    category: 'Practical Guide',
    updatedAt: u,
    intro: `<p>Choosing a baby name is one of the few decisions that is both deeply emotional and surprisingly data-rich. Decades of linguistics, psychology, and demographic research offer useful (if sometimes surprising) insights into how names work in practice. This guide covers what the research says about sound, spelling, initials, and cross-cultural compatibility — without telling you what name to pick.</p>`,
    sections: [
      {
        heading: 'Sound symbolism: why some names "feel" strong or soft',
        html: `<p>Sound symbolism is the phenomenon where certain speech sounds carry unconscious associations. Hard consonants (K, T, D, G) are associated with strength, sharpness, and masculinity across cultures. Soft consonants and open vowels (L, M, N, -ah, -ee) are associated with warmth, softness, and femininity.</p><p>This is not arbitrary. Research by linguists Sapir (1929) and more recently Sidhu and Pexman (2018) has shown that even people who do not speak a given language can reliably guess which of two foreign names is male or female based on sound alone. Names like "Max" and "Drake" feel strong because of hard consonants. Names like "Lily" and "Amelia" feel soft because of nasals and open vowels.</p><p>This does not mean you must follow the pattern. Some of the most striking names deliberately break it — "Grace" is soft in meaning but ends with a hard consonant. Awareness of sound symbolism simply helps you understand why a name gives you a particular "feeling."</p>`,
      },
      {
        heading: 'The initials question: do they matter?',
        html: `<p>Parents often worry about initials. Will "Anthony Steven Smith" be mocked for "A.S.S."? The practical concern is reasonable. The scientific concern (that initials affect health or success) is not supported by evidence — the widely cited "D.I.E. study" from 1999 has failed to replicate.</p><p>Pragmatically, check the three-letter monogram (first-middle-last) and the two-letter version (first-last). Avoid initials that spell common slang terms or profanity, as children will discover this by middle school. Beyond that, initials do not appear to have any measurable effect on outcomes.</p>`,
      },
      {
        heading: 'Spelling and pronunciation clarity',
        html: `<p>A name that requires frequent spelling correction creates a small daily friction. Research on "processing fluency" shows that easy-to-process stimuli are rated more positively — this extends to names. People whose names are easy to pronounce on first reading receive slightly warmer first impressions in experimental settings.</p><p>This does not mean you must choose a common name. It means that if you choose an unusual name, a phonetically transparent spelling helps. "Saoirse" is challenging for most Americans; "Sersha" is immediately pronounceable (though purists may object). "Joaquin" is well-known enough now to be broadly recognized, whereas "Haukeen" would confuse.</p><p>Check how your chosen name appears in our <a href="/">name explorer</a> to see if common misspellings exist in the SSA data.</p>`,
      },
      {
        heading: 'International compatibility',
        html: `<p>If your child may live, work, or travel internationally, consider how the name translates across languages. Key factors:</p><ul><li><strong>Phoneme availability</strong> — the "th" sound does not exist in most non-English languages. Names like "Ethan" become "Esan" or "Etan" in many countries.</li><li><strong>Unwanted meanings</strong> — "Mark" is unremarkable in English but means "worm" in some Scandinavian dialects. "Nina" means "little girl" in Spanish but has different connotations in parts of South Asia.</li><li><strong>Character compatibility</strong> — names with letters like J, W, or X may be difficult in languages that lack these characters or assign them different sounds.</li><li><strong>Length</strong> — Japanese official forms limit names to a specific number of characters. German compound words can make long names unwieldy.</li></ul><p>Names that work well across many languages tend to use common phonemes (M, N, L, K, S) and end in vowels: Mila, Leo, Kai, Sara, Luca, Nina.</p>`,
      },
      {
        heading: 'Sibling name cohesion',
        html: `<p>If you already have children, the new name enters a set. Parents naturally gravitate toward names that "match" their existing children's names in some dimension: similar length, similar era, similar origin, or similar popularity band. Mismatches can feel jarring — "Elizabeth, Catherine, and Braxtyn" or "Aiden, Jayden, and Margaret" create a cognitive hiccup.</p><p>The most common cohesion strategies are: same origin language, similar syllable count, complementary (not rhyming) sounds, and similar popularity rank. You do not need to match on all dimensions — one or two shared features create enough cohesion.</p>`,
      },
      {
        heading: 'The data-driven shortlist method',
        html: `<p>Here is a practical process that combines data with personal preference:</p><ol><li><strong>Start with meaning and heritage</strong> — list names from your cultural background or with meanings that resonate.</li><li><strong>Check popularity band</strong> — use our <a href="/search/">search tool</a> to see where each name falls. Decide if you want top-50 (familiar), 100-500 (recognizable but not ubiquitous), or 500+ (unusual).</li><li><strong>Check trend direction</strong> — a name currently at #200 and rising fast may be #40 by the time your child enters school. A name at #200 and falling will feel increasingly distinctive.</li><li><strong>Test pronunciation</strong> — say the full name (first + middle + last) aloud 10 times. Does it flow? Does any combination create an unintended word or rhythm?</li><li><strong>Test spelling</strong> — imagine spelling it over the phone to a customer service agent. If it takes more than one attempt, factor that in.</li><li><strong>Check initials</strong> — verify the monogram does not spell anything unfortunate.</li></ol>`,
      },
    ],
    faqs: [
      { question: 'What is sound symbolism in baby names?', answer: 'Sound symbolism is the cross-cultural tendency for certain speech sounds to carry unconscious associations. Hard consonants (K, T, G) feel strong, while soft consonants and open vowels (L, M, -ah) feel gentle. This affects the "personality" people instinctively assign to a name.' },
      { question: 'Do initials really matter when choosing a name?', answer: 'Practically, avoid three-letter combinations that spell slang or profanity. Scientifically, there is no reliable evidence that initials affect health, success, or happiness. The frequently cited "death by initials" study has not replicated.' },
      { question: 'How do I pick a name that works in multiple languages?', answer: 'Choose names using common phonemes (M, N, L, K, S) that end in vowels. Avoid sounds that do not exist in major languages (the English "th," for instance). Names like Mila, Leo, Sara, and Kai work across many languages.' },
      { question: 'Should sibling names match?', answer: 'They do not need to match, but mild cohesion (similar era, origin, or syllable count) tends to feel natural. Avoid names that rhyme with each other or have identical initial letters, as this creates confusion in daily life.' },
      { question: 'Is a popular name or unique name better?', answer: 'Neither is inherently better. Popular names are easy to spell and pronounce but may have several classmates sharing the name. Unique names are distinctive but may require frequent spelling. Most parents find a sweet spot between rank 50 and 500.' },
      { question: 'How important is the meaning of a baby name?', answer: 'Meaning matters as much as you want it to. Most people never learn the etymological meaning of names they encounter. But for the parent and child, knowing the meaning can create a personal connection to heritage, values, or family history.' },
    ],
  },
];

export function getAllGuides(): Guide[] {
  return guides;
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
