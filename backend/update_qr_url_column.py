import sqlite3

db_file = "customers.db"
conn = sqlite3.connect(db_file)
cursor = conn.cursor()

# Check existing columns
cursor.execute("PRAGMA table_info(customers)")
cols = [r[1] for r in cursor.fetchall()]

# Rename or add qr_url
if "qr_url" not in cols:
    if "url" in cols:
        print("Renaming column 'url' to 'qr_url'...")
        cursor.execute("ALTER TABLE customers RENAME TO customers_old;")
        cursor.execute("""
            CREATE TABLE customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT,
                last_name TEXT,
                email TEXT,
                phone_number TEXT,
                company_name TEXT,
                qr_url TEXT,
                created_at DATETIME
            )
        """)
        cursor.execute("""
            INSERT INTO customers (id, first_name, last_name, email, phone_number, company_name, qr_url, created_at)
            SELECT id, first_name, last_name, email, phone_number, company_name, url, created_at
            FROM customers_old;
        """)
        cursor.execute("DROP TABLE customers_old;")
        print("✅ Column renamed successfully to 'qr_url'")
    else:
        cursor.execute("ALTER TABLE customers ADD COLUMN qr_url TEXT;")
        print("✅ Added column 'qr_url'")
else:
    print("✔️ Column 'qr_url' already exists")

conn.commit()
conn.close()
print("✅ Database update complete.")
