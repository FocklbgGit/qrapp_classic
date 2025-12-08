import sqlite3

# Connect to the database
conn = sqlite3.connect("customers.db")
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables:", tables)

# Check if the 'customers' table exists
if ('customers',) in tables:
    cursor.execute("SELECT * FROM customers;")
    rows = cursor.fetchall()
    if rows:
        for row in rows:
            print(row)
    else:
        print("The table 'customers' is empty.")
else:
    print("No table named 'customers' found.")

# Close the connection
conn.close()

