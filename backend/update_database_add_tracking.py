import sqlite3

# Path to your existing database
DB_PATH = "customers.db"   # <-- change if your DB has a different filename

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# List of new columns to add
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
    ("location_id", "TEXT"),
    ("created_at", "TEXT"),
    ("updated_at", "TEXT")
]

for column, col_type in new_columns:
    try:
        cursor.execute(f"ALTER TABLE customers ADD COLUMN {column} {col_type};")
        print(f"Added column: {column}")
    except sqlite3.OperationalError:
        print(f"Column already exists: {column}")

conn.commit()
conn.close()
print("Database update complete!")
