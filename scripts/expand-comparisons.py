"""
Expand comparisons table with top-500 pairwise combinations.
Generates ~124,750 pairs for massive comparison pages.

Usage: python3 scripts/expand-comparisons.py
"""
import os
import sqlite3
import time

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
DB_PATH = os.path.join(DATA_DIR, 'names.db')


def ensure_table(conn: sqlite3.Connection):
    """Create comparisons table if it doesn't exist."""
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS comparisons (
            slugA TEXT NOT NULL,
            slugB TEXT NOT NULL,
            nameA TEXT NOT NULL,
            nameB TEXT NOT NULL,
            PRIMARY KEY (slugA, slugB)
        )
    """)
    c.execute("CREATE INDEX IF NOT EXISTS idx_comp_slugA ON comparisons(slugA)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_comp_slugB ON comparisons(slugB)")
    # Add a popularity_score column for ordering (sum of peak_pct)
    try:
        c.execute("ALTER TABLE comparisons ADD COLUMN popularity_score REAL DEFAULT 0")
    except sqlite3.OperationalError:
        pass  # Column already exists
    conn.commit()


def get_top_names(conn: sqlite3.Connection, limit: int = 500):
    """Get top names by peak popularity."""
    c = conn.cursor()
    rows = c.execute("""
        SELECT slug, name, peak_pct FROM names
        ORDER BY peak_pct DESC
        LIMIT ?
    """, (limit,)).fetchall()
    return rows


def main():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")

    # Ensure table exists with correct schema
    ensure_table(conn)

    # Check existing count
    existing = conn.execute("SELECT COUNT(*) FROM comparisons").fetchone()[0]
    print(f"Existing comparisons: {existing}")

    # Get top 500 names
    top_names = get_top_names(conn, 500)
    print(f"Top names fetched: {len(top_names)}")

    expected_pairs = len(top_names) * (len(top_names) - 1) // 2
    print(f"Expected total pairs: {expected_pairs}")

    # Generate all pairwise comparisons
    start = time.time()
    batch = []
    batch_size = 5000
    inserted = 0
    skipped = 0

    for i in range(len(top_names)):
        for j in range(i + 1, len(top_names)):
            slug_i, name_i, pct_i = top_names[i]
            slug_j, name_j, pct_j = top_names[j]

            # Sort alphabetically for consistent slug ordering
            if slug_i < slug_j:
                slugA, slugB, nameA, nameB = slug_i, slug_j, name_i, name_j
            else:
                slugA, slugB, nameA, nameB = slug_j, slug_i, name_j, name_i

            pop_score = (pct_i or 0) + (pct_j or 0)
            batch.append((slugA, slugB, nameA, nameB, pop_score))

            if len(batch) >= batch_size:
                conn.executemany("""
                    INSERT OR IGNORE INTO comparisons (slugA, slugB, nameA, nameB, popularity_score)
                    VALUES (?, ?, ?, ?, ?)
                """, batch)
                inserted += len(batch)
                batch = []
                if inserted % 50000 == 0:
                    print(f"  Processed {inserted}/{expected_pairs}...")

    # Insert remaining
    if batch:
        conn.executemany("""
            INSERT OR IGNORE INTO comparisons (slugA, slugB, nameA, nameB, popularity_score)
            VALUES (?, ?, ?, ?, ?)
        """, batch)
        inserted += len(batch)

    conn.commit()
    elapsed = time.time() - start

    # Final count
    total = conn.execute("SELECT COUNT(*) FROM comparisons").fetchone()[0]
    new_pairs = total - existing

    print(f"\n=== Comparison Expansion Summary ===")
    print(f"  Total comparisons: {total}")
    print(f"  New pairs added: {new_pairs}")
    print(f"  Time: {elapsed:.1f}s")
    print(f"  DB size: {os.path.getsize(DB_PATH) / 1024 / 1024:.1f} MB")

    conn.close()
    print("\nDone!")


if __name__ == '__main__':
    main()
