import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'names.db');
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) {
    try {
      _db.prepare('SELECT 1').get();
      return _db;
    } catch {
      _db = null;
    }
  }
  _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _db;
}

export interface StateRow {
  state: string;
  count_total: number;
  count_recent: number;
}

export interface StateShare {
  state: string;
  count: number;
  share_per_10k: number;
}

export interface StateHeatmapData {
  topAbsoluteRecent: StateShare[];
  topShareRecent: StateShare[];
  topAbsoluteAllTime: StateShare[];
  topShareAllTime: StateShare[];
  fullHeatmap: Record<string, number>;
  concentration: {
    topStateShare: number;
    top5Share: number;
    spread: 'concentrated' | 'regional' | 'national';
  };
  recentTotal: number;
  allTimeTotal: number;
}

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'D.C.', FL: 'Florida',
  GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana',
  IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin',
  WY: 'Wyoming',
};

export function stateName(code: string): string {
  return STATE_NAMES[code] ?? code;
}

export function getNameStateRows(slug: string, gender: string): StateRow[] {
  return getDb()
    .prepare(
      'SELECT state, count_total, count_recent FROM state_name_total WHERE slug = ? AND gender = ?'
    )
    .all(slug, gender) as StateRow[];
}

export function getStateTotals(gender: string): Record<string, { all: number; recent: number }> {
  const rows = getDb()
    .prepare('SELECT state, total_all, total_recent FROM state_total WHERE gender = ?')
    .all(gender) as { state: string; total_all: number; total_recent: number }[];
  const out: Record<string, { all: number; recent: number }> = {};
  for (const r of rows) out[r.state] = { all: r.total_all, recent: r.total_recent };
  return out;
}

export function getStateHeatmap(slug: string, gender: string): StateHeatmapData | null {
  const rows = getNameStateRows(slug, gender);
  if (rows.length === 0) return null;
  const totals = getStateTotals(gender);

  const recentTotal = rows.reduce((s, r) => s + r.count_recent, 0);
  const allTimeTotal = rows.reduce((s, r) => s + r.count_total, 0);

  const recentShares = rows
    .filter((r) => r.count_recent > 0 && totals[r.state]?.recent > 0)
    .map((r) => ({
      state: r.state,
      count: r.count_recent,
      share_per_10k: (r.count_recent / totals[r.state].recent) * 10000,
    }));

  const allTimeShares = rows
    .filter((r) => r.count_total > 0 && totals[r.state]?.all > 0)
    .map((r) => ({
      state: r.state,
      count: r.count_total,
      share_per_10k: (r.count_total / totals[r.state].all) * 10000,
    }));

  const topAbsoluteRecent = [...recentShares].sort((a, b) => b.count - a.count).slice(0, 5);
  const topShareRecent = [...recentShares]
    .sort((a, b) => b.share_per_10k - a.share_per_10k)
    .slice(0, 5);
  const topAbsoluteAllTime = [...allTimeShares].sort((a, b) => b.count - a.count).slice(0, 5);
  const topShareAllTime = [...allTimeShares]
    .sort((a, b) => b.share_per_10k - a.share_per_10k)
    .slice(0, 5);

  const fullHeatmap: Record<string, number> = {};
  for (const s of recentShares) fullHeatmap[s.state] = s.share_per_10k;

  const sortedRecentByCount = [...recentShares].sort((a, b) => b.count - a.count);
  const topStateShare =
    recentTotal > 0 && sortedRecentByCount[0] ? sortedRecentByCount[0].count / recentTotal : 0;
  const top5Share =
    recentTotal > 0
      ? sortedRecentByCount.slice(0, 5).reduce((s, r) => s + r.count, 0) / recentTotal
      : 0;

  let spread: 'concentrated' | 'regional' | 'national' = 'national';
  if (topStateShare > 0.4) spread = 'concentrated';
  else if (top5Share > 0.7) spread = 'regional';

  return {
    topAbsoluteRecent,
    topShareRecent,
    topAbsoluteAllTime,
    topShareAllTime,
    fullHeatmap,
    concentration: { topStateShare, top5Share, spread },
    recentTotal,
    allTimeTotal,
  };
}
