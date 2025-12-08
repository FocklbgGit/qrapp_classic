import sqlite3

DB_PATH = "customers.db"

new_columns = [
    ("utm_source", "TEXT"),
    ("utm_medium", "TEXT"),
    ("utm_campaign", "TEXT"),
    ("utm_term", "TEXT"),
    ("utm_content", "TEXT"),
    ("tracking_id", "TEXT"),
    ("notes", "TEXT"),
    ("category", "TEXT"),
    ("store_number", "TEXT"),
    ("location_id", "TEXT")
]

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

for col, col_type in new_columns:
    try:
        cursor.execute(f"ALTER TABLE customers ADD COLUMN {col} {col_type};")
        print(f"Added: {col}")
    except Exception as e:
        print(f"{col}: {e}")

conn.commit()
conn.close()

print("\nDone.")
