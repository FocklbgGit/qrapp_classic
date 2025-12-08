import React, { useRef, useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRModal({ customer, onClose }) {
  if (!customer) return null;

  const qrDisplayRef = useRef(null);
  const qrDownloadRef = useRef(null);

  const BACKEND = import.meta.env.VITE_API_BASE_URL; // API Base
  const [redirectBase, setRedirectBase] = useState("");

  // Border + UI settings
  const [showBorder, setShowBorder] = useState(true);
  const [padding, setPadding] = useState(6);
  const [lineWidth, setLineWidth] = useState(3);
  const [showLogo, setShowLogo] = useState(true);

  const logoUrl = "https://cdn-icons-png.flaticon.com/512/743/743131.png";
  const logoSize = 60;

  // ============================================================
  // Fetch redirect base_url (RESTORES OLD WORKING BEHAVIOR)
  // ============================================================
  useEffect(() => {
    fetch("/api/base_url")
      .then((res) => res.json())
      .then((data) => setRedirectBase(data.base_url))
      .catch(() => {
        // fallback: use primary Vercel domain
        setRedirectBase("https://oilqr.com");
      });
  }, []);

  // ============================================================
  // QR VALUES
  // ============================================================

  // Visible QR in bubble → customer website
  const displayValue = customer.qr_url || "";

  // Hidden QR for download + scanning
  const redirectValue = customer.redirect_code
    ? `${redirectBase}/r/${customer.redirect_code}`
    : customer.qr_url;

  // ============================================================
  // Draw border around QR Canvas
  // ============================================================
  const drawBorder = (canvas) => {
    if (!canvas || !showBorder) return;

    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const inset = padding;

    ctx.strokeStyle = "#000";
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(inset, inset, size - inset * 2, size - inset * 2);
  };

  // ============================================================
  // Download PNG QR (uses hidden redirect QR)
  // ============================================================
  const handleDownload = () => {
    const canvas = qrDownloadRef.current?.querySelector("canvas");
    if (!canvas) {
      alert("QR code not ready — try again.");
      return;
    }

    // Add border to downloaded QR
    if (showBorder) drawBorder(canvas);

    const fileBase =
      customer.company?.trim() ||
      customer.company_name?.trim() ||
      customer.last_name?.trim() ||
      "customer";

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `${fileBase}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ============================================================
  // Extract domain for labeling inside bubble
  // ============================================================
  const extractDomain = (url) => {
    try {
      const { hostname } = new URL(url || "");
      return hostname.replace("www.", "");
    } catch (e) {
      return customer.company || customer.customer || "";
    }
  };

  const domain = extractDomain(customer.qr_url);

  // ============================================================
  // Merged UI + QR Rendering
  // ============================================================
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>

        <h3 style={{ textAlign: "center", marginBottom: 10 }}>
          QR Code for {customer.first_name}
        </h3>

        {/* =======================================================
            Visible QR (customer URL)
        ======================================================== */}
        <div
          ref={qrDisplayRef}
          style={{ textAlign: "center", marginBottom: 30 }}
        >
          <QRCodeCanvas
            value={displayValue}
            size={260}
            level="H"
            includeMargin={true}
            imageSettings={
              showLogo
                ? {
                    src: logoUrl,
                    height: logoSize,
                    width: logoSize,
                    excavate: true,
                  }
                : null
            }
            onLoad={(canvas) => showBorder && drawBorder(canvas)}
          />
          <p style={{ fontSize: 12, marginTop: 6 }}>{domain}</p>
        </div>

        {/* =======================================================
            Hidden download QR (redirect)
        ======================================================== */}
        <div ref={qrDownloadRef} style={{ display: "none" }}>
          <QRCodeCanvas
            value={redirectValue}
            size={300}
            level="H"
            includeMargin={true}
            imageSettings={
              showLogo
                ? {
                    src: logoUrl,
                    height: logoSize,
                    width: logoSize,
                    excavate: true,
                  }
                : null
            }
          />
        </div>

        {/* =======================================================
            Options
        ======================================================== */}
        <div style={{ marginBottom: 20 }}>
          <label>
            <input
              type="checkbox"
              checked={showBorder}
              onChange={() => setShowBorder(!showBorder)}
            />
            &nbsp; Show Border
          </label>

          <br />

          <label>
            Padding:
            <input
              type="number"
              min="0"
              max="20"
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              style={{ width: 60, marginLeft: 8 }}
            />
          </label>

          <br />

          <label>
            Line Width:
            <input
              type="number"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              style={{ width: 60, marginLeft: 8 }}
            />
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              checked={showLogo}
              onChange={() => setShowLogo(!showLogo)}
            />
            &nbsp; Show Logo
          </label>
        </div>

        {/* =======================================================
            Buttons
        ======================================================== */}
        <div style={{ textAlign: "center" }}>
          <button style={btnPrimary} onClick={handleDownload}>
            ⬇ Download QR
          </button>
          <button style={btnClose} onClick={onClose}>
            ✖ Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Styles
// ============================================================

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
  zIndex: 2000,
};

const modalStyle = {
  width: 340,
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
};

const btnPrimary = {
  padding: "8px 14px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  marginRight: 8,
};

const btnClose = {
  padding: "8px 14px",
  background: "#ccc",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
