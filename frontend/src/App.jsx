import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import EditModal from "./EditModal";
import QRModal from "./QRModal";
import CompanyModal from "./CompanyModal";

// -------------------------------------------------------------
// BACKEND API — PRODUCTION
// -------------------------------------------------------------
const API_BASE = "https://oilqr.com";

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [message, setMessage] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // -------------------------------------------------------------
  // HELPER: ENSURE URL HAS PROTOCOL
  // -------------------------------------------------------------
  const ensureProtocol = (url) => {
    if (!url) return url;
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return "https://" + trimmed;
    }
    return trimmed;
  };

  // -------------------------------------------------------------
  // FETCH CUSTOMERS
  // -------------------------------------------------------------
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/customers`);
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error("Fetch customers error:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const clearOnType = () => setMessage("");

  // -------------------------------------------------------------
  // GENERATE LOCAL QR PREVIEW
  // -------------------------------------------------------------
  const generateQR = () => {
    if (!qrUrl) {
      setMessage("Enter a URL first.");
      return;
    }
    const validUrl = ensureProtocol(qrUrl);
    setQrValue(validUrl);
  };

  // -------------------------------------------------------------
  // SAVE CUSTOMER (CREATE)
  // -------------------------------------------------------------
  const saveCustomer = async () => {
    if (!firstName || !qrUrl) {
      setMessage("Must enter first name and QR URL.");
      return;
    }

    const validUrl = ensureProtocol(qrUrl);

    try {
      const response = await fetch(`${API_BASE}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone_number: phone.trim(),
          qr_url: validUrl,
        }),
      });

      if (response.ok) {
        await fetchCustomers();

        setMessage("Customer saved.");
        setCompanyName("");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setQrUrl("");
        setQrValue("");
      } else {
        const err = await response.json();
        setMessage("Error: " + err.error);
      }
    } catch (err) {
      setMessage("Save error: " + err.message);
    }
  };

  // -------------------------------------------------------------
  // OPEN EDIT MODAL
  // -------------------------------------------------------------
  const handleEdit = (cust) => {
    setSelectedCustomer(cust);
    setEditModalOpen(true);
  };

  // -------------------------------------------------------------
  // UPDATE CUSTOMER (redirect_code NEVER sent)
  // -------------------------------------------------------------
  const handleUpdate = async (updatedData) => {
    try {
      const { redirect_code, ...safe } = updatedData;

      if (safe.qr_url) {
        safe.qr_url = ensureProtocol(safe.qr_url);
      }

      await fetch(`${API_BASE}/api/customers/${updatedData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safe),
      });

      await fetchCustomers();
      setEditModalOpen(false);
    } catch (err) {
      setMessage("Update error: " + err.message);
    }
  };

  // -------------------------------------------------------------
  // DELETE CUSTOMER
  // -------------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await fetch(`${API_BASE}/api/customers/${id}`, { method: "DELETE" });
      await fetchCustomers();
      setEditModalOpen(false);
    } catch (err) {
      setMessage("Delete error: " + err.message);
    }
  };

  // -------------------------------------------------------------
  // FILTER + PAGINATION
  // -------------------------------------------------------------
  const filtered = customers.filter((cust) =>
    [
      cust.first_name,
      cust.last_name,
      cust.company_name,
      cust.email,
      cust.phone_number,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(start, start + pageSize);

  const handlePage = (dir) => {
    if (dir === "prev" && currentPage > 1) setCurrentPage(currentPage - 1);
    if (dir === "next" && currentPage < totalPages)
      setCurrentPage(currentPage + 1);
  };

  // -------------------------------------------------------------
  // OPEN COMPANY MODAL
  // -------------------------------------------------------------
  const handleShowCompany = (cust) => {
    setSelectedCompany(cust);
    setCompanyModalOpen(true);
  };

  // -------------------------------------------------------------
  // OPEN QR MODAL
  // -------------------------------------------------------------
  const handleShowQR = (cust) => {
    setSelectedQR(cust);
    setQrModalOpen(true);
  };

  // -------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", textAlign: "center" }}>
      <h1>QR Code Generator</h1>

      {/* FORM */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => {
            clearOnType();
            setCompanyName(e.target.value);
          }}
          style={{ width: "80%", padding: 8, marginBottom: 8 }}
        />
        <input
          type="text"
          placeholder="First Name *"
          value={firstName}
          onChange={(e) => {
            clearOnType();
            setFirstName(e.target.value);
          }}
          style={{ width: "80%", padding: 8, marginBottom: 8 }}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => {
            clearOnType();
            setLastName(e.target.value);
          }}
          style={{ width: "80%", padding: 8, marginBottom: 8 }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            clearOnType();
            setEmail(e.target.value);
          }}
          style={{ width: "80%", padding: 8, marginBottom: 8 }}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => {
            clearOnType();
            setPhone(e.target.value);
          }}
          style={{ width: "80%", padding: 8, marginBottom: 8 }}
        />
        <input
          type="text"
          placeholder="Enter QR Redirect URL * (e.g., example.com)"
          value={qrUrl}
          onChange={(e) => {
            clearOnType();
            setQrUrl(e.target.value);
          }}
          style={{ width: "80%", padding: 8, marginBottom: 8 }}
        />
        <div style={{ fontSize: 12, color: "#666", marginTop: -4, marginBottom: 8 }}>
          You can enter just "example.com" - https:// will be added automatically
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={generateQR}
          style={{
            padding: "8px 20px",
            background: "#239f07",
            color: "white",
            border: "none",
            borderRadius: 6,
            marginRight: 10,
            cursor: "pointer",
          }}
        >
          Generate QR
        </button>

        <button
          onClick={saveCustomer}
          style={{
            padding: "8px 20px",
            background: "#3e53f6",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Save Customer
        </button>
      </div>

      {/* QR PREVIEW */}
      {qrValue && (
        <div style={{ marginTop: 20 }}>
          <QRCodeCanvas value={qrValue} size={200} />
          <p>{qrValue}</p>
        </div>
      )}

      {message && <p>{message}</p>}

      {/* SEARCH */}
      <div style={{ margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Search customers…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "60%", padding: 8 }}
        />
      </div>

      {/* CUSTOMER LIST */}
      <table style={{ width: "95%", margin: "0 auto", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th style={thStyle}>Company</th>
            <th style={thStyle}>First</th>
            <th style={thStyle}>Last</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>QR URL</th>
            <th style={thStyle}>QR Name</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {pageData.map((cust) => (
            <tr key={cust.id}>
              <td style={tdStyle}>
                <span 
                  onClick={() => handleShowCompany(cust)}
                  style={{ color: "#3e53f6", cursor: "pointer", textDecoration: "underline" }}
                >
                  {cust.company_name || cust.first_name}
                </span>
              </td>
              <td style={tdStyle}>{cust.first_name}</td>
              <td style={tdStyle}>{cust.last_name}</td>
              <td style={tdStyle}>{cust.email}</td>
              <td style={tdStyle}>{cust.phone_number}</td>
              <td style={tdStyle}>{cust.qr_url}</td>
              <td style={tdStyle}>{cust.qr_label || '-'}</td>

              <td style={tdStyle}>
                <button
                  onClick={() => handleEdit(cust)}
                  style={{ marginRight: 5 }}
                >
                  Edit
                </button>

                <button onClick={() => handleShowQR(cust)}>QR</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => handlePage("prev")}
          disabled={currentPage === 1}
          style={{ marginRight: 10 }}
        >
          ← Prev
        </button>

        Page {currentPage} of {totalPages || 1}

        <button
          onClick={() => handlePage("next")}
          disabled={currentPage === totalPages || totalPages === 0}
          style={{ marginLeft: 10 }}
        >
          Next →
        </button>
      </div>

      {/* EDIT MODAL */}
      {editModalOpen && selectedCustomer && (
        <EditModal
          customer={selectedCustomer}
          onClose={() => setEditModalOpen(false)}
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      {/* QR MODAL */}
      {qrModalOpen && selectedQR && (
        <QRModal customer={selectedQR} onClose={() => setQrModalOpen(false)} />
      )}

      {/* COMPANY MODAL */}
      {companyModalOpen && selectedCompany && (
        <CompanyModal 
          customer={selectedCompany} 
          onClose={() => {
            setCompanyModalOpen(false);
            fetchCustomers();
          }}
          onOpenQR={(qr) => {
            setCompanyModalOpen(false);
            setSelectedQR({...selectedCompany, ...qr});
            setQrModalOpen(true);
          }}
        />
      )}
    </div>
  );
}

// TABLE STYLES
const thStyle = { padding: 8, border: "1px solid #ddd" };
const tdStyle = { padding: 8, border: "1px solid #ddd" };