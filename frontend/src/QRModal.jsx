import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRModal({ customer, onClose }) {
  if (!customer) return null;

  const qrCanvasRef = useRef(null);

  // -------------------------------
  // Always use production redirect
  // -------------------------------
  const qrValue = `https://oilqr.com/r/${customer.code}`;

  // -------------------------------
  // Border + Padding Controls
  // -------------------------------
  const [showBorder, setShowBorder] = useState(true);
  const [padding, setPadding] = useState(4);
  const [lineWidth, setLineWidth] = useState(3);

  // -------------------------------
  // Extract "short name"
  // C = company_name → fallback to URL domain
  // -------------------------------
  const extractDomain = (url) => {
    if (!url) return "";
    try {
      const { hostname } = new URL(url);
      return hostname.replace("www.", "");
    } catch {
      return "";
    }
  };

  const shortName =
    (customer.company_name && customer.company_name.trim()) ||
    extractDomain(customer.url) ||
    "";

  // -------------------------------
  // Download PNG (no logo)
  // -------------------------------
  const handleDownload = () => {
    const qrCanvas = qrCanvasRef.current?.querySelector("canvas");
    if (!qrCanvas) return;

    const qrSize = qrCanvas.width;
    const pad = showBorder ? padding : 0;
    const border = showBorder ? lineWidth : 0;
    const final = qrSize + pad * 2 + border * 2;

    const out = document.createElement("canvas");
    out.width = final;
    out.height = final;

    const ctx = out.getContext("2d");

    // Background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, final, final);

    // Border
    if (showBorder) {
      ctx.strokeStyle = "#000";
      ctx.lineWidth = border;
      ctx.strokeRect(
        border / 2,
        border / 2,
        final - border,
        final - border
      );
    }

    // Draw QR
    ctx.drawImage(qrCanvas, border + pad, border + pad);

    // Download file
    const link = document.createElement("a");
    link.download = `${customer.code}_QR.png`;
    link.href = out.toDataURL("image/png");
    link.click();
  };

  // -------------------------------
  // Control Row Component
  // Left-aligned rows, centered as a block
  // -------------------------------
  const ControlRow = ({ children }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        gap: "12px",
        width: "260px", // matched to QR width
        margin: "4px auto" // <-- centers the whole row block
      }}
    >
      {children}
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          width: 380,
          textAlign: "center"
        }}
      >
        <h2>QR Code for {shortName}</h2>

        {/* ---------------------------------
            Controls — left aligned, centered as group
        ---------------------------------- */}
        <ControlRow>
          <input
            type="checkbox"
            checked={showBorder}
            onChange={() => setShowBorder(!showBorder)}
          />
          <label style={{ width: 70 }}>Border</label>

          <label>Width:</label>
          <input
            type="number"
            value={lineWidth}
            style={{ width: 50 }}
            onChange={(e) => setLineWidth(Number(e.target.value))}
          />
        </ControlRow>

        <ControlRow>
          <input
            type="checkbox"
            checked={padding > 0}
            onChange={() => setPadding(padding > 0 ? 0 : 4)}
          />
          <label style={{ width: 70 }}>Padding</label>

          <label>Size:</label>
          <input
            type="number"
            value={padding}
            style={{ width: 50 }}
            onChange={(e) => setPadding(Number(e.target.value))}
          />
        </ControlRow>

        {/* ---------------------------------
            QR Code Preview
        ---------------------------------- */}
        <div
          ref={qrCanvasRef}
          style={{
            position: "relative",
            padding: showBorder ? padding : 0,
            border: showBorder ? `${lineWidth}px solid black` : "none",
            borderRadius: 10,
            display: "inline-block",
            background: "#fff",
            marginTop: 12
          }}
        >
          <QRCodeCanvas
            value={qrValue}
            size={260}
            level="H"
            includeMargin={false}
          />
        </div>

        <div style={{ marginTop: 10, fontSize: 12 }}>{shortName}</div>

        {/* ---------------------------------
            Buttons
        ---------------------------------- */}
        <div style={{ marginTop: 20 }}>
          <button
            onClick={handleDownload}
            style={{
              background: "#007BFF",
              color: "white",
              padding: "10px 14px",
              borderRadius: 6,
              cursor: "pointer",
              marginRight: 10
            }}
          >
            Download PNG
          </button>

          <button
            onClick={onClose}
            style={{
              background: "#ccc",
              padding: "10px 14px",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
