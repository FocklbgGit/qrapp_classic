import React, { useState, useEffect } from "react";

export default function EditModal({ customer, onClose, onSave, onDelete }) {
  const stripRedirect = (obj) => {
    const { redirect_code, ...safe } = obj;
    return safe;
  };

  const [formData, setFormData] = useState(stripRedirect(customer));
  const [showMessage, setShowMessage] = useState("");

  useEffect(() => {
    setFormData(stripRedirect(customer));
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShowMessage("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const safeData = stripRedirect(formData);
    await onSave(safeData);
    setShowMessage("Changes saved successfully.");
  };

  const handleCancel = () => {
    setFormData(stripRedirect(customer));
    setShowMessage("");
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeButtonStyle}>✖</button>

        <h2>Edit Customer</h2>

        {showMessage && (
          <div style={{ color: "green", marginBottom: 10 }}>
            {showMessage}
          </div>
        )}

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
            onClick={handleSave}
            style={{ ...btnStyle, background: "#3e53f6", color: "#fff" }}
          >
            💾 Save Changes
          </button>

          <button
            onClick={() => onDelete(customer.id)}
            style={{ ...btnStyle, background: "#dc3545", color: "#fff" }}
          >
            🗑 Delete Record
          </button>

          <button
            onClick={handleCancel}
            style={{ ...btnStyle, background: "#ccc" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

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
  position: "relative",
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  width: 400,
  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  textAlign: "left",
};

const closeButtonStyle = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "#dc3545",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  width: 36,
  height: 36,
  cursor: "pointer",
  fontSize: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
};

const inputStyle = {
  width: "100%",
  padding: 8,
  marginBottom: 10,
  borderRadius: 5,
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const btnStyle = {
  padding: "8px 12px",
  margin: "0 5px",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
};

