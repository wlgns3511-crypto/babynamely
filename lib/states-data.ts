/**
 * State-level baby name data — 50 states + DC.
 *
 * 2026-07-26: popularBoys/popularGirls 는 **DB 계산값**이다. 이전에는 51개 주 모두
 * 손으로 적은 10개 문자열 배열이었고, 페이지 본문은 그걸 state_name_total 에서
 * 계산했다고 주장했다(라벨≠계산). 실측: 하드코딩 top-10 이 count_total 기준과
 * 일치하는 주 0/51, count_recent(2020–2024) 기준과 평균 7.6/10.
 * 그래서 여기서 count_recent 상위 10을 실제로 계산해 넘긴다 — getAllStates()/
 * getStateBySlug() 를 쓰는 7개 호출부가 한 번에 고쳐진다.
 *
 * namingTrends / culturalInfluences 는 편집 서술이고 그대로 편집 서술로 둔다.
 */
import Database from 'better-sqlite3';
import path from 'path';

export interface StateData {
  slug: string;
  name: string;
  code: string;
  /** SSA state file 2020–2024 합계 상위 10 (DB 계산) */
  popularBoys: string[];
  popularGirls: string[];
  /** 편집 서술 — 데이터 파생 아님 */
  namingTrends: string[];
  culturalInfluences: string[];
}

type StateEditorial = Omit<StateData, 'popularBoys' | 'popularGirls'>;

