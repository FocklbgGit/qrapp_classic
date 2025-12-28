import React, { useState, useEffect } from "react";
import { useAuth } from './AuthContext';

// -------------------------------------------------------------
// BACKEND API — PRODUCTION
// https://oilqr.com is the permanent production URL
// NEVER change this to an IP address
// -------------------------------------------------------------
const API_BASE = "https://oilqr.com";

export default function CompanyModal({ customer, onClose, onOpenQR }) {
  const { getAuthHeaders } = useAuth();

  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQrUrl, setNewQrUrl] = useState('');
  const [newQrLabel, setNewQrLabel] = useState('');
  const [newQrType, setNewQrType] = useState('dynamic');
  const [saving, setSaving] = useState(false);
  const [editingQR, setEditingQR] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editType, setEditType] = useState('dynamic');

  useEffect(() => {
    loadQRCodes();
  }, [customer.id]);

  const loadQRCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/customers/${customer.id}/qrcodes`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setQrCodes(data);
      }
    } catch (error) {
      console.error('Error loading QR codes:', error);
    }
    setLoading(false);
  };

  const createQRCode = async () => {
    if (!newQrUrl.trim()) {
      alert('Please enter a URL');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/customers/${customer.id}/qrcodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          qr_url: newQrUrl.trim().startsWith('http') ? newQrUrl.trim() : 'https://' + newQrUrl.trim(),
          label: newQrLabel.trim(),
          qr_type: newQrType
        })
      });
      
      if (response.ok) {
        setNewQrUrl('');
        setNewQrLabel('');
        setNewQrType('dynamic');
        setShowAddForm(false);
        loadQRCodes();
      } else {
        alert('Error creating QR code');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating QR code');
    }
    setSaving(false);
  };

  const updateQRCode = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/qrcodes/${editingQR.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          qr_url: editUrl.trim().startsWith('http') ? editUrl.trim() : 'https://' + editUrl.trim(),
          label: editLabel.trim(),
          qr_type: editType
        })
      });
      
      if (response.ok) {
        setEditingQR(null);
        loadQRCodes();
      } else {
        alert('Error updating QR code');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating QR code');
    }
    setSaving(false);
  };

  const startEdit = (qr) => {
    setEditingQR(qr);
    setEditUrl(qr.qr_url || '');
    setEditLabel(qr.label || '');
    setEditType(qr.qr_type || 'dynamic');
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}>
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        width: 500,
        maxHeight: "80vh",
        overflowY: "auto"
      }}>
        <h2 style={{ marginTop: 0 }}>{customer.company_name || `${customer.first_name} ${customer.last_name}`}</h2>
        
        {/* Company Info */}
        <div style={{ marginBottom: 20, padding: 15, background: "#f9f9f9", borderRadius: 6 }}>
          <p style={{ margin: "5px 0" }}><strong>Contact:</strong> {customer.first_name} {customer.last_name}</p>
          <p style={{ margin: "5px 0" }}><strong>Email:</strong> {customer.email || '-'}</p>
          <p style={{ margin: "5px 0" }}><strong>Phone:</strong> {customer.phone_number || '-'}</p>
        </div>

        {/* QR Codes List */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>QR Codes</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: "6px 12px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            + Add QR Code
          </button>
        </div>

        {showAddForm && (
          <div style={{ margin: "15px 0", padding: 15, background: "#f0f8ff", borderRadius: 6 }}>
            <input
              type="text"
              placeholder="QR Name (e.g., 'Spring Promo')"
              value={newQrLabel}
              onChange={(e) => setNewQrLabel(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8, boxSizing: "border-box" }}
            />
            <input
              type="text"
              placeholder="URL (e.g., example.com/promo)"
              value={newQrUrl}
              onChange={(e) => setNewQrUrl(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8, boxSizing: "border-box" }}
            />
            <div style={{ marginBottom: 10 }}>
              <label style={{ marginRight: 15 }}>
                <input
                  type="radio"
                  value="dynamic"
                  checked={newQrType === 'dynamic'}
                  onChange={(e) => setNewQrType(e.target.value)}
                /> Dynamic
              </label>
              <label>
                <input
                  type="radio"
                  value="static"
                  checked={newQrType === 'static'}
                  onChange={(e) => setNewQrType(e.target.value)}
                /> Static
              </label>
            </div>
            <button
              onClick={createQRCode}
              disabled={saving}
              style={{
                padding: "8px 16px",
                background: "#3e53f6",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                marginRight: 10
              }}
            >
              {saving ? 'Saving...' : 'Create QR Code'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                padding: "8px 16px",
                background: "#eee",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : qrCodes.length === 0 ? (
          <p style={{ color: "#666" }}>No QR codes found.</p>
        ) : (
          <div>
            {qrCodes.map(qr => (
              <div 
                key={qr.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 12,
                  border: "1px solid #eee",
                  borderRadius: 6,
                  marginBottom: 8
                }}
              >
                <div>
                  <strong>{qr.label || 'Untitled QR'}</strong>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {qr.qr_url}
                  </div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: 3,
                      background: qr.qr_type === 'static' ? '#e0e0e0' : '#d4edda',
                      color: qr.qr_type === 'static' ? '#666' : '#155724'
                    }}>
                      {qr.qr_type || 'dynamic'}
                    </span>
                    <span style={{ marginLeft: 10 }}>Scans: {qr.total_scans || 0}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button
                    onClick={() => startEdit(qr)}
                    style={{
                      padding: "6px 12px",
                      background: "#ffc107",
                      color: "#000",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer"
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onOpenQR(qr)}
                    style={{
                      padding: "6px 12px",
                      background: "#3e53f6",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer"
                    }}
                  >
                    View QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            background: "#eee",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            width: "100%"
          }}
        >
          Close
        </button>

        {/* EDIT QR MODAL */}
        {editingQR && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10002
          }} onClick={() => setEditingQR(null)}>
            <div style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: 350,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
            }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>{editingQR.label || 'Edit QR Code'}</h3>
              <input
                type="text"
                placeholder="QR Name"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 8, boxSizing: "border-box" }}
              />
              <input
                type="text"
                placeholder="URL"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 8, boxSizing: "border-box" }}
              />
              <div style={{ marginBottom: 15 }}>
                <label style={{ marginRight: 15 }}>
                  <input
                    type="radio"
                    value="dynamic"
                    checked={editType === 'dynamic'}
                    onChange={(e) => setEditType(e.target.value)}
                  /> Dynamic
                </label>
                <label>
                  <input
                    type="radio"
                    value="static"
                    checked={editType === 'static'}
                    onChange={(e) => setEditType(e.target.value)}
                  /> Static
                </label>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setEditingQR(null)}
                  style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, background: "white", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={updateQRCode}
                  disabled={saving}
                  style={{ padding: "8px 16px", border: "none", borderRadius: 4, background: "#28a745", color: "white", cursor: "pointer", fontWeight: "bold" }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}