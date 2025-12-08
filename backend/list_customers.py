import sqlite3

# Connect to the database
conn = sqlite3.connect("customers.db")
cursor = conn.cursor()

# Fetch all customers
cursor.execute("""
    SELECT id, company_name, first_name, last_name, qr_url, phone_number
    FROM customers
""")
rows = cursor.fetchall()

# Print header
header = ["ID", "Company Name", "First Name", "Last Name", "QR URL", "Phone"]
print("{:<3} {:<25} {:<15} {:<15} {:<60} {:<15}".format(*header))
print("-" * 140)

# Print rows if any, otherwise print "No customers found"
if rows:
    for r in rows:
        print("{:<3} {:<25} {:<15} {:<15} {:<60} {:<15}".format(*r))
else:
    print("No customers found.")

# Close the connection
conn.close()