const editorial: StateEditorial[] = [
  {
    slug: 'alabama',
    name: 'Alabama',
    code: 'AL',
    namingTrends: ['Biblical names remain dominant', 'Southern double names (Mary Beth, Anna Grace) persist', 'Classic English names with multi-generational appeal'],
    culturalInfluences: ['Deep Southern heritage naming traditions', 'Strong biblical and evangelical influence', 'African-American naming traditions in the Black Belt region'],
  },
  {
    slug: 'alaska',
    name: 'Alaska',
    code: 'AK',
    namingTrends: ['Nature-inspired names are especially popular', 'Rugged and outdoorsy names resonate', 'Shorter, strong-sounding names preferred'],
    culturalInfluences: ['Alaska Native naming traditions (Inupiat, Yupik, Tlingit)', 'Frontier and wilderness culture', 'Military family influence from large bases'],
  },
  {
    slug: 'arizona',
    name: 'Arizona',
    code: 'AZ',
    namingTrends: ['Strong Hispanic naming influence', 'Desert and nature-inspired names gaining ground', 'Bilingual-friendly names that work in English and Spanish'],
    culturalInfluences: ['Large Mexican-American population shaping name trends', 'Native American communities (Navajo, Apache, Tohono O\'odham)', 'Southwestern cultural blend'],
  },
  {
    slug: 'arkansas',
    name: 'Arkansas',
    code: 'AR',
    namingTrends: ['Traditional Southern names remain strong', 'Country-style names with rugged appeal', 'Nature and virtue names popular'],
    culturalInfluences: ['Ozark and Southern Appalachian heritage', 'Evangelical Christian naming traditions', 'Rural community naming customs'],
  },
  {
    slug: 'california',
    name: 'California',
    code: 'CA',
    namingTrends: ['Multicultural names reflecting diverse population', 'Celebrity and entertainment industry influence', 'Gender-neutral names rising faster than national average'],
    culturalInfluences: ['Largest Hispanic population in the US drives Latino name trends', 'Asian-American communities (Chinese, Filipino, Vietnamese, Korean)', 'Hollywood and tech culture influence', 'Progressive naming trends as a cultural bellwether'],
  },
  {
    slug: 'colorado',
    name: 'Colorado',
    code: 'CO',
    namingTrends: ['Outdoor and nature names very popular', 'Vintage revival names trending strong', 'Short modern names preferred'],
    culturalInfluences: ['Outdoor recreation culture shapes name aesthetics', 'Growing Hispanic community influence', 'Young professional transplant population bringing diverse trends'],
  },
  {
    slug: 'connecticut',
    name: 'Connecticut',
    code: 'CT',
    namingTrends: ['Classic New England names remain popular', 'Preppy and literary names favored', 'European-influenced naming choices'],
    culturalInfluences: ['New England prep school and Ivy League culture', 'Italian-American and Irish-American naming traditions', 'Suburban affluent naming trends'],
  },
  {
    slug: 'delaware',
    name: 'Delaware',
    code: 'DE',
    namingTrends: ['Mid-Atlantic mix of classic and modern', 'Historical names reflecting colonial heritage', 'Names that bridge Northern and Southern styles'],
    culturalInfluences: ['Mid-Atlantic cultural crossroads', 'African-American naming traditions in Wilmington area', 'DuPont-era old family naming influence'],
  },
  {
    slug: 'district-of-columbia',
    name: 'District of Columbia',
    code: 'DC',
    namingTrends: ['Presidential and historical names especially popular', 'Literary and intellectual names favored', 'Vintage names with strong revival trends'],
    culturalInfluences: ['Political and diplomatic community', 'Highly educated population favoring classic names', 'Diverse international community from embassies and NGOs', 'African-American cultural traditions in historic neighborhoods'],
  },
  {
    slug: 'florida',
    name: 'Florida',
    code: 'FL',
    namingTrends: ['Latin American names extremely popular', 'Tropical and nature names emerging', 'Bilingual names that work across cultures'],
    culturalInfluences: ['Cuban, Puerto Rican, and other Caribbean communities', 'Large retiree transplant population', 'Haitian-American naming traditions', 'Brazilian community in South Florida'],
  },
  {
    slug: 'georgia',
    name: 'Georgia',
    code: 'GA',
    namingTrends: ['Southern gentleman and belle names endure', 'African-American creative naming strong in Atlanta metro', 'Biblical names across demographic groups'],
    culturalInfluences: ['Major African-American cultural hub (Atlanta)', 'Southern heritage naming traditions', 'Growing international community in metro Atlanta'],
  },
  {
    slug: 'hawaii',
    name: 'Hawaii',
    code: 'HI',
    namingTrends: ['Hawaiian language names widely used across ethnicities', 'Ocean and nature names especially popular', 'Names with vowel-heavy sounds preferred'],
    culturalInfluences: ['Native Hawaiian naming traditions (Kai, Leilani, Koa, Malia)', 'Japanese and Filipino naming influence', 'Pan-Polynesian cultural connections', 'Military family diversity'],
  },
  {
    slug: 'idaho',
    name: 'Idaho',
    code: 'ID',
    namingTrends: ['Western and frontier-inspired names', 'Large families tend toward classic timeless names', 'Nature and virtue names very popular'],
    culturalInfluences: ['LDS (Mormon) naming traditions strong', 'Rural Western heritage', 'Growing Boise metro bringing national trends'],
  },
  {
    slug: 'illinois',
    name: 'Illinois',
    code: 'IL',
    namingTrends: ['Urban/suburban split between trendy and traditional', 'Eastern European name influence from diaspora communities', 'Hispanic names rising steadily'],
    culturalInfluences: ['Chicago as major immigrant gateway (Polish, Mexican, Irish)', 'African-American naming traditions on the South Side', 'Midwestern traditional values in downstate communities'],
  },
  {
    slug: 'indiana',
    name: 'Indiana',
    code: 'IN',
    namingTrends: ['Heartland classic names dominate', 'Country and rustic names popular in rural areas', 'Traditional spelling preferred over creative variations'],
    culturalInfluences: ['Midwestern naming sensibility', 'Motorsport culture (racing names occasionally popular)', 'Amish community traditional naming in northern counties'],
  },
  {
    slug: 'iowa',
    name: 'Iowa',
    code: 'IA',
    namingTrends: ['Vintage and old-fashioned names trending strong', 'Farm and heritage names persist', 'Scandinavian-influenced names in northern counties'],
    culturalInfluences: ['Scandinavian and German immigrant heritage', 'Rural Midwestern traditional naming', 'College town influence (Iowa City) bringing national trends'],
  },
  {
    slug: 'kansas',
    name: 'Kansas',
    code: 'KS',
    namingTrends: ['Plains state traditional naming', 'Strong preference for classic biblical names', 'Cowboy and Western names in rural areas'],
    culturalInfluences: ['German-Russian heritage in western Kansas', 'Midwestern farm community values', 'Growing Hispanic population in meatpacking towns'],
  },
  {
    slug: 'kentucky',
    name: 'Kentucky',
    code: 'KY',
    namingTrends: ['Appalachian naming traditions with unique spellings', 'Double names (Bobby Joe, Billie Sue) declining but present', 'Country and Southern names popular'],
    culturalInfluences: ['Appalachian mountain heritage naming', 'Bourbon country and horse racing culture', 'Southern Baptist naming traditions'],
  },
  {
    slug: 'louisiana',
    name: 'Louisiana',
    code: 'LA',
    namingTrends: ['French-influenced names more common than any other state', 'Saints names popular across cultures', 'Creole and Cajun naming traditions unique to Louisiana'],
    culturalInfluences: ['Cajun and Creole naming heritage (Beau, Pierre, Colette)', 'Strong Catholic saint-naming tradition', 'African-American naming creativity in New Orleans', 'Vietnamese community in the Gulf Coast area'],
  },
  {
    slug: 'maine',
    name: 'Maine',
    code: 'ME',
    namingTrends: ['New England traditional names strong', 'Nature and maritime names popular', 'Vintage revival names trending'],
    culturalInfluences: ['New England maritime heritage', 'Franco-American naming traditions in the north', 'Rural self-reliance culture influencing strong simple names'],
  },
  {
    slug: 'maryland',
    name: 'Maryland',
    code: 'MD',
    namingTrends: ['Suburban DC influence with educated classic naming', 'African-American naming innovation in Baltimore', 'Mix of Southern and Mid-Atlantic styles'],
    culturalInfluences: ['DC suburbs professional-class naming trends', 'African-American cultural center (Baltimore, Prince George\'s County)', 'Chesapeake maritime heritage'],
  },
  {
    slug: 'massachusetts',
    name: 'Massachusetts',
    code: 'MA',
    namingTrends: ['Literary and academic names very popular', 'Irish and Italian heritage names persist', 'Progressive and gender-neutral names trending'],
    culturalInfluences: ['Irish-American and Italian-American deep roots', 'University culture (Harvard, MIT, Boston-area schools)', 'Cape Cod and maritime naming traditions', 'Progressive social values influencing name choices'],
  },
  {
    slug: 'michigan',
    name: 'Michigan',
    code: 'MI',
    namingTrends: ['Midwestern traditional mixed with urban trends', 'Auto industry family names declining', 'Nature names popular in northern Michigan'],
    culturalInfluences: ['Arab-American community in Dearborn (largest outside Middle East)', 'African-American naming traditions in Detroit', 'Dutch heritage in western Michigan', 'Great Lakes outdoor culture'],
  },
  {
    slug: 'minnesota',
    name: 'Minnesota',
    code: 'MN',
    namingTrends: ['Scandinavian names more common than national average', 'Vintage and classic names trend strongly', 'Nature names popular (Lake, River, Forrest)'],
    culturalInfluences: ['Scandinavian and German immigrant heritage', 'Somali-American community in Twin Cities', 'Hmong community naming traditions', 'Lake country outdoor culture'],
  },
  {
    slug: 'mississippi',
    name: 'Mississippi',
    code: 'MS',
    namingTrends: ['Traditional biblical names dominate more than any other state', 'Double first names (Mary Grace, John David) still common', 'Heritage family names passed down through generations'],
    culturalInfluences: ['Deep South naming traditions', 'Strong African-American naming heritage', 'Evangelical Christian influence on name choices', 'Delta blues cultural heritage'],
  },
  {
    slug: 'missouri',
    name: 'Missouri',
    code: 'MO',
    namingTrends: ['Blend of Midwestern and Southern naming styles', 'Classic names preferred in rural areas', 'Urban centers follow national trends closely'],
    culturalInfluences: ['Gateway West cultural heritage', 'German heritage in St. Louis and Missouri River towns', 'Ozark mountain community traditions', 'Kansas City jazz and cultural traditions'],
  },
  {
    slug: 'montana',
    name: 'Montana',
    code: 'MT',
    namingTrends: ['Western frontier names very popular', 'Nature and outdoors names dominant', 'Strong classic names preferred over trendy'],
    culturalInfluences: ['Big Sky Country ranching culture', 'Native American communities (Blackfeet, Crow, Salish)', 'Scandinavian homesteader heritage in eastern Montana'],
  },
  {
    slug: 'nebraska',
    name: 'Nebraska',
    code: 'NE',
    namingTrends: ['Heartland traditional naming strong', 'German and Czech heritage names persist', 'Farm and prairie names in rural communities'],
    culturalInfluences: ['German and Czech immigrant heritage', 'Growing Hispanic and Sudanese refugee communities in Omaha', 'University of Nebraska community influence'],
  },
  {
    slug: 'nevada',
    name: 'Nevada',
    code: 'NV',
    namingTrends: ['Hispanic naming influence very strong', 'Entertainment and celebrity names popular', 'Western frontier names in rural areas'],
    culturalInfluences: ['Large Hispanic population (nearly 30%)', 'Las Vegas entertainment culture', 'Filipino-American community', 'Mining and ranching heritage in rural Nevada'],
  },
  {
    slug: 'new-hampshire',
    name: 'New Hampshire',
    code: 'NH',
    namingTrends: ['New England traditional names dominant', 'Nature and woodland names popular', 'Strong vintage revival trend'],
    culturalInfluences: ['Yankee New England heritage', 'French-Canadian influence in northern towns', 'Live Free or Die independent spirit reflected in unique choices'],
  },
  {
    slug: 'new-jersey',
    name: 'New Jersey',
    code: 'NJ',
    namingTrends: ['Extremely diverse naming reflecting the state population', 'Italian and South Asian names common', 'Suburban family classic names trending'],
    culturalInfluences: ['Italian-American naming traditions (one of the strongest in the US)', 'Indian and Pakistani communities with Sanskrit and Urdu names', 'Large Jewish community with Hebrew naming traditions', 'NYC metro cultural spillover'],
  },
  {
    slug: 'new-mexico',
    name: 'New Mexico',
    code: 'NM',
    namingTrends: ['Spanish and Native American names deeply embedded', 'Saint names from Catholic tradition common', 'Bilingual names standard'],
    culturalInfluences: ['Hispano naming traditions dating back centuries', 'Pueblo, Navajo, and Apache naming practices', 'Catholic patron saint naming tradition', 'Land of Enchantment artistic community'],
  },
  {
    slug: 'new-york',
    name: 'New York',
    code: 'NY',
    namingTrends: ['Extremely diverse naming reflecting global immigration', 'Intellectual and cultural names popular in NYC', 'Upstate trends more traditional and New England influenced'],
    culturalInfluences: ['Global immigration gateway — naming from every culture', 'Jewish naming traditions (Hebrew and Yiddish)', 'Caribbean and Latin American influence in NYC', 'Italian-American heritage', 'African-American cultural innovation'],
  },
  {
    slug: 'north-carolina',
    name: 'North Carolina',
    code: 'NC',
    namingTrends: ['Charlotte (the city name) consistently ranks high for girls', 'Southern classic names blending with Research Triangle modern tastes', 'Nature and mountain names emerging'],
    culturalInfluences: ['Southern heritage naming traditions', 'Growing tech corridor attracting diverse transplants', 'Cherokee naming traditions in western NC', 'African-American naming traditions in Piedmont'],
  },
  {
    slug: 'north-dakota',
    name: 'North Dakota',
    code: 'ND',
    namingTrends: ['Scandinavian and German heritage names persist', 'Classic heartland names dominate', 'Oil boom bringing diverse naming to western ND'],
    culturalInfluences: ['Norwegian and German-Russian immigrant heritage', 'Native American communities (Mandan, Hidatsa, Arikara)', 'Small-town traditional naming values', 'Bakken oil field worker diversity'],
  },
  {
    slug: 'ohio',
    name: 'Ohio',
    code: 'OH',
    namingTrends: ['Midwest traditional meets Rust Belt practicality', 'Amish traditional naming in Holmes County area', 'Classic names strong across the state'],
    culturalInfluences: ['German-American heritage (Cincinnati, Columbus)', 'Amish and Mennonite naming traditions', 'African-American naming traditions in Cleveland and Columbus', 'Appalachian naming influence in southeastern Ohio'],
  },
  {
    slug: 'oklahoma',
    name: 'Oklahoma',
    code: 'OK',
    namingTrends: ['Western and cowboy names still popular', 'Native American naming influence notable', 'Southern and plains naming blend'],
    culturalInfluences: ['Largest Native American population by percentage (Cherokee, Choctaw, Chickasaw)', 'Oklahoma land rush pioneer heritage', 'Bible Belt naming traditions', 'Growing Hispanic community'],
  },
  {
    slug: 'oregon',
    name: 'Oregon',
    code: 'OR',
    namingTrends: ['Nature and botanical names extremely popular', 'Quirky and unique names embraced', 'Gender-neutral names higher than national average'],
    culturalInfluences: ['Pacific Northwest environmental culture', 'Progressive Portland naming trends set state patterns', 'Oregon Trail pioneer heritage', 'Growing Hispanic community in agricultural regions'],
  },
  {
    slug: 'pennsylvania',
    name: 'Pennsylvania',
    code: 'PA',
    namingTrends: ['Philadelphia urban trends contrast with rural Pennsylvania Dutch country', 'Historical and founding-era names popular', 'Italian and Irish heritage names persist'],
    culturalInfluences: ['Pennsylvania Dutch (Amish/Mennonite) naming traditions', 'Philadelphia Italian-American and Irish-American communities', 'Pittsburgh Eastern European heritage (Polish, Slovak, Ukrainian)', 'Historical Quaker naming simplicity'],
  },
  {
    slug: 'rhode-island',
    name: 'Rhode Island',
    code: 'RI',
    namingTrends: ['Portuguese and Italian heritage names strong', 'New England classic names popular', 'Small state follows national trends closely'],
    culturalInfluences: ['Portuguese-American community (largest concentration in US)', 'Italian-American naming traditions', 'Cape Verdean community', 'Providence as a college town influencing trends'],
  },
  {
    slug: 'south-carolina',
    name: 'South Carolina',
    code: 'SC',
    namingTrends: ['Southern charm names extremely popular', 'Charleston old-money classic names trending nationally', 'Biblical names remain top choices'],
    culturalInfluences: ['Lowcountry and Gullah naming heritage', 'Southern plantation-era naming traditions', 'Military naming (large base presence)', 'African-American naming creativity'],
  },
  {
    slug: 'south-dakota',
    name: 'South Dakota',
    code: 'SD',
    namingTrends: ['Plains heartland classic names', 'Native American names used in reservation communities', 'Ranching and frontier names popular'],
    culturalInfluences: ['Lakota Sioux naming traditions', 'Scandinavian and German heritage', 'Small-town prairie community values', 'Hutterite colony traditional naming'],
  },
  {
    slug: 'tennessee',
    name: 'Tennessee',
    code: 'TN',
    namingTrends: ['Country music influence on naming (Nashville effect)', 'Southern classic names dominant', 'Musical and artistic names emerging'],
    culturalInfluences: ['Nashville music industry and celebrity naming trends', 'Memphis blues and soul cultural heritage', 'Appalachian mountain naming in eastern Tennessee', 'Southern evangelical naming traditions'],
  },
  {
    slug: 'texas',
    name: 'Texas',
    code: 'TX',
    namingTrends: ['Hispanic names are mainstream, not minority trend', 'Big bold names matching Texas personality', 'Cowboy and Western heritage names persist in rural areas'],
    culturalInfluences: ['Largest Hispanic population in raw numbers', 'Tejano cultural naming traditions', 'German Hill Country heritage', 'Vietnamese community in Houston', 'African-American naming traditions in East Texas and Dallas'],
  },
  {
    slug: 'utah',
    name: 'Utah',
    code: 'UT',
    namingTrends: ['Utah leads the nation in unique name creation', 'Large families explore deeper into name lists', 'Creative spelling variations more common than any other state'],
    culturalInfluences: ['LDS (Mormon) culture of large families drives unique naming', 'Pioneer heritage names honored', 'Young marriage age means younger parents choosing trendier names', 'Western outdoor culture'],
  },
  {
    slug: 'vermont',
    name: 'Vermont',
    code: 'VT',
    namingTrends: ['Nature and botanical names extremely popular', 'Vintage New England names trending strong', 'Artisanal and literary names embraced'],
    culturalInfluences: ['Green Mountain agrarian culture', 'Progressive and artistic community', 'Franco-American heritage in northern Vermont', 'Back-to-the-land movement culture'],
  },
  {
    slug: 'virginia',
    name: 'Virginia',
    code: 'VA',
    namingTrends: ['Presidential and founding-father names more popular here than nationally', 'Northern Virginia follows DC/suburban trends', 'Southern Virginia maintains traditional naming'],
    culturalInfluences: ['Colonial and founding-era heritage (naming after presidents)', 'DC suburbs professional-class naming', 'Military family diversity (Norfolk, Hampton Roads)', 'Growing Asian-American community in Northern Virginia'],
  },
  {
    slug: 'washington',
    name: 'Washington',
    code: 'WA',
    namingTrends: ['Pacific Northwest nature names trending', 'Tech industry creative naming in Seattle metro', 'Asian-influenced names from growing communities'],
    culturalInfluences: ['Seattle tech industry culture', 'Pacific Northwest outdoor and environmental culture', 'Asian-American communities (Chinese, Vietnamese, Filipino)', 'Scandinavian heritage in rural areas'],
  },
  {
    slug: 'west-virginia',
    name: 'West Virginia',
    code: 'WV',
    namingTrends: ['Appalachian heritage names strong', 'Country and mountain names popular', 'Traditional spelling preferred'],
    culturalInfluences: ['Appalachian mountain community naming traditions', 'Coal country heritage names', 'Scotch-Irish naming influence', 'Strong family-name-passing traditions'],
  },
  {
    slug: 'wisconsin',
    name: 'Wisconsin',
    code: 'WI',
    namingTrends: ['German and Scandinavian heritage names persist', 'Midwest traditional naming strong', 'Cheese state culture has not produced cheese-themed names yet'],
    culturalInfluences: ['German-American heritage (strongest in the US)', 'Scandinavian community in northern Wisconsin', 'Hmong community naming traditions in Milwaukee and Wausau', 'Dairy farm community traditional naming'],
  },
  {
    slug: 'wyoming',
    name: 'Wyoming',
    code: 'WY',
    namingTrends: ['Western frontier names most popular in the country', 'Nature and mountain names dominant', 'Strong classic names preferred'],
    culturalInfluences: ['Cowboy and ranching culture', 'Yellowstone and Grand Teton outdoor heritage', 'Native American communities (Eastern Shoshone, Northern Arapaho)', 'Smallest population means individual choices have outsized effect on rankings'],
  },
];

