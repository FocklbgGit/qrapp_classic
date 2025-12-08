from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
import sqlite3
import qrcode
import io
import base64
import uuid
import os
import socket
print(">>> RUNNING THIS app.py:", os.path.abspath(__file__))
from datetime import datetime

# =========================================================
# ========== APP SETUP ====================================
# =========================================================

app = Flask(__name__)
CORS(app)

# Always reference the REAL database path next to app.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "customers.db")

# =========================================================
# ========== DATABASE SETUP ===============================
# =========================================================

def get_db_connection():
    print("\n==============================")
    print("STEP 2 DEBUG: DATABASE path =", DATABASE)
    print("STEP 2 DEBUG: WORKING DIR =", os.getcwd())
    print("STEP 2 DEBUG: FILE EXISTS =", os.path.exists(DATABASE))
    print("==============================\n")

    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# =========================================================
# ========== BASE URL API =================================
# =========================================================

@app.route("/api/base_url")
def get_base_url():
    # Detect your LAN IP automatically
    hostname = socket.gethostname()
    lan_ip = socket.gethostbyname(hostname)

    # ALWAYS return LAN IP for dynamic QR codes
    base_url = f"http://{lan_ip}:8000"
    print(">>> BASE URL SERVED TO FRONTEND:", base_url)

    return {"base_url": base_url}

# =========================================================
# ========== API ROUTES ===================================
# =========================================================

@app.route("/api/customers", methods=["GET", "POST"])
def customers():
    conn = get_db_connection()
    c = conn.cursor()

    # ------------------------------------
    # POST: create new customer
    # ------------------------------------
    if request.method == "POST":
        data = request.get_json()

        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        phone_number = data.get("phone_number")
        company_name = data.get("company_name")
        qr_url = data.get("qr_url")

        if not first_name or not qr_url:
            conn.close()
            return jsonify({"error": "First name and QR URL are required"}), 400

        redirect_code = str(uuid.uuid4())[:8]

        c.execute("""
            INSERT INTO customers 
            (first_name, last_name, email, phone_number, company_name, qr_url, redirect_code, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            first_name, last_name, email, phone_number,
            company_name, qr_url, redirect_code,
            datetime.now().isoformat()
        ))

        conn.commit()
        customer_id = c.lastrowid
        conn.close()

        # =====================================================
        # FIXED: generate QR image with LAN IP (not localhost)
        # =====================================================
        hostname = socket.gethostname()
        lan_ip = socket.gethostbyname(hostname)
        redirect_link = f"http://{lan_ip}:8000/r/{redirect_code}"

        qr_img = qrcode.make(redirect_link)
        buffer = io.BytesIO()
        qr_img.save(buffer, format="PNG")
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()

        return jsonify({
            "message": "Customer saved successfully!",
            "customer_id": customer_id,
            "redirect_code": redirect_code,
            "qr_redirect_link": redirect_link,
            "qr_code": f"data:image/png;base64,{qr_base64}"
        }), 201

    # ------------------------------------
    # GET: return customer list
    # ------------------------------------
    else:
        rows = c.execute("""
            SELECT 
                id, 
                first_name,
                last_name,
                email,
                phone_number,
                company_name,
                qr_url,
                redirect_code,
                created_at
            FROM customers
            ORDER BY created_at DESC
        """).fetchall()

        conn.close()
        return jsonify([dict(row) for row in rows])

# =========================================================
# ========== UPDATE / DELETE ==============================
# =========================================================

@app.route("/api/customers/<int:customer_id>", methods=["PUT"])
def update_customer(customer_id):
    data = request.get_json()
    conn = get_db_connection()
    c = conn.cursor()

    try:
        # Update ALL customer fields
        c.execute("""
            UPDATE customers
            SET company_name = ?, first_name = ?, last_name = ?, 
                email = ?, phone_number = ?, qr_url = ?
            WHERE id = ?
        """, (
            data.get("company_name"),
            data.get("first_name"),
            data.get("last_name"),
            data.get("email"),
            data.get("phone_number"),
            data.get("qr_url"),
            customer_id
        ))
        conn.commit()

        c.execute("SELECT redirect_code FROM customers WHERE id = ?", (customer_id,))
        row = c.fetchone()
        conn.close()

        return jsonify({
            "message": "Customer updated successfully",
            "redirect_code": row["redirect_code"]
        })

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

@app.route("/api/customers/<int:customer_id>", methods=["DELETE"])
def delete_customer(customer_id):
    conn = get_db_connection()
    c = conn.cursor()

    try:
        c.execute("DELETE FROM customers WHERE id = ?", (customer_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Customer deleted successfully"})

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

# =========================================================
# ========== QR REDIRECT ==================================
# =========================================================

@app.route("/r/<code>")
def redirect_qr(code):
    conn = get_db_connection()
    c = conn.cursor()
    row = c.execute("SELECT qr_url FROM customers WHERE redirect_code = ?", (code,)).fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Invalid or expired QR code"}), 404

    return redirect(row["qr_url"])

# =========================================================
# ========== DEBUG SERVER =================================
# =========================================================

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)