"""
Build baby names SQLite database from SSA data.
Usage: python3 scripts/build-db.py
"""
import csv
import os
import re
import sqlite3

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
DB_PATH = os.path.join(DATA_DIR, 'names.db')
CSV_PATH = '/tmp/baby-names-test.csv'

# Name origins and meanings (curated for top names)
NAME_MEANINGS = {
    "james": ("Hebrew", "Supplanter"),
    "mary": ("Hebrew", "Beloved, wished-for child"),
    "john": ("Hebrew", "God is gracious"),
    "robert": ("Germanic", "Bright fame"),
    "michael": ("Hebrew", "Who is like God?"),
    "william": ("Germanic", "Resolute protector"),
    "david": ("Hebrew", "Beloved"),
    "richard": ("Germanic", "Brave ruler"),
    "joseph": ("Hebrew", "He will add"),
    "thomas": ("Aramaic", "Twin"),
    "charles": ("Germanic", "Free man"),
    "christopher": ("Greek", "Bearer of Christ"),
    "daniel": ("Hebrew", "God is my judge"),
    "matthew": ("Hebrew", "Gift of God"),
    "anthony": ("Latin", "Priceless one"),
    "mark": ("Latin", "Warlike"),
    "donald": ("Gaelic", "World ruler"),
    "steven": ("Greek", "Crown, wreath"),
    "paul": ("Latin", "Small, humble"),
    "andrew": ("Greek", "Manly, brave"),
    "joshua": ("Hebrew", "God is salvation"),
    "kenneth": ("Gaelic", "Handsome, born of fire"),
    "kevin": ("Irish", "Gentle, handsome"),
    "brian": ("Irish", "Noble, strong"),
    "george": ("Greek", "Farmer"),
    "timothy": ("Greek", "Honoring God"),
    "ronald": ("Norse", "Ruler's counselor"),
    "edward": ("English", "Wealthy guardian"),
    "jason": ("Greek", "Healer"),
    "jeffrey": ("Germanic", "Peaceful pledge"),
    "ryan": ("Irish", "Little king"),
    "jacob": ("Hebrew", "Supplanter"),
    "gary": ("Germanic", "Spear"),
    "nicholas": ("Greek", "Victory of the people"),
    "eric": ("Norse", "Eternal ruler"),
    "jonathan": ("Hebrew", "God has given"),
    "stephen": ("Greek", "Crown, wreath"),
    "larry": ("Latin", "Laurel-crowned"),
    "justin": ("Latin", "Just, righteous"),
    "scott": ("English", "From Scotland"),
    "brandon": ("English", "Broom-covered hill"),
    "benjamin": ("Hebrew", "Son of the right hand"),
    "samuel": ("Hebrew", "Heard by God"),
    "raymond": ("Germanic", "Wise protector"),
    "gregory": ("Greek", "Watchful, alert"),
    "frank": ("Germanic", "Free man"),
    "alexander": ("Greek", "Defender of the people"),
    "patrick": ("Latin", "Nobleman"),
    "jack": ("English", "God is gracious"),
    "dennis": ("Greek", "Follower of Dionysus"),
    "jerry": ("Germanic", "Spear ruler"),
    "tyler": ("English", "Tile maker"),
    "aaron": ("Hebrew", "Exalted, enlightened"),
    "jose": ("Spanish", "God will increase"),
    "adam": ("Hebrew", "Man, earth"),
    "nathan": ("Hebrew", "He gave"),
    "henry": ("Germanic", "Ruler of the home"),
    "peter": ("Greek", "Rock, stone"),
    "zachary": ("Hebrew", "God remembers"),
    "douglas": ("Gaelic", "Dark river"),
    "harold": ("Norse", "Army ruler"),
    "emma": ("Germanic", "Whole, universal"),
    "olivia": ("Latin", "Olive tree"),
    "ava": ("Latin", "Life, bird"),
    "isabella": ("Hebrew", "Devoted to God"),
    "sophia": ("Greek", "Wisdom"),
    "mia": ("Scandinavian", "Mine, beloved"),
    "charlotte": ("French", "Free woman"),
    "amelia": ("Germanic", "Industrious, striving"),
    "harper": ("English", "Harp player"),
    "evelyn": ("English", "Wished-for child"),
    "elizabeth": ("Hebrew", "God is my oath"),
    "margaret": ("Greek", "Pearl"),
    "jennifer": ("Welsh", "White wave"),
    "linda": ("Germanic", "Soft, tender"),
    "barbara": ("Greek", "Foreign, strange"),
    "patricia": ("Latin", "Noble woman"),
    "susan": ("Hebrew", "Lily"),
    "jessica": ("Hebrew", "God beholds"),
    "sarah": ("Hebrew", "Princess"),
    "karen": ("Danish", "Pure"),
    "lisa": ("Hebrew", "God's promise"),
    "nancy": ("Hebrew", "Grace"),
    "betty": ("Hebrew", "God's promise"),
    "dorothy": ("Greek", "Gift of God"),
    "sandra": ("Greek", "Defender of mankind"),
    "ashley": ("English", "Ash tree meadow"),
    "kimberly": ("English", "From the meadow of the royal fortress"),
    "emily": ("Latin", "Rival, industrious"),
    "donna": ("Italian", "Lady"),
    "michelle": ("Hebrew", "Who is like God?"),
    "carol": ("Germanic", "Free woman"),
    "amanda": ("Latin", "Lovable, worthy of love"),
    "melissa": ("Greek", "Honey bee"),
    "deborah": ("Hebrew", "Bee"),
    "stephanie": ("Greek", "Crown, wreath"),
    "rebecca": ("Hebrew", "To tie, to bind"),
    "sharon": ("Hebrew", "A flat plain"),
    "laura": ("Latin", "Laurel"),
    "cynthia": ("Greek", "Moon goddess"),
    "kathleen": ("Irish", "Pure"),
    "amy": ("French", "Beloved"),
    "angela": ("Greek", "Angel, messenger"),
    "shirley": ("English", "Bright meadow"),
    "anna": ("Hebrew", "Grace"),
    "brenda": ("Norse", "Sword"),
    "pamela": ("Greek", "All sweetness"),
    "emma": ("Germanic", "Whole, universal"),
    "nicole": ("Greek", "Victory of the people"),
    "helen": ("Greek", "Bright, shining light"),
    "samantha": ("Aramaic", "Listener"),
    "katherine": ("Greek", "Pure"),
    "christine": ("Latin", "Follower of Christ"),
    "debra": ("Hebrew", "Bee"),
    "rachel": ("Hebrew", "Ewe, female sheep"),
    "carolyn": ("English", "Free woman"),
    "janet": ("Hebrew", "God is gracious"),
    "catherine": ("Greek", "Pure"),
    "maria": ("Hebrew", "Beloved"),
    "heather": ("English", "Flowering heath plant"),
    "diane": ("Latin", "Divine"),
    "ruth": ("Hebrew", "Friend, companion"),
    "julie": ("Latin", "Youthful"),
    "olivia": ("Latin", "Olive tree"),
    "joyce": ("Latin", "Joyful"),
    "virginia": ("Latin", "Pure, virginal"),
    "victoria": ("Latin", "Victory"),
    "kelly": ("Irish", "Warrior"),
    "lauren": ("Latin", "Laurel"),
    "christina": ("Latin", "Follower of Christ"),
    "joan": ("Hebrew", "God is gracious"),
    "evelyn": ("English", "Wished-for child"),
    "judith": ("Hebrew", "Woman from Judea"),
    "megan": ("Welsh", "Pearl"),
    "andrea": ("Greek", "Brave, manly"),
    "cheryl": ("French", "Beloved"),
    "hannah": ("Hebrew", "Grace"),
    "jacqueline": ("French", "Supplanter"),
    "martha": ("Aramaic", "Lady, mistress"),
    "gloria": ("Latin", "Glory"),
    "teresa": ("Greek", "Harvester"),
    "ann": ("Hebrew", "Grace"),
    "sara": ("Hebrew", "Princess"),
    "madison": ("English", "Son of Maud"),
    "frances": ("Latin", "Free one"),
    "kathryn": ("Greek", "Pure"),
    "janice": ("Hebrew", "God is gracious"),
    "jean": ("Hebrew", "God is gracious"),
    "abigail": ("Hebrew", "Father's joy"),
    "alice": ("Germanic", "Noble"),
    "judy": ("Hebrew", "Woman from Judea"),
    "sophia": ("Greek", "Wisdom"),
    "grace": ("Latin", "Grace, blessing"),
    "denise": ("French", "Follower of Dionysus"),
    "amber": ("Arabic", "Jewel"),
    "doris": ("Greek", "Gift of the ocean"),
    "marilyn": ("Hebrew", "Beloved"),
    "danielle": ("Hebrew", "God is my judge"),
    "beverly": ("English", "Beaver stream"),
    "isabella": ("Hebrew", "Devoted to God"),
    "theresa": ("Greek", "Harvester"),
    "diana": ("Latin", "Divine, heavenly"),
    "natalie": ("Latin", "Born on Christmas"),
    "brittany": ("French", "From Brittany"),
    "charlotte": ("French", "Free woman"),
    "marie": ("Hebrew", "Beloved"),
    "kayla": ("Hebrew", "Crown of laurels"),
    "alexis": ("Greek", "Defender"),
    "lori": ("Latin", "Laurel"),
    "liam": ("Irish", "Strong-willed warrior"),
    "noah": ("Hebrew", "Rest, comfort"),
    "oliver": ("Latin", "Olive tree"),
    "elijah": ("Hebrew", "My God is Yahweh"),
    "lucas": ("Greek", "Light"),
    "mason": ("English", "Stone worker"),
    "logan": ("Gaelic", "Little hollow"),
    "ethan": ("Hebrew", "Strong, firm"),
    "aiden": ("Irish", "Little fire"),
    "jackson": ("English", "Son of Jack"),
    "sebastian": ("Greek", "Venerable, revered"),
    "mateo": ("Spanish", "Gift of God"),
    "owen": ("Welsh", "Young warrior"),
    "theodore": ("Greek", "Gift of God"),
    "leo": ("Latin", "Lion"),
    "hudson": ("English", "Son of Hugh"),
    "asher": ("Hebrew", "Happy, blessed"),
    "ezra": ("Hebrew", "Helper"),
    "miles": ("Latin", "Soldier"),
    "lincoln": ("English", "Lake colony"),
    "luna": ("Latin", "Moon"),
    "camila": ("Latin", "Young ceremonial attendant"),
    "aria": ("Italian", "Air, melody"),
    "scarlett": ("English", "Red"),
    "penelope": ("Greek", "Weaver"),
    "layla": ("Arabic", "Night, dark beauty"),
    "chloe": ("Greek", "Blooming, fertility"),
    "riley": ("Irish", "Courageous"),
    "zoey": ("Greek", "Life"),
    "nora": ("Irish", "Honor"),
    "lily": ("English", "Lily flower"),
    "eleanor": ("Greek", "Bright, shining one"),
    "hazel": ("English", "Hazel tree"),
    "violet": ("Latin", "Purple"),
    "aurora": ("Latin", "Dawn"),
    "savannah": ("Spanish", "Treeless plain"),
    "audrey": ("English", "Noble strength"),
    "brooklyn": ("English", "Water, stream"),
    "bella": ("Italian", "Beautiful"),
    "claire": ("Latin", "Clear, bright"),
    "skylar": ("Dutch", "Scholar"),
    "lucy": ("Latin", "Light"),
    "paisley": ("Scottish", "Church"),
    "stella": ("Latin", "Star"),
    "natalia": ("Latin", "Born on Christmas"),
    "ivy": ("English", "Ivy plant"),
    "leah": ("Hebrew", "Weary"),
    "elena": ("Greek", "Bright, shining light"),
    "vivian": ("Latin", "Alive"),
    "maya": ("Sanskrit", "Illusion"),
    "naomi": ("Hebrew", "Pleasantness"),
    "ruby": ("Latin", "Red gemstone"),
}


def slugify(name):
    return name.lower().strip()


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.executescript('''
        CREATE TABLE names (
            slug TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            gender TEXT NOT NULL,
            origin TEXT,
            meaning TEXT,
            peak_year INTEGER,
            peak_pct REAL,
            total_records INTEGER
        );

        CREATE TABLE popularity (
            slug TEXT NOT NULL,
            year INTEGER NOT NULL,
            pct REAL NOT NULL,
            PRIMARY KEY (slug, year)
        );

        CREATE INDEX idx_names_gender ON names(gender);
        CREATE INDEX idx_names_origin ON names(origin);
        CREATE INDEX idx_popularity_slug ON popularity(slug);
        CREATE INDEX idx_popularity_year ON popularity(year);
    ''')

    print('Parsing SSA data...')

    # Read CSV: year, name, percent, sex
    name_data = {}  # slug -> {name, gender, years: {year: pct}}

    with open(CSV_PATH, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row['name'].strip()
            slug = slugify(name)
            year = int(row['year'])
            pct = float(row['percent'])
            gender = 'girl' if row['sex'].strip() == 'girl' else 'boy'

            if slug not in name_data:
                name_data[slug] = {
                    'name': name,
                    'gender': gender,
                    'years': {}
                }
            # Keep highest pct per year (some names are both genders)
            if year not in name_data[slug]['years'] or pct > name_data[slug]['years'][year]:
                name_data[slug]['years'][year] = pct

    print(f'  Unique names: {len(name_data)}')

    # Insert into DB
    for slug, data in name_data.items():
        years = data['years']
        peak_year = max(years, key=years.get) if years else None
        peak_pct = years[peak_year] if peak_year else None
        total_records = len(years)

        # Lookup meaning
        meaning_data = NAME_MEANINGS.get(slug, (None, None))
        origin = meaning_data[0]
        meaning = meaning_data[1]

        c.execute('INSERT OR IGNORE INTO names VALUES (?,?,?,?,?,?,?,?)',
                  (slug, data['name'], data['gender'], origin, meaning,
                   peak_year, peak_pct, total_records))

        for year, pct in years.items():
            c.execute('INSERT OR IGNORE INTO popularity VALUES (?,?,?)',
                      (slug, year, pct))

    conn.commit()

    # Summary
    name_count = c.execute('SELECT COUNT(*) FROM names').fetchone()[0]
    pop_count = c.execute('SELECT COUNT(*) FROM popularity').fetchone()[0]
    boy_count = c.execute("SELECT COUNT(*) FROM names WHERE gender='boy'").fetchone()[0]
    girl_count = c.execute("SELECT COUNT(*) FROM names WHERE gender='girl'").fetchone()[0]
    with_meaning = c.execute("SELECT COUNT(*) FROM names WHERE meaning IS NOT NULL").fetchone()[0]

    print(f'\n=== Database Summary ===')
    print(f'  Names: {name_count} ({boy_count} boys, {girl_count} girls)')
    print(f'  Popularity records: {pop_count}')
    print(f'  Names with meanings: {with_meaning}')
    print(f'  DB size: {os.path.getsize(DB_PATH) / 1024:.0f} KB')
    print(f'  Potential name pages: {name_count}')
    print(f'  Potential comparison pages: {name_count * (name_count - 1) // 2}')

    conn.close()
    print('\nDone!')


if __name__ == '__main__':
    main()
