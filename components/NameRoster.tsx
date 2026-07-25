import type { RosterRow } from '@/lib/roster';
import { isIndexableNameSlug } from '@/lib/index-status';

interface Props {
  rows: RosterRow[];
  gender: 'boy' | 'girl';
  /** 두 데이터 컬럼 헤더 — 축마다 뜻이 달라서 페이지가 넘긴다 */
  columns: [string, string];
  caption: string;
}

/**
 * 로스터 표 — 행 마크업은 컨테이너 `.roster` 클래스 하나에만 의존한다.
 *
 * 셀마다 Tailwind 유틸 문자열을 붙이면 RSC 플라이트 페이로드가 그 문자열을 HTML 과
 * self.__next_f.push 양쪽에 두 번 싣는다(drugpricepeek /state/ 문서의 67%가 플라이트였다).
 * 수천 행 로스터에서 그게 문서 크기를 지배하므로 여기선 요소·nth-child 규칙으로만
 * 스타일하고 클래스는 성별 1글자(b/g)만 쓴다. 규칙은 app/globals.css.
 *
 * keep-set 밖 이름은 /name/<slug>/ 가 410 이므로 링크하지 않고 텍스트로 둔다 —
 * 죽은 링크도, noindex /lookup/ 으로 새는 크롤 예산도 만들지 않는다.
 */
export function NameRoster({ rows, gender, columns, caption }: Props) {
  const g = gender === 'boy' ? 'b' : 'g';
  return (
    <div className="roster-wrap">
      <table className={`roster ${g}`}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>{columns[0]}</th>
            <th>{columns[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.slug}>
              <td>{r.rank}</td>
              <td>
                {isIndexableNameSlug(r.slug) ? <a href={`/name/${r.slug}/`}>{r.name}</a> : r.name}
              </td>
              <td>{r.primary}</td>
              <td>{r.secondary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
