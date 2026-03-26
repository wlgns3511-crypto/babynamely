/**
 * Name analysis: trend detection, cultural context, naming tips
 */

interface PopularityEntry { year: number; pct: number }

// Origin cultural context
const originDescriptions: Record<string, string> = {
  Hebrew: "Hebrew names have deep biblical and spiritual roots. Many of the most enduring names in Western culture — like David, Sarah, and Michael — come from Hebrew. These names often carry meanings related to God, strength, or blessings.",
  Germanic: "Germanic names reflect a tradition of strength and nobility. Names like William (will + helmet) and Richard (powerful ruler) combine elements describing warrior qualities. Many modern English names evolved from Old German roots.",
  Latin: "Latin names carry the legacy of the Roman Empire. Names like Julia, Marcus, and Victor were common in ancient Rome and remain popular today. Many Latin names relate to virtues, nature, or family lineage.",
  Greek: "Greek names connect to one of the world's oldest civilizations. Names like Alexander (defender of the people) and Sophia (wisdom) reflect Greek values of knowledge, strength, and beauty. Many are rooted in mythology.",
  Celtic: "Celtic names originate from Irish, Scottish, Welsh, and Breton traditions. Names like Aiden (fire), Brigid (strength), and Dylan (sea) often draw from nature and mythology. They've surged in popularity in recent decades.",
  "Old English": "Old English names date back to Anglo-Saxon England. Names like Edward (wealthy guardian) and Alfred (elf counsel) combine Germanic elements. Many royal and noble English names have Old English roots.",
  French: "French names are known for their elegance and romance. Names like Claire, Pierre, and Louise have been adopted worldwide. Many entered English through the Norman Conquest of 1066.",
  Arabic: "Arabic names carry deep spiritual and poetic significance. Names like Amir (prince), Fatima, and Omar are common across the Muslim world. Many relate to qualities admired in Islamic tradition — generosity, faith, and beauty.",
  Irish: "Irish names preserve the rich Gaelic language tradition. Names like Niamh (bright), Ciaran (dark), and Siobhan are steeped in Celtic mythology and folklore. Spelling often differs from English pronunciation.",
  Spanish: "Spanish names blend Latin, Arabic, and indigenous influences. Names like Isabella, Diego, and Carmen are popular across Latin America and Spain. Many have religious origins tied to Catholic saints.",
  Italian: "Italian names are melodic and expressive. Names like Giovanni, Francesca, and Marco reflect Italy's rich cultural heritage. Many derive from Latin roots or honor Catholic saints.",
  Scottish: "Scottish names draw from Gaelic, Norse, and English traditions. Names like Hamish, Isla, and Campbell often relate to Scottish landscapes, clans, or historical figures.",
  Japanese: "Japanese names are carefully chosen for their kanji characters and meanings. Names can combine characters for beauty (美), love (愛), truth (真), or nature elements. The meaning varies with the kanji used.",
  Scandinavian: "Scandinavian names reflect Norse mythology and Viking heritage. Names like Erik (eternal ruler), Freya (goddess of love), and Bjorn (bear) connect to a tradition of strength and nature.",
  Native: "Native American names often describe natural phenomena, spiritual qualities, or animals. Names carry deep cultural significance and vary greatly across different tribal traditions.",
  African: "African names reflect the continent's incredible linguistic diversity. Names often mark circumstances of birth, family hopes, or spiritual connections. Naming traditions vary widely across regions.",
  Sanskrit: "Sanskrit names come from one of the world's oldest languages. Names like Arjun (bright), Maya (illusion), and Priya (beloved) carry philosophical and spiritual depth from Hindu and Buddhist traditions.",
  Persian: "Persian names reflect Iran's rich literary and cultural heritage. Names like Cyrus (sun), Jasmine (flower), and Darius (protector) connect to ancient empires and poetic traditions.",
  Welsh: "Welsh names preserve one of Europe's oldest living languages. Names like Rhys (enthusiasm), Gwen (white/blessed), and Dylan (sea) are rooted in Welsh mythology and nature.",
  Korean: "Korean names typically use two syllables, each with a specific hanja (Chinese character) meaning. Parents carefully choose characters for auspiciousness, virtue, or beauty. Family names come first in Korean tradition.",
  Chinese: "Chinese names are deeply meaningful, with each character carefully chosen. Names often express parents' wishes — prosperity (富), wisdom (慧), or beauty (美). The family name traditionally comes first.",
  Hawaiian: "Hawaiian names celebrate the islands' natural beauty and spiritual traditions. Names like Kai (sea), Leilani (heavenly flowers), and Keanu (cool breeze) connect to nature and the aloha spirit.",
  Slavic: "Slavic names span Russian, Polish, Czech, and other Eastern European traditions. Names like Vladimir (ruler of the world), Natasha, and Miroslav (peaceful glory) often combine meaningful elements.",
};

