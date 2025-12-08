import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import EditModal from "./EditModal";
import QRModal from "./QRModal";

export default function App() {

  // STATIC backend URL – always correct for classic QR app
  const [baseUrl] = useState("http://localhost:8000");

  // Load customers on startup
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Form fields
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [message, setMessage] = useState("");

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // ---- Fetch Customers ----
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/customers`);
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ---- QR Generation ----
  const generateQR = () => {
    if (!qrUrl) {
      setMessage("Please enter a URL before generating a QR code.");
      return;
    }
    setQrValue(qrUrl);
    setMessage("");
  };

  // ---- Save New Customer ----
  const saveCustomer = async () => {
    if (!firstName || !qrUrl) {
      setMessage("Please enter at least a first name and a QR URL.");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone_number: phone.trim(),
          qr_url: qrUrl.trim(),
        }),
      });

      if (response.ok) {
        setMessage("✅ Customer saved successfully!");
        setCompanyName("");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setQrUrl("");
        setQrValue("");

        fetchCustomers();
      } else {
        const error = await response.json();
        setMessage("❌ Error: " + error.error);
      }
    } catch (err) {
      setMessage("❌ Server error: " + err.message);
    }
  };

  // ---- Edit / Update ----
  const handleEdit = (cust) => {
    setSelectedCustomer(cust);
    setEditModalOpen(true);
  };

  const handleUpdate = async (updatedData) => {
    try {
      const response = await fetch(`${baseUrl}/api/customers/${updatedData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        setMessage("✅ Customer updated successfully!");
        fetchCustomers();
        setEditModalOpen(false);
      }
    } catch (err) {
      setMessage("❌ Server error: " + err.message);
    }
  };

  // ---- Delete ----
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      await fetch(`${baseUrl}/api/customers/${id}`, { method: "DELETE" });
      setMessage("🗑 Customer deleted successfully!");
      fetchCustomers();
    } catch (err) {
      setMessage("❌ Server error: " + err.message);
    }
  };

  // ---- Search ----
  const filteredCustomers = customers.filter((cust) =>
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

  // ---- Pagination ----
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const displayedCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) setCurrentPage(currentPage - 1);
    if (direction === "next" && currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // ---- QR Modal ----
  const handleShowQR = (cust) => {
    setSelectedQR(cust);
    setQrModalOpen(true);
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", textAlign: "center" }}>
      <h1>QR Code Generator & Customer Management</h1>

      {/* Form */}
      <div style={{ marginBottom: 20 }}>
        <input type="text" placeholder="Company Name"
          value={companyName} onChange={(e) => setCompanyName(e.target.value)}
          style={{ width: "80%", padding: 8, marginBottom: 8 }} />
        <br />
        <input type="text" placeholder="First Name"
          value={firstName} onChange={(e) => setFirstName(e.target.value)}
          style={{ width: "80%", padding: 8, marginBottom: 8 }} />
        <br />
        <input type="text" placeholder="Last Name"
          value={lastName} onChange={(e) => setLastName(e.target.value)}
          style={{ width: "80%", padding: 8, marginBottom: 8 }} />
        <br />
        <input type="email" placeholder="Email Address"
          value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width: "80%", padding: 8, marginBottom: 8 }} />
        <br />
        <input type="tel" placeholder="Phone Number"
          value={phone} onChange={(e) => setPhone(e.target.value)}
          style={{ width: "80%", padding: 8, marginBottom: 8 }} />
        <br />
        <input type="text" placeholder="Enter URL for QR code"
          value={qrUrl} onChange={(e) => setQrUrl(e.target.value)}
          style={{ width: "80%", padding: 8, marginBottom: 8 }} />
      </div>

      {/* Buttons */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={generateQR} style={{ padding: "8px 20px", marginRight: 10 }}>
          Generate QR
        </button>
        <button onClick={saveCustomer} style={{ padding: "8px 20px" }}>
          Save Customer
        </button>
      </div>

      {/* QR Display */}
      {qrValue && (
        <div style={{ marginTop: 20 }}>
          <QRCodeCanvas value={qrValue} size={200} />
          <p>{qrValue}</p>
        </div>
      )}

      {/* Message */}
      {message && <p style={{ marginTop: 20 }}>{message}</p>}

      {/* Search */}
      <div style={{ margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "60%", padding: 8 }}
        />
      </div>

      {/* Customer Table */}
      <h2>Customer List</h2>
      <table style={{ width: "95%", margin: "0 auto", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Company</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>First Name</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Last Name</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Email</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Phone</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>QR URL</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {displayedCustomers.map((cust) => (
            <tr key={cust.id}>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>{cust.company_name}</td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>{cust.first_name}</td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>{cust.last_name}</td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>{cust.email}</td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>{cust.phone_number}</td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>{cust.qr_url}</td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                <button onClick={() => handleEdit(cust)} style={{ marginRight: 5 }}>
                  Edit
                </button>
                <button onClick={() => handleShowQR(cust)}>
                  QR
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: 20 }}>
        <label>
          Rows per page:
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>

        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
            style={{ marginRight: 10 }}
          >
            ← Previous
          </button>

            Page {currentPage} of {totalPages || 1}

          <button
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages || totalPages === 0}
            style={{ marginLeft: 10 }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedCustomer && (
        <EditModal
          customer={selectedCustomer}
          onClose={() => setEditModalOpen(false)}
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      {/* QR Modal */}
      {qrModalOpen && selectedQR && (
        <QRModal
          customer={selectedQR}
          onClose={() => setQrModalOpen(false)}
        />
      )}
    </div>
  );
}