let _db: Database.Database | null = null;
let _cache: StateData[] | null = null;

/** 주×성별 count_recent 상위 10. 빌드 1회, 1,020행. */
function hydrate(): StateData[] {
  if (_cache) return _cache;
  if (!_db) {
    _db = new Database(path.join(process.cwd(), 'data', 'names.db'), { readonly: true, fileMustExist: true });
  }
  const rows = _db
    .prepare(
      `SELECT state, gender, name FROM (
         SELECT s.state, s.gender, n.name,
                ROW_NUMBER() OVER (PARTITION BY s.state, s.gender
                                   ORDER BY s.count_recent DESC, n.name ASC) rn
           FROM state_name_total s JOIN names n ON n.slug = s.slug
          WHERE s.count_recent > 0
       ) WHERE rn <= 10 ORDER BY state, gender, rn`,
    )
    .all() as { state: string; gender: string; name: string }[];

  const byState = new Map<string, { boys: string[]; girls: string[] }>();
  for (const r of rows) {
    let e = byState.get(r.state);
    if (!e) byState.set(r.state, (e = { boys: [], girls: [] }));
    (r.gender === 'boy' ? e.boys : e.girls).push(r.name);
  }

  _cache = editorial.map((s) => {
    const e = byState.get(s.code);
    // 게이트: 빈 배열로 조용히 넘어가면 페이지가 "top 10" 이라 써놓고 아무것도 안 보여준다
    if (!e || e.boys.length < 10 || e.girls.length < 10) {
      throw new Error(`states-data: ${s.code} count_recent 상위 10 미달 (boy ${e?.boys.length ?? 0} / girl ${e?.girls.length ?? 0})`);
    }
    return { ...s, popularBoys: e.boys, popularGirls: e.girls };
  });
  return _cache;
}

export function getAllStates(): StateData[] {
  return hydrate();
}

export function getStateBySlug(slug: string): StateData | undefined {
  return hydrate().find((s) => s.slug === slug);
}
