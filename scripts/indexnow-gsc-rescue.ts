// HCU 2026-04-24 GSC rescue + reinforcement submit for nameblooms.
//
// Context: 20 URLs earned clicks in 28d GSC window (2026-03-24 ~ 2026-04-21):
//   - 4 /compare/ pairs (charles-vs-michael 4 clicks, bertha-vs-karen 2,
//     donald-vs-kevin 2, lucas-vs-william 2)
//   - 16 /middle-names/ URLs (birdie 3 clicks, chauncey 3, norma 3, others 2)
//
// Initial HCU cleanup (this deploy) preserves ALL 20 via top-100 DB + GSC
// evidence union (compare) and MIDDLE_NAME_PRERENDER_LIMIT=999999 (middle-
// names — no cut, all 6,782 names kept). IndexNow submits to reinforce KEPT
// signal while Google processes the 124,650 /compare/ 410s from the same
// deploy — so the earners don't get accidentally swept up in the deindex wave.

const HOST = 'nameblooms.com';
const KEY = '7747acecd3e24e0db0da5d4d53a9b8a6';

const gscCompareEvidence: [string, string][] = [
  ['charles', 'michael'],
  ['bertha', 'karen'],
  ['donald', 'kevin'],
  ['lucas', 'william'],
];

const gscMiddleNames = [
  'birdie', 'chauncey', 'norma', 'bertram', 'braden', 'bryson', 'edward',
  'jacoby', 'jaycee', 'jeremy', 'joanna', 'kelly', 'liana', 'maureen',
  'mitchell', 'rory',
];

const urls: string[] = [];
for (const [a, b] of gscCompareEvidence) {
  urls.push(`https://${HOST}/compare/${a}-vs-${b}/`);
  urls.push(`https://${HOST}/compare/${b}-vs-${a}/`);
}
for (const slug of gscMiddleNames) {
  urls.push(`https://${HOST}/middle-names/${slug}/`);
}

(async () => {
  console.log(`[GSC-RESCUE] submitting ${urls.length} URLs as KEPT...`);
  urls.forEach((u) => console.log(`  ${u}`));
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });
  console.log(`status ${res.status} ${await res.text()}`);
})();
