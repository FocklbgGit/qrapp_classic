import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRModal({ customer, onClose }) {
  if (!customer) return null;

  // Always use production redirect for QR
  const BACKEND = "https://oilqr.com";

  const qrCanvasRef = useRef(null);

  // ============================
  // UI STATE
  // ============================
  const [showBorder, setShowBorder] = useState(true);
  const [showPadding, setShowPadding] = useState(true);
  const [padding, setPadding] = useState(4);
  const [lineWidth, setLineWidth] = useState(3);

  // ============================
  // SAFE DOMAIN + QR VALUES
  // ============================
  const displayValue = customer.qr_url || customer.url || "";

  const extractDomain = (url) => {
    try {
      const { hostname } = new URL(url || "");
      return hostname.replace("www.", "");
    } catch (e) {
      // fallbacks so page never looks empty
      return (
        customer.company_name ||
        customer.company ||
        customer.customer ||
        customer.first_name ||
        ""
      );
    }
  };

  const domain = extractDomain(displayValue);

  const redirectCode = customer.redirect_code || customer.code || "";
  const qrValue = redirectCode ? `${BACKEND}/r/${redirectCode}` : displayValue;

  // ============================
  // DOWNLOAD PNG (HIGH RES)
  // ============================
  const handleDownload = () => {
    const qrCanvas = qrCanvasRef.current?.querySelector("canvas");
    if (!qrCanvas) return;

    const qrSize = qrCanvas.width;
    const pad = showPadding ? padding : 0;
    const border = showBorder ? lineWidth : 0;
    const finalSize = qrSize + pad * 2 + border * 2;

    const out = document.createElement("canvas");
    out.width = finalSize;
    out.height = finalSize;

    const ctx = out.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, finalSize, finalSize);

    // Optional black border
    if (showBorder) {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = border;
      ctx.strokeRect(
        border / 2,
        border / 2,
        finalSize - border,
        finalSize - border
      );
    }

    // Draw QR in center with padding
    ctx.drawImage(qrCanvas, border + pad, border + pad);

    const link = document.createElement("a");
    link.download = `${redirectCode || domain || "customer"}_QR.png`;
    link.href = out.toDataURL("image/png");
    link.click();
  };

  // ============================
  // SMALL INPUT COMPONENT
  // ============================
  const NumberControl = ({ label, value, onChange }) => (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
      }}
    >
      <span style={{ fontWeight: 600, minWidth: 90 }}>{label}</span>
      <input
        type="number"
        value={value}
        min={0}
        style={{ width: 60, marginLeft: 8 }}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (!Number.isNaN(next)) onChange(next);
        }}
      />
    </div>
  );

  // ============================
  // RENDER
  // ============================
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: 20,
          borderRadius: 10,
          width: 380,
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ marginBottom: 4 }}>QR Code</h2>
        <div
          style={{
            fontSize: 12,
            color: "#444",
            marginBottom: 16,
            wordBreak: "break-all",
          }}
        >
          {domain}
        </div>

        {/* Controls block: centered as a group, rows left-justified */}
        <div
          style={{
            width: 260,
            maxWidth: "100%",
            margin: "0 auto 12px auto",
            textAlign: "left",
          }}
        >
          {/* Border row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginRight: 10,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showBorder}
                onChange={() => setShowBorder((v) => !v)}
                style={{ marginRight: 4 }}
              />
              Border
            </label>
            <NumberControl
              label="Width:"
              value={lineWidth}
              onChange={setLineWidth}
            />
          </div>

          {/* Padding row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginRight: 10,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showPadding}
                onChange={() => setShowPadding((v) => !v)}
                style={{ marginRight: 4 }}
              />
              Padding
            </label>
            <NumberControl
              label="Amount:"
              value={padding}
              onChange={setPadding}
            />
          </div>
        </div>

        {/* QR Preview */}
        <div
          ref={qrCanvasRef}
          style={{
            padding: showPadding ? padding : 0,
            border: showBorder ? `${lineWidth}px solid #000` : "none",
            borderRadius: 10,
            display: "inline-block",
            background: "#ffffff",
          }}
        >
          <QRCodeCanvas value={qrValue || ""} size={260} level="H" />
        </div>

        {/* URL under QR (full display value) */}
        <div
          style={{
            marginTop: 10,
            fontSize: 11,
            color: "#555",
            maxWidth: 320,
            wordBreak: "break-all",
            marginInline: "auto",
          }}
        >
          {displayValue}
        </div>

        {/* Buttons */}
        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleDownload}
            style={{
              background: "#007bff",
              color: "#ffffff",
              padding: "8px 14px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              marginRight: 8,
            }}
          >
            Download QR PNG
          </button>
          <button
            onClick={onClose}
            style={{
              background: "#e5e5e5",
              padding: "8px 14px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
