# QR App – Baseline Plan (Stable Working State)
**Date:** November 10, 2025  
**Author:** Brad Fockler  

---

## ✅ System Overview
A fully functional local QR generator and customer manager built with:
- **Frontend:** React (Vite)
- **Backend:** Flask (Python)
- **Database:** SQLite (`customers.db`)
- **QR Generation:** `qrcode[pil]` library

---

## ✅ Current Working Features
| Feature | Status | Notes |
|----------|---------|-------|
| Customer form (first name, last name, email, phone, company, QR URL) | ✅ | Matches database fields exactly |
| Generate QR | ✅ | Renders from entered `qr_url` |
| Save Customer | ✅ | Inserts record into SQLite and generates QR |
| Search Customers | ✅ | Filters dynamically by name or company |
| Display List of Customers | ✅ | Displays all saved customers with live QR preview |
| Database Schema | ✅ | Uses `qr_url` instead of `url`; all fields aligned |
| CORS / Port Communication | ✅ | Flask (8000) ↔ React (5173) confirmed |

---

## ⚙️ Technical Configuration
**Backend:**  
- Flask app runs at `http://127.0.0.1:8000`
- Routes:
  - `POST /api/customers` – Adds a customer, returns QR code
  - `GET /api/customers` – Lists all customers
- Database: `customers.db` (SQLite)
- Table: `customers`
  - Fields: `id`, `first_name`, `last_name`, `email`, `phone_number`, `company_name`, `qr_url`, `created_at`

**Frontend:**  
- React app (Vite) runs at `http://localhost:5173`
- Uses `qrcode.react` for rendering QR codes
- Fetches from `http://127.0.0.1:8000/api/customers`
- Clean state managed with React hooks

---

## 🔒 Baseline Rules
1. **No functionality changes** (code, fields, or behavior) until a feature plan is approved.  
2. **All new features will be planned and documented** before any modification.  
3. **Keep this version** as a rollback-safe working copy.  
4. **Commit** this baseline to version control (Git or GitLab/Vercel project).

---

## 🧠 Next Planned Features (To Be Scoped)
| Priority | Feature | Purpose |
|-----------|----------|----------|
| 🟢 | Pagination (10–20 per page) | Keep customer list manageable |
| 🟢 | Delete Customer button | Clean up unwanted entries |
| 🟡 | Export / Print QR list | Easy record printing or data export |
| 🟡 | Sorting options (A–Z, date added) | Improve large list usability |
| ⚪ | Authentication (login) | Optional for production deployment |

---

## 📌 Notes
- This version is stable and should be the starting point for all future updates.  
- Always activate the virtual environment before running backend:
  ```powershell
  cd C:\PythonDev\qrapp\backend
  .\venv\Scripts\Activate.ps1
  python app.py
  ```
- Start frontend with:
  ```bash
  cd C:\PythonDev\qrapp\frontend
  npm run dev
  ```
- Test backend health anytime:
  ```bash
  curl http://127.0.0.1:8000/api/customers
  ```

---

**End of Baseline Document**
