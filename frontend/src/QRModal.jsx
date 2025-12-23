import React, { useRef, useEffect, useState } from "react";

export default function QRModal({ customer, onClose }) {
  if (!customer) return null;

  const API_BASE = "http://3.132.252.239:5000";
  const canvasRef = useRef(null);
  const [qrInstance, setQrInstance] = useState(null);

  // QR Size
  const [qrSize, setQrSize] = useState(600);
  const [qrColor, setQrColor] = useState("#000000");
  const [qrHex, setQrHex] = useState("#000000");
  const [qrColorOpen, setQrColorOpen] = useState(false);

  // Border
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderWidth, setBorderWidth] = useState(4);
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderHex, setBorderHex] = useState("#000000");
  const [borderColorOpen, setBorderColorOpen] = useState(false);

  // Padding
  const [paddingEnabled, setPaddingEnabled] = useState(false);
  const [padding, setPadding] = useState(15);
  const [paddingColor, setPaddingColor] = useState("#ffffff");
  const [paddingHex, setPaddingHex] = useState("#ffffff");
  const [paddingColorOpen, setPaddingColorOpen] = useState(false);

  // Corners
  const [cornersEnabled, setCornersEnabled] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(20);

  // Download quality
  const [downloadQuality, setDownloadQuality] = useState("standard");

  // Save/Load designs
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [designName, setDesignName] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [showSavedDesigns, setShowSavedDesigns] = useState(false);

  const company = (customer.company_name || "").trim();
  const customerName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
  const displayName = company || customerName;

  const qrValue = `${API_BASE}/r/${customer.redirect_code}`;

  const extractDomain = (url) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace("www.", "");
    } catch {
      return displayName;
    }
  };

  const bottomText = extractDomain(customer.qr_url);

  // Auto-enable padding with safe defaults when border is enabled
  const handleBorderChange = (checked) => {
    setBorderEnabled(checked);
    if (checked && !paddingEnabled) {
      setPaddingEnabled(true);
      setPadding(15);
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map((x) => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  // Load saved designs on mount
  useEffect(() => {
    if (customer.qr_id) {
      loadSavedDesigns();
    }
  }, [customer.qr_id]);

  const loadSavedDesigns = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/qr/${customer.qr_id}/designs`);
      if (response.ok) {
        const designs = await response.json();
        setSavedDesigns(designs);
      }
    } catch (error) {
      console.error("Error loading designs:", error);
    }
  };

  const saveDesign = async () => {
    if (!designName.trim()) {
      setSaveMessage("Enter a design name");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/qr/${customer.qr_id}/designs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          design_name: designName.trim(),
          qr_size: qrSize,
          qr_color: qrColor,
          border_enabled: borderEnabled,
          border_width: borderWidth,
          border_color: borderColor,
          padding_enabled: paddingEnabled,
          padding: padding,
          padding_color: paddingColor,
          corners_enabled: cornersEnabled,
          corner_radius: cornerRadius,
          download_quality: downloadQuality
        })
      });

      if (response.ok) {
        setSaveMessage("Design saved!");
        setDesignName("");
        loadSavedDesigns();
        setTimeout(() => setSaveMessage(""), 2000);
      } else {
        setSaveMessage("Error saving design");
      }
    } catch (error) {
      setSaveMessage("Error: " + error.message);
    }
  };

  const loadDesign = (design) => {
    setQrSize(design.qr_size || 600);
    setQrColor(design.qr_color || "#000000");
    setQrHex(design.qr_color || "#000000");
    setBorderEnabled(design.border_enabled || false);
    setBorderWidth(design.border_width || 4);
    setBorderColor(design.border_color || "#000000");
    setBorderHex(design.border_color || "#000000");
    setPaddingEnabled(design.padding_enabled || false);
    setPadding(design.padding || 15);
    setPaddingColor(design.padding_color || "#ffffff");
    setPaddingHex(design.padding_color || "#ffffff");
    setCornersEnabled(design.corners_enabled || false);
    setCornerRadius(design.corner_radius || 20);
    setDownloadQuality(design.download_quality || "standard");
    setShowSavedDesigns(false);
  };

  const deleteDesign = async (designId) => {
    if (!window.confirm("Delete this design?")) return;

    try {
      await fetch(`${API_BASE}/api/designs/${designId}`, { method: "DELETE" });
      loadSavedDesigns();
    } catch (error) {
      console.error("Error deleting design:", error);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const qrCanvas = canvasRef.current;
    
    const qualitySettings = {
      web: { scale: 0.5, size: 300 },
      standard: { scale: 1, size: 600 },
      print: { scale: 2, size: 1200 },
      highres: { scale: 4, size: 2400 }
    };
    
    const { scale } = qualitySettings[downloadQuality];
    const supersample = 2;
    
    const qrPx = qrSize * scale * supersample;
    const pad = (borderEnabled && paddingEnabled ? padding : 0) * scale * supersample;
    const border = (borderEnabled ? borderWidth : 0) * scale * supersample;
    const radius = (borderEnabled && cornersEnabled ? cornerRadius : 0) * scale * supersample;

    const finalSuper = qrPx + pad * 2 + border * 2;
    
    const temp = document.createElement("canvas");
    temp.width = finalSuper;
    temp.height = finalSuper;
    const tempCtx = temp.getContext("2d");
    
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';

    tempCtx.fillStyle = borderEnabled && paddingEnabled ? paddingColor : "#ffffff";
    tempCtx.fillRect(0, 0, finalSuper, finalSuper);

    tempCtx.drawImage(qrCanvas, border + pad, border + pad, qrPx, qrPx);

    if (border > 0) {
      tempCtx.strokeStyle = borderColor;
      tempCtx.lineWidth = border;
      tempCtx.beginPath();
      tempCtx.roundRect(border / 2, border / 2, finalSuper - border, finalSuper - border, radius);
      tempCtx.stroke();
    }

    if (radius > 0) {
      tempCtx.globalCompositeOperation = 'destination-in';
      tempCtx.fillStyle = '#000000';
      tempCtx.beginPath();
      tempCtx.roundRect(0, 0, finalSuper, finalSuper, radius);
      tempCtx.fill();
      tempCtx.globalCompositeOperation = 'source-over';
    }

    const final = finalSuper / supersample;
    const out = document.createElement("canvas");
    out.width = final;
    out.height = final;
    const ctx = out.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(temp, 0, 0, finalSuper, finalSuper, 0, 0, final, final);

    const link = document.createElement('a');
    const qrName = customer.label || customer.qr_label || displayName || "QR";
    link.download = `${qrName}_QR.png`;
    link.href = out.toDataURL('image/png');
    link.click();
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const loadQRious = async () => {
      if (window.QRious) {
        const qr = new window.QRious({
          element: canvasRef.current,
          value: qrValue,
          size: qrSize,
          level: 'H',
          foreground: qrColor,
          background: '#ffffff'
        });
        setQrInstance(qr);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
      script.async = true;
      
      script.onload = () => {
        const qr = new window.QRious({
          element: canvasRef.current,
          value: qrValue,
          size: qrSize,
          level: 'H',
          foreground: qrColor,
          background: '#ffffff'
        });
        setQrInstance(qr);
      };

      document.head.appendChild(script);
    };

    loadQRious();
  }, [qrValue, qrSize, qrColor]);

  const ColorPopup = ({ isOpen, onClose, color, onColorChange, hex, onHexChange }) => {
    if (!isOpen) return null;

    const rgb = hexToRgb(hex);

    const handleRgbChange = (component, value) => {
      const newRgb = { ...rgb, [component]: parseInt(value) || 0 };
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      onHexChange(newHex);
      onColorChange(newHex);
    };

    const colorPalette = [
      "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
      "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
      "#808080", "#C0C0C0", "#800000", "#008000", "#000080",
      "#808000", "#FF1493", "#008080", "#FFB6C1", "#90EE90",
      "#FF6347", "#4169E1", "#FFD700", "#32CD32", "#8B4513",
      "#FF69B4", "#00CED1", "#FF4500", "#9370DB", "#20B2AA"
    ];

    return (
      <>
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 10000 }} />
        <div style={{
          position: "absolute", top: "100%", left: 0, marginTop: 5,
          background: "white", border: "1px solid #ccc", borderRadius: 6,
          padding: 15, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 10001, minWidth: 240
        }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: "bold", color: "#333", display: "block", marginBottom: 6 }}>Color Palette</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {colorPalette.map((c) => (
                <div
                  key={c}
                  onClick={() => { onColorChange(c); onHexChange(c); }}
                  style={{
                    width: "100%",
                    height: 32,
                    background: c,
                    border: color === c ? "3px solid #3e53f6" : "1px solid #ddd",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: "bold", color: "#333", display: "block", marginBottom: 6 }}>Custom Color</label>
            <input type="color" value={color} 
              onChange={(e) => { onColorChange(e.target.value); onHexChange(e.target.value); }}
              style={{ width: "100%", height: 50, cursor: "pointer", border: "2px solid #ddd", borderRadius: 6, padding: 2 }} 
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 4 }}>Hex</label>
            <input type="text" value={hex} 
              onChange={(e) => {
                const val = e.target.value;
                onHexChange(val);
                if (/^#[0-9A-F]{6}$/i.test(val)) onColorChange(val);
              }}
              placeholder="#000000"
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 4 }}>RGB</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 2 }}>R</label>
                <input type="number" value={rgb.r} onChange={(e) => handleRgbChange("r", e.target.value)}
                  min="0" max="255"
                  style={{ width: "100%", padding: "6px 4px", border: "1px solid #ccc", borderRadius: 4, fontSize: 12 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 2 }}>G</label>
                <input type="number" value={rgb.g} onChange={(e) => handleRgbChange("g", e.target.value)}
                  min="0" max="255"
                  style={{ width: "100%", padding: "6px 4px", border: "1px solid #ccc", borderRadius: 4, fontSize: 12 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 2 }}>B</label>
                <input type="number" value={rgb.b} onChange={(e) => handleRgbChange("b", e.target.value)}
                  min="0" max="255"
                  style={{ width: "100%", padding: "6px 4px", border: "1px solid #ccc", borderRadius: 4, fontSize: 12 }} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const ControlRow = ({ 
    label, checked, onCheck, value, onChange, 
    color, onColorChange, hex, onHexChange,
    colorOpen, setColorOpen,
    disabled = false, indent = false, showColor = true 
  }) => (
    <div style={{ 
      marginBottom: 8, display: "flex", alignItems: "center", 
      opacity: disabled ? 0.4 : 1, 
      pointerEvents: disabled ? "none" : "auto", position: "relative" 
    }}>
      <div style={{ width: 25, flexShrink: 0 }}>
        {onCheck && (
          <input type="checkbox" checked={checked} onChange={(e) => onCheck(e.target.checked)} disabled={disabled} />
        )}
      </div>
      
      {indent && <div style={{ width: 20, flexShrink: 0 }} />}
      
      <strong style={{ width: indent ? 65 : 85, textAlign: "left", flexShrink: 0 }}>
        {label}
      </strong>
      
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input 
          type="text"
          inputMode="numeric"
          value={value} 
          onChange={(e) => {
            const val = e.target.value;
            if (val === '') {
              onChange(0);
              return;
            }
            const num = parseInt(val, 10);
            if (!isNaN(num) && num >= 0 && num <= 999) {
              onChange(num);
            }
          }}
          style={{ width: 60, padding: "4px", textAlign: "center", border: "1px solid #ccc", borderRadius: 4 }} 
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <button type="button" onClick={() => onChange(Math.min(999, value + 1))}
            style={{ fontSize: 10, padding: "0 4px", lineHeight: "10px", cursor: "pointer", border: "1px solid #ccc", background: "#f5f5f5", userSelect: "none" }}>
            ▲
          </button>
          <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
            style={{ fontSize: 10, padding: "0 4px", lineHeight: "10px", cursor: "pointer", border: "1px solid #ccc", background: "#f5f5f5", userSelect: "none" }}>
            ▼
          </button>
        </div>
        <div style={{ width: 30, flexShrink: 0 }}>
          {showColor && (
            <div onClick={() => setColorOpen(!colorOpen)}
              style={{ width: 30, height: 24, background: color, border: "1px solid #ccc", borderRadius: 4, cursor: "pointer" }} />
          )}
        </div>
        {showColor && (
          <div style={{ position: "relative" }}>
            <ColorPopup isOpen={colorOpen} onClose={() => setColorOpen(false)}
              color={color} onColorChange={onColorChange} hex={hex} onHexChange={onHexChange} />
          </div>
        )}
      </div>
    </div>
  );

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
        width: 420,
        textAlign: "center",
      }}>
        <h2>{customer.label || customer.qr_label || displayName}</h2>

        {/* CONTROLS */}
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
          <div style={{ width: 350 }}>
            <ControlRow 
              label="QR Size" 
              value={qrSize} 
              onChange={setQrSize} 
              color={qrColor} 
              onColorChange={setQrColor} 
              hex={qrHex} 
              onHexChange={setQrHex} 
              colorOpen={qrColorOpen} 
              setColorOpen={setQrColorOpen} 
            />
            <ControlRow 
              label="Border" 
              checked={borderEnabled} 
              onCheck={handleBorderChange} 
              value={borderWidth} 
              onChange={setBorderWidth} 
              color={borderColor} 
              onColorChange={setBorderColor} 
              hex={borderHex} 
              onHexChange={setBorderHex} 
              colorOpen={borderColorOpen} 
              setColorOpen={setBorderColorOpen} 
            />
            <ControlRow 
              label="Padding" 
              checked={paddingEnabled} 
              onCheck={setPaddingEnabled} 
              value={padding} 
              onChange={setPadding} 
              color={paddingColor} 
              onColorChange={setPaddingColor} 
              hex={paddingHex} 
              onHexChange={setPaddingHex} 
              colorOpen={paddingColorOpen} 
              setColorOpen={setPaddingColorOpen} 
              disabled={!borderEnabled} 
              indent={true} 
            />
            <ControlRow 
              label="Corners" 
              checked={cornersEnabled} 
              onCheck={setCornersEnabled} 
              value={cornerRadius} 
              onChange={setCornerRadius} 
              disabled={!borderEnabled} 
              indent={true} 
              showColor={false} 
            />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{
            display: "inline-block",
            background: borderEnabled && paddingEnabled ? paddingColor : "transparent",
            padding: borderEnabled && paddingEnabled ? padding : 0,
            border: borderEnabled ? `${borderWidth}px solid ${borderColor}` : "none",
            borderRadius: borderEnabled && cornersEnabled ? cornerRadius : 0,
            overflow: "hidden"
          }}>
            <canvas
              ref={canvasRef}
              style={{ display: "block", maxWidth: "330px", height: "auto" }}
            />
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
          {bottomText}
        </div>

        {/* Download Quality Selector */}
        <div style={{ marginTop: 20, marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: "#666", marginRight: 8 }}>Download Quality:</label>
          <select 
            value={downloadQuality} 
            onChange={(e) => setDownloadQuality(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 4, border: "1px solid #ccc", fontSize: 13, cursor: "pointer" }}
          >
            <option value="web">Web (300px ~30KB)</option>
            <option value="standard">Standard (600px ~80KB)</option>
            <option value="print">Print (1200px ~180KB)</option>
            <option value="highres">High-Res (2400px ~350KB)</option>
          </select>
        </div>

        {/* SAVE/LOAD DESIGN SECTION */}
        <div style={{ marginTop: 15, padding: 10, background: "#f5f5f5", borderRadius: 6 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Design name..."
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              style={{ flex: 1, padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4 }}
            />
            <button
              onClick={saveDesign}
              style={{
                background: "#28a745",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Save
            </button>
            <button
              onClick={() => setShowSavedDesigns(!showSavedDesigns)}
              style={{
                background: "#3e53f6",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Load ({savedDesigns.length})
            </button>
          </div>
          {saveMessage && <div style={{ fontSize: 12, color: saveMessage.includes("Error") ? "red" : "green" }}>{saveMessage}</div>}
          
          {showSavedDesigns && savedDesigns.length > 0 && (
            <div style={{ marginTop: 10, maxHeight: 150, overflowY: "auto", textAlign: "left" }}>
              {savedDesigns.map(design => (
                <div key={design.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "white", marginBottom: 4, borderRadius: 4, border: "1px solid #ddd" }}>
                  <span style={{ fontSize: 13 }}>{design.design_name}</span>
                  <div>
                    <button onClick={() => loadDesign(design)} style={{ marginRight: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Load</button>
                    <button onClick={() => deleteDesign(design.id)} style={{ padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "red" }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleDownload}
          style={{
            background: "#3e53f6",
            color: "white",
            padding: "10px 20px",
            borderRadius: 6,
            marginTop: 20,
            marginRight: 10,
            cursor: "pointer",
            border: "none",
            fontSize: 14,
          }}
        >
          Download to PNG
        </button>

        <button
          onClick={onClose}
          style={{
            background: "#eee",
            padding: "10px 20px",
            borderRadius: 6,
            cursor: "pointer",
            border: "none",
            fontSize: 14,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
