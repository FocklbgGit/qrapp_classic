import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRModal({ customer, onClose }) {
  if (!customer) return null;

  // Hard-coded redirect host – this is what we WANT
  const BACKEND = "https://oilqr.com";

  const qrCanvasRef = useRef(null);

  const [showBorder, setShowBorder] = useState(true);
  const [padding, setPadding] = useState(4);
  const [lineWidth, setLineWidth] = useState(3);
  const [showLogo, setShowLogo] = useState(true);

  const logoUrl = "https://cdn-icons-png.flaticon.com/512/743/743131.png";
  const logoSize = 60;

  const extractDomain = (url) => {
    try {
      const { hostname } = new URL(url || "");
      return hostname.replace("www.", "");
    } catch (e) {
      return customer.company || customer.customer || "";
    }
  };

  // This is just for showing under the QR
  const domain = extractDomain(customer.url);

  // 👇 THIS is the URL actually encoded into the QR
  // It will ALWAYS be https://oilqr.com/r/<code>
  const qrValue = `${BACKEND}/r/${customer.code}`;

  const handleDownload = () => {
    const qrCanvas = qrCanvasRef.current?.querySelector("canvas");
    if (!qrCanvas) return;

    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = logoUrl;

    logo.onload = () => {
      const qrSize = qrCanvas.width;
      const pad = showBorder ? padding : 0;
      const border = showBorder ? lineWidth : 0;
      const final = qrSize + pad * 2 + border * 2;

      const out = document.createElement("canvas");
      out.width = final;
      out.height = final;

      const ctx = out.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, final, final);

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

      ctx.drawImage(qrCanvas, border + pad, border + pad);

      if (showLogo) {
        const x = (final - logoSize) / 2;
        const y = (final - logoSize) / 2;
        ctx.drawImage(logo, x, y, logoSize, logoSize);
      }

      const link = document.createElement("a");
      link.download = `${customer.code}_QR.png`;
      link.href = out.toDataURL("image/png");
      link.click();
    };
  };

  const NumberControl = ({ label, value, onChange }) => (
    <div style={{ marginBottom: 8 }}>
      <strong>{label}</strong>
      <input
        type="number"
        value={value}
        style={{ width: 60, marginLeft: 8 }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
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
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          width: 380,
          textAlign: "center",
        }}
      >
        <h2>QR Code for {domain}</h2>

        <label>
          <input
            type="checkbox"
            checked={showBorder}
            onChange={() => setShowBorder(!showBorder)}
          />{" "}
          Add Border
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={showLogo}
            onChange={() => setShowLogo(!showLogo)}
          />{" "}
          Show Logo
        </label>

        <div style={{ marginTop: 10 }}>
          <NumberControl
            label="Padding:"
            value={padding}
            onChange={setPadding}
          />
          <NumberControl
            label="Border Width:"
            value={lineWidth}
            onChange={setLineWidth}
          />
        </div>

        <div
          ref={qrCanvasRef}
          style={{
            position: "relative",
            padding: showBorder ? padding : 0,
            border: showBorder ? `${lineWidth}px solid black` : "none",
            borderRadius: 10,
            display: "inline-block",
            background: "#fff",
            marginTop: 10,
          }}
        >
          <QRCodeCanvas
            value={qrValue}
            size={260}
            level="H"
            includeMargin={false}
          />

          {showLogo && (
            <img
              src={logoUrl}
              alt="logo"
              style={{
                position: "absolute",
                width: logoSize,
                height: logoSize,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        <div style={{ marginTop: 10, fontSize: 12 }}>{domain}</div>

        <button
          onClick={handleDownload}
          style={{
            background: "#007BFF",
            color: "white",
            padding: "10px 14px",
            borderRadius: 6,
            marginTop: 15,
            cursor: "pointer",
          }}
        >
          Download QR PNG
        </button>

        <button
          onClick={onClose}
          style={{
            background: "#eee",
            padding: "10px 14px",
            borderRadius: 6,
            marginLeft: 10,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
