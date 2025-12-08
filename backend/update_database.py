import sqlite3

db_file = "customers.db"

conn = sqlite3.connect(db_file)
cursor = conn.cursor()

columns_to_add = [
    ("email", "TEXT"),
    ("created_at", "DATETIME")
]

for column, col_type in columns_to_add:
    cursor.execute("PRAGMA table_info(customers)")
    existing_cols = [row[1] for row in cursor.fetchall()]
    if column not in existing_cols:
        cursor.execute(f"ALTER TABLE customers ADD COLUMN {column} {col_type};")
        print(f"✅ Added column '{column}' to customers table")
    else:
        print(f"✔️ Column '{column}' already exists")

conn.commit()
conn.close()
print("✅ Database update complete.")

