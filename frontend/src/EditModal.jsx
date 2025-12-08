import React, { useState, useEffect } from "react";

export default function EditModal({ customer, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({ ...customer });

  useEffect(() => {
    setFormData({ ...customer });
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Edit Customer</h2>

        <input
          name="company_name"
          value={formData.company_name || ""}
          onChange={handleChange}
          placeholder="Company Name"
          style={inputStyle}
        />
        <input
          name="first_name"
          value={formData.first_name || ""}
          onChange={handleChange}
          placeholder="First Name"
          style={inputStyle}
        />
        <input
          name="last_name"
          value={formData.last_name || ""}
          onChange={handleChange}
          placeholder="Last Name"
          style={inputStyle}
        />
        <input
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          placeholder="Email"
          style={inputStyle}
        />
        <input
          name="phone_number"
          value={formData.phone_number || ""}
          onChange={handleChange}
          placeholder="Phone Number"
          style={inputStyle}
        />
        <input
          name="qr_url"
          value={formData.qr_url || ""}
          onChange={handleChange}
          placeholder="QR URL"
          style={inputStyle}
        />

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            onClick={() => onSave(formData)}
            style={{ ...btnStyle, background: "#007bff", color: "#fff" }}
          >
            💾 Save Changes
          </button>

          <button
            onClick={() => onDelete(formData.id)}
            style={{ ...btnStyle, background: "#dc3545", color: "#fff" }}
          >
            🗑 Delete Record
          </button>

          <button onClick={onClose} style={{ ...btnStyle, background: "#ccc" }}>
            ✖ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Inline styles ---
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  width: 400,
  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  textAlign: "left",
};

const inputStyle = {
  width: "100%",
  padding: 8,
  marginBottom: 10,
  borderRadius: 5,
  border: "1px solid #ccc",
};

const btnStyle = {
  padding: "8px 12px",
  margin: "0 5px",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
};
