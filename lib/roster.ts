/**
 * roster.ts — 압축 축 2026-07-26 (nameblooms)
 *
 * 실측 문제: SSA 원자료 두 축이 색인되는 페이지 어디에도 안 나왔다.
 *   - state_name_total 241,042행 → /state/<slug>/ 는 lib/states-data.ts 하드코딩
 *     top-10 만 렌더하고, DB 는 COUNT 로만 쓰였다(getStateBackedRowCount).
 *   - name_year_rank 340,871행 → /names/year/<year>/ 는 145년 중 37년만 존재하고
 *     각 페이지는 keep-set ∩ top-50 만 렌더했다.
 * keep 이름 1,513개분은 /name/<slug>/ 에 이미 실려 있다(emma 실측 145년·51주).
 * 남은 몫 — pruned 6,254개 이름의 state 153,386행 · year 199,928행 — 이 진짜
 * 미렌더 질량이고, 그 이름들에게 페이지를 다시 주지 않고(2026-06-28 HCU prune 유지)
 * 로스터 행으로만 수납하는 게 이 파일의 목적이다.
 *
 * 라벨≠계산 방지: 페이지에 쓰는 "N행" 숫자는 별도 COUNT 쿼리가 아니라 여기서
 * 반환하는 배열 길이에서만 파생한다.
 */
import Database from 'better-sqlite3';
import path from 'path';

let _db: Database.Database | null = null;

function db(): Database.Database {
  if (!_db) {
    _db = new Database(path.join(process.cwd(), 'data', 'names.db'), {
      readonly: true,
      fileMustExist: true,
    });
  }
  return _db;
}

export interface RosterRow {
  slug: string;
  name: string;
  /** 성별당 순위 (연도 축) 또는 로스터 내 순서 (주 축) */
  rank: number;
  /** 주 축 = 누적 출생수, 연도 축 = 그 해 비중(%) 문자열 */
  primary: string;
  /** 주 축 = 2020–2024 출생수, 연도 축 = 누적 등장 연도수 */
  secondary: string;
}

export interface Roster {
  boys: RosterRow[];
  girls: RosterRow[];
  /** 렌더되는 배열에서만 파생 — 별도 COUNT 금지 */
  total: number;
}

const nf = new Intl.NumberFormat('en-US');

/** 한 주의 SSA state-file 전량. 정렬 = 누적 출생수 내림차순, 순위는 성별별로 다시 센다. */
export function getStateRoster(stateCode: string): Roster {
  const rows = db()
    .prepare(
      `SELECT s.slug, n.name, s.gender, s.count_total, s.count_recent
         FROM state_name_total s JOIN names n ON n.slug = s.slug
        WHERE s.state = ?
        ORDER BY s.count_total DESC, n.name ASC`,
    )
    .all(stateCode.toUpperCase()) as { slug: string; name: string; gender: string; count_total: number; count_recent: number }[];
  if (!rows.length) throw new Error(`getStateRoster(${stateCode}): 0행 — state 코드/DB 확인`);
  const boys: RosterRow[] = [];
  const girls: RosterRow[] = [];
  for (const r of rows) {
    const bucket = r.gender === 'boy' ? boys : girls;
    bucket.push({
      slug: r.slug,
      name: r.name,
      rank: bucket.length + 1,
      primary: nf.format(r.count_total),
      secondary: r.count_recent ? nf.format(r.count_recent) : '—',
    });
  }
  return { boys, girls, total: boys.length + girls.length };
}

/** 한 출생연도의 SSA national 전량. rank 는 DB 의 성별별 순위를 그대로 쓴다. */
export function getYearRoster(year: number): Roster {
  const rows = db()
    .prepare(
      `SELECT r.slug, n.name, n.gender, r.rank, p.pct, n.total_records
         FROM name_year_rank r
         JOIN names n ON n.slug = r.slug
         LEFT JOIN popularity p ON p.slug = r.slug AND p.year = r.year
        WHERE r.year = ?
        ORDER BY n.gender ASC, r.rank ASC`,
    )
    .all(year) as { slug: string; name: string; gender: string; rank: number; pct: number | null; total_records: number }[];
  if (!rows.length) throw new Error(`getYearRoster(${year}): 0행 — 연도/DB 확인`);
  const boys: RosterRow[] = [];
  const girls: RosterRow[] = [];
  for (const r of rows) {
    (r.gender === 'boy' ? boys : girls).push({
      slug: r.slug,
      name: r.name,
      rank: r.rank,
      primary: r.pct != null ? `${(r.pct * 100).toFixed(3)}%` : '—',
      secondary: `${r.total_records}`,
    });
  }
  return { boys, girls, total: boys.length + girls.length };
}

/**
 * /compare/ 허브가 자기 축의 원료를 직접 싣는다.
 *
 * comparisons 124,750행은 원자료가 아니라 상위 500 이름의 크로스조인(500C2)이다.
 * 그 500 이름의 peak_year·peak_pct·total_births 를 허브 한 장에 실으면, 죽이는
 * 100개 짝 페이지가 보여주던 숫자가 전부 여기 남는다(짝 비교 = 두 행 나란히 읽기).
 * 실측 2026-07-26: 500개 전부 name-keep 안 → 모든 행이 살아있는 페이지로 링크된다.
 */
export function getComparisonRoster(): Roster {
  const rows = db()
    .prepare(
      `SELECT n.slug, n.name, n.gender, n.peak_year, n.peak_pct, n.total_births
         FROM (SELECT slugA s FROM comparisons UNION SELECT slugB FROM comparisons) u
         JOIN names n ON n.slug = u.s
        ORDER BY n.peak_pct DESC, n.name ASC`,
    )
    .all() as { slug: string; name: string; gender: string; peak_year: number; peak_pct: number; total_births: number | null }[];
  if (!rows.length) throw new Error('getComparisonRoster(): 0행 — comparisons 테이블 확인');
  const boys: RosterRow[] = [];
  const girls: RosterRow[] = [];
  for (const r of rows) {
    const bucket = r.gender === 'boy' ? boys : girls;
    bucket.push({
      slug: r.slug,
      name: r.name,
      rank: bucket.length + 1,
      primary: `${r.peak_year} · ${(r.peak_pct * 100).toFixed(2)}%`,
      secondary: r.total_births != null ? nf.format(r.total_births) : '—',
    });
  }
  return { boys, girls, total: boys.length + girls.length };
}

export function getRosterYears(): number[] {
  return (db().prepare('SELECT DISTINCT year FROM name_year_rank ORDER BY year').all() as { year: number }[]).map((r) => r.year);
}

export function getRosterStateCodes(): string[] {
  return (db().prepare('SELECT DISTINCT state FROM state_name_total ORDER BY state').all() as { state: string }[]).map((r) => r.state);
}

/**
 * 축 전량 커버리지 게이트 — 빌드에서 1회. 압축의 전제("모든 행이 어딘가 렌더된다")가
 * 조용히 깨지는 걸 막는다. 하한은 2026-07-26 실측값 기준(state 241,042 / year 340,871).
 * DB 가 커지는 건 통과, 줄어들거나 축이 사라지는 건 실패.
 */
export function assertRosterCoverage(publishedStateCodes: string[], publishedYears: number[]): void {
  const dbStates = getRosterStateCodes();
  const dbYears = getRosterYears();
  const missingStates = dbStates.filter((c) => !publishedStateCodes.includes(c));
  const missingYears = dbYears.filter((y) => !publishedYears.includes(y));
  if (missingStates.length) throw new Error(`로스터 커버리지 실패: state ${missingStates.join(',')} 가 발행 목록에 없다`);
  if (missingYears.length) throw new Error(`로스터 커버리지 실패: year ${missingYears.join(',')} 가 발행 목록에 없다`);

  const stateRows = (db().prepare('SELECT COUNT(*) c FROM state_name_total').get() as { c: number }).c;
  const yearRows = (db().prepare('SELECT COUNT(*) c FROM name_year_rank').get() as { c: number }).c;
  if (stateRows < 241_042) throw new Error(`state_name_total ${stateRows} < 241,042 하한`);
  if (yearRows < 340_871) throw new Error(`name_year_rank ${yearRows} < 340,871 하한`);
  console.log(`✓ 로스터 커버리지: state ${dbStates.length}주 ${stateRows.toLocaleString()}행 · year ${dbYears.length}년 ${yearRows.toLocaleString()}행`);
}