export interface NameAnalysis {
  trendStatus: "rising" | "falling" | "stable" | "classic" | "vintage_revival" | "new";
  trendDescription: string;
  culturalContext: string;
  namingTips: string[];
  syllableCount: number;
  nameLength: "short" | "medium" | "long";
  startsWithVowel: boolean;
}

function countSyllables(name: string): number {
  const lower = name.toLowerCase();
  const vowels = lower.match(/[aeiouy]+/g);
  if (!vowels) return 1;
  let count = vowels.length;
  if (lower.endsWith('e') && count > 1) count--;
  return Math.max(1, count);
}

export function analyzeName(
  name: string,
  gender: string,
  origin: string | null,
  meaning: string | null,
  peakYear: number | null,
  peakPct: number | null,
  popularity: PopularityEntry[]
): NameAnalysis {
  // Trend analysis
  const recent = popularity.filter(p => p.year >= 2010);
  const older = popularity.filter(p => p.year >= 1990 && p.year < 2010);
  const recentAvg = recent.length > 0 ? recent.reduce((s, p) => s + p.pct, 0) / recent.length : 0;
  const olderAvg = older.length > 0 ? older.reduce((s, p) => s + p.pct, 0) / older.length : 0;
  const hasAnyData = popularity.length > 0;

  let trendStatus: NameAnalysis["trendStatus"] = "stable";
  let trendDescription = "";

  if (!hasAnyData || popularity.length < 3) {
    trendStatus = "new";
    trendDescription = `${name} is a unique and uncommon name. Choosing it means your child will likely be the only one with this name in their class.`;
  } else if (recentAvg > olderAvg * 1.5 && recentAvg > 0) {
    trendStatus = "rising";
    trendDescription = `${name} is gaining popularity! It has seen a notable increase in recent years. Parents looking for a trendy yet not overused name may find ${name} appealing.`;
  } else if (recentAvg < olderAvg * 0.5 && olderAvg > 0) {
    if (peakYear && peakYear < 1970) {
      trendStatus = "vintage_revival";
      trendDescription = `${name} peaked in ${peakYear} and declined afterward, but vintage names are making a comeback. Choosing ${name} today gives a classic feel with a fresh twist.`;
    } else {
      trendStatus = "falling";
      trendDescription = `${name} was more popular in previous decades and has become less common recently. This means it won't feel overused — a plus for parents wanting something distinctive.`;
    }
  } else if (peakYear && peakYear < 1960 && recentAvg > 0) {
    trendStatus = "classic";
    trendDescription = `${name} is a timeless classic that has maintained steady usage across generations. It's a safe, enduring choice that never goes out of style.`;
  } else {
    trendStatus = "stable";
    trendDescription = `${name} has maintained a consistent level of popularity. It's familiar enough to be easily recognized but not so common that your child will share it with many classmates.`;
  }

  // Cultural context
  const originDesc = origin ? (originDescriptions[origin] || `${name} is of ${origin} origin.`) : "";
  const meaningContext = meaning ? `The name ${name} carries the meaning "${meaning}"${origin ? `, reflecting its ${origin} roots` : ""}.` : "";
  const culturalContext = [meaningContext, originDesc].filter(Boolean).join(" ");

  // Naming tips
  const syllables = countSyllables(name);
  const tips: string[] = [];

  if (syllables <= 2) {
    tips.push(`${name} is a short, punchy name (${syllables} syllable${syllables > 1 ? "s" : ""}) that pairs well with longer middle names.`);
  } else {
    tips.push(`${name} has ${syllables} syllables, so consider a shorter middle name for balance.`);
  }

  if (name.endsWith("a") || name.endsWith("ah")) {
    tips.push(`Names ending in "a" sounds tend to feel soft and feminine — ${name} has a gentle, approachable quality.`);
  }
  if (name.endsWith("n") || name.endsWith("m")) {
    tips.push(`The strong consonant ending gives ${name} a solid, grounded feel.`);
  }

  if (peakPct && peakPct > 1) {
    tips.push(`At its peak, ${name} was given to ${peakPct.toFixed(2)}% of babies — making it a well-established, recognizable name.`);
  } else if (peakPct && peakPct < 0.05) {
    tips.push(`${name} has always been rare (peak: ${(peakPct * 100).toFixed(1)}% of babies), making it a distinctive choice.`);
  }

  tips.push(`Check how ${name} sounds with your last name — say it out loud! Consider initials and potential nicknames too.`);

  const nameLen: "short" | "medium" | "long" = name.length <= 4 ? "short" : name.length <= 7 ? "medium" : "long";

  return {
    trendStatus,
    trendDescription,
    culturalContext,
    namingTips: tips,
    syllableCount: syllables,
    nameLength: nameLen,
    startsWithVowel: /^[aeiou]/i.test(name),
  };
}
