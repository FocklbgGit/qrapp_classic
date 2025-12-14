# QR App – Baseline Plan (Stable Working State)
**Date:** December 9, 2025  
**Author:** Brad Fockler  

---

## 🚀 System Overview
A fully functional cloud-deployed QR generator + customer manager built with:

- **Frontend:** React (Vite), deployed on **Vercel**
- **Backend:** Flask (Python), running on **AWS Lightsail**
- **Database:** SQLite (`customers.db`)
- **Dynamic Redirect System:** `https://oilqr.com/r/<code>`

The system now supports **dynamic QR codes**, **short redirect codes**, and **stable production URLs**.

---

## ✅ Current Working Features
| Feature | Status | Notes |
|--------|--------|-------|
| Customer form | ✅ | Includes first/last name, email, phone, company, QR URL |
| Generate QR | ✅ | Uses redirect link `https://oilqr.com/r/<code>` |
| Save Customer | ✅ | Inserts customer + generates unique redirect code |
| QR Code Bubble Modal | ✅ | Border + padding controls fully working |
| QR Code label (company/domain) | ✅ | Clean auto-extracted display |
| Search customers | ✅ | Instant filtering |
| Display list of customers | ✅ | All fields + redirect codes |
| Redirect system | ✅ | Public QR redirects via oilqr.com |
| CORS | ✅ | Frontend ↔ Backend allowed in production + local |

---

## 🧩 Technical Configuration

### **Backend (Flask on AWS Lightsail)**

- **Runs on:**
http://127.0.0.1:5000

markdown
Copy code

- **Public API Hostname:**
https://oilqr.com

markdown
Copy code

- **Routes:**
GET /api/base_url
GET /api/customers
POST /api/customers
PUT /api/customers/<id>
DELETE /api/customers/<id>
GET /r/<code> ← dynamic redirect system

java
Copy code

- **Environment:**
```python
BASE_URL = "https://oilqr.com"
Database schema (customers):

id

first_name

last_name

email

phone_number

company_name

qr_url

redirect_code

created_at

Frontend (Vite + React on Vercel)
Local dev URL:

arduino
Copy code
http://localhost:5173
Production project: qrapp_frontend on Vercel

API Base URL (correct + permanent):

ini
Copy code
VITE_API_BASE_URL=https://oilqr.com
Frontend code uses:

jsx
Copy code
const BACKEND = import.meta.env.VITE_API_BASE_URL || "https://oilqr.com";

