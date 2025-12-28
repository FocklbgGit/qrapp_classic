import React, { useRef, useEffect, useState } from "react";
import { getAuthHeaders } from "./AuthContext";

export default function QRModal({ customer, onClose }) {
  if (!customer) return null;

  const API_BASE = 'https://oilqr.com';
  const canvasRef = useRef(null);
  const [qrInstance, setQrInstance] = useState(null);

  // DEFAULT VALUES - used for reset
  const DEFAULTS = {
    qrSize: 600,
    qrColor: "#000000",
    borderEnabled: false,
    borderWidth: 4,
    borderColor: "#000000",
    paddingEnabled: false,
    padding: 15,
    paddingColor: "#ffffff",
    cornersEnabled: false,
    cornerRadius: 20,
    downloadQuality: "standard"
  };

  // QR Size
  const [qrSize, setQrSize] = useState(DEFAULTS.qrSize);
  const [qrColor, setQrColor] = useState(DEFAULTS.qrColor);
  const [qrHex, setQrHex] = useState(DEFAULTS.qrColor);
  const [qrColorOpen, setQrColorOpen] = useState(false);

  // Border
  const [borderEnabled, setBorderEnabled] = useState(DEFAULTS.borderEnabled);
  const [borderWidth, setBorderWidth] = useState(DEFAULTS.borderWidth);
  const [borderColor, setBorderColor] = useState(DEFAULTS.borderColor);
  const [borderHex, setBorderHex] = useState(DEFAULTS.borderColor);
  const [borderColorOpen, setBorderColorOpen] = useState(false);

  // Padding
  const [paddingEnabled, setPaddingEnabled] = useState(DEFAULTS.paddingEnabled);
  const [padding, setPadding] = useState(DEFAULTS.padding);
  const [paddingColor, setPaddingColor] = useState(DEFAULTS.paddingColor);
  const [paddingHex, setPaddingHex] = useState(DEFAULTS.paddingColor);
  const [paddingColorOpen, setPaddingColorOpen] = useState(false);

  // Corners
  const [cornersEnabled, setCornersEnabled] = useState(DEFAULTS.cornersEnabled);
  const [cornerRadius, setCornerRadius] = useState(DEFAULTS.cornerRadius);

  // Download quality
  const [downloadQuality, setDownloadQuality] = useState(DEFAULTS.downloadQuality);

  // ========== SAVE/LOAD STATE ==========
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [designName, setDesignName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  // ========== CLEAR/RESET FUNCTION ==========
  const handleClear = () => {
    setQrSize(DEFAULTS.qrSize);
    setQrColor(DEFAULTS.qrColor);
    setQrHex(DEFAULTS.qrColor);
    setBorderEnabled(DEFAULTS.borderEnabled);
    setBorderWidth(DEFAULTS.borderWidth);
    setBorderColor(DEFAULTS.borderColor);
    setBorderHex(DEFAULTS.borderColor);
    setPaddingEnabled(DEFAULTS.paddingEnabled);
    setPadding(DEFAULTS.padding);
    setPaddingColor(DEFAULTS.paddingColor);
    setPaddingHex(DEFAULTS.paddingColor);
    setCornersEnabled(DEFAULTS.cornersEnabled);
    setCornerRadius(DEFAULTS.cornerRadius);
    setDownloadQuality(DEFAULTS.downloadQuality);
    setSaveStatus('✓ Reset to defaults');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // Auto-enable padding with safe defaults when border is enabled
  const handleBorderChange = (checked) => {
    setBorderEnabled(checked);
    if (checked && !paddingEnabled) {
      setPaddingEnabled(true);
      setPadding(15);
    }
  };

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

  // ========== LOAD DESIGNS ON MOUNT ==========
  useEffect(() => {
    if (customer.qr_id) {
      loadDesigns();
    }
  }, [customer.qr_id]);

  // ========== LOAD DESIGNS FROM API ==========
  const loadDesigns = async () => {
    if (!customer.qr_id) return;
    
    setLoadingDesigns(true);
    try {
      const response = await fetch(`${API_BASE}/api/qr/${customer.qr_id}/designs`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const designs = await response.json();
        setSavedDesigns(designs);
      }
    } catch (error) {
      console.error('Error loading designs:', error);
    }
    setLoadingDesigns(false);
  };

  // ========== SAVE CURRENT DESIGN ==========
  const saveDesign = async () => {
    if (!customer.qr_id) {
      setSaveStatus('Error: No QR code ID');
      return;
    }
    
    if (!designName.trim()) {
      setSaveStatus('Please enter a design name');
      return;
    }

    setSaveStatus('Saving...');
    
    try {
      const designData = {
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
      };

      const response = await fetch(`${API_BASE}/api/qr/${customer.qr_id}/designs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(designData)
      });

      if (response.ok) {
        setSaveStatus('✓ Saved!');
        setDesignName('');
        setShowSaveModal(false);
        loadDesigns();
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        setSaveStatus('Error saving design');
      }
    } catch (error) {
      console.error('Error saving design:', error);
      setSaveStatus('Error: ' + error.message);
    }
  };

  // ========== APPLY A SAVED DESIGN ==========
  const applyDesign = (design) => {
    setQrSize(design.qr_size || 600);
    setQrColor(design.qr_color || '#000000');
    setQrHex(design.qr_color || '#000000');
    setBorderEnabled(design.border_enabled || false);
    setBorderWidth(design.border_width || 4);
    setBorderColor(design.border_color || '#000000');
    setBorderHex(design.border_color || '#000000');
    setPaddingEnabled(design.padding_enabled || false);
    setPadding(design.padding || 15);
    setPaddingColor(design.padding_color || '#ffffff');
    setPaddingHex(design.padding_color || '#ffffff');
    setCornersEnabled(design.corners_enabled || false);
    setCornerRadius(design.corner_radius || 20);
    setDownloadQuality(design.download_quality || 'standard');
    setShowLoadModal(false);
    setSaveStatus(`✓ Loaded: ${design.design_name}`);
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // ========== DELETE A SAVED DESIGN ==========
  const deleteDesign = async (designId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Delete this saved design?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/designs/${designId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        loadDesigns();
      }
    } catch (error) {
      console.error('Error deleting design:', error);
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
          position: "fixed", 
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white", 
          border: "1px solid #ccc", 
          borderRadius: 6,
          padding: 15, 
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 10001, 
          width: 280
        }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: "bold", color: "#333", display: "block", marginBottom: 6 }}>Color Palette</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
              {colorPalette.map((c) => (
                <div
                  key={c}
                  onClick={() => { onColorChange(c); onHexChange(c); onClose(); }}
                  style={{
                    width: "100%",
                    height: 36,
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
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 4 }}>RGB</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 2 }}>R</label>
                <input type="number" value={rgb.r} onChange={(e) => handleRgbChange("r", e.target.value)}
                  min="0" max="255"
                  style={{ width: "100%", padding: "6px 4px", border: "1px solid #ccc", borderRadius: 4, fontSize: 12, boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 2 }}>G</label>
                <input type="number" value={rgb.g} onChange={(e) => handleRgbChange("g", e.target.value)}
                  min="0" max="255"
                  style={{ width: "100%", padding: "6px 4px", border: "1px solid #ccc", borderRadius: 4, fontSize: 12, boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 2 }}>B</label>
                <input type="number" value={rgb.b} onChange={(e) => handleRgbChange("b", e.target.value)}
                  min="0" max="255"
                  style={{ width: "100%", padding: "6px 4px", border: "1px solid #ccc", borderRadius: 4, fontSize: 12, boxSizing: "border-box" }} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: "100%", padding: "8px", background: "#eee", border: "none", borderRadius: 4, cursor: "pointer", marginTop: 8 }}
          >
            Done
          </button>
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
      position: "relative" 
    }}>
      <div style={{ width: 25, flexShrink: 0 }}>
        {onCheck && (
          <input type="checkbox" checked={checked} onChange={(e) => onCheck(e.target.checked)} />
        )}
      </div>
      
      {indent && <div style={{ width: 20, flexShrink: 0 }} />}
      
      <strong style={{ width: indent ? 65 : 85, textAlign: "left", flexShrink: 0, opacity: disabled ? 0.4 : 1 }}>
        {label}
      </strong>
      
      <div style={{ 
        display: "flex", gap: 6, alignItems: "center",
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? "none" : "auto"
      }}>
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
          <ColorPopup isOpen={colorOpen} onClose={() => setColorOpen(false)}
            color={color} onColorChange={onColorChange} hex={hex} onHexChange={onHexChange} />
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
      alignItems: "flex-start",
      justifyContent: "center",
      paddingTop: 40,
      zIndex: 9999,
    }}>
      <div style={{
        background: "white",
        padding: 25,
        borderRadius: 10,
        width: 700,
        textAlign: "center",
        maxHeight: "calc(100vh - 80px)",
        overflowY: "auto"
      }}>
        <h2>{customer.label || customer.qr_label || displayName}</h2>

        {/* STATUS MESSAGE */}
        {saveStatus && (
          <div style={{
            padding: "8px 12px",
            marginBottom: 10,
            borderRadius: 4,
            background: saveStatus.includes('Error') ? '#f8d7da' : '#d4edda',
            color: saveStatus.includes('Error') ? '#721c24' : '#155724',
            fontSize: 13
          }}>
            {saveStatus}
          </div>
        )}

        {/* MAIN CONTENT - Two Column Layout */}
        <div style={{ display: "flex", gap: 30, marginTop: 72, marginBottom: 72 }}>
          
          {/* LEFT COLUMN - Controls */}
          <div style={{ width: 280, flexShrink: 0, textAlign: "left" }}>
            
            {/* Save/Load/Clear Buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 15, flexWrap: "wrap" }}>
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={!customer.qr_id}
                style={{
                  background: "#28a745",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "none",
                  cursor: customer.qr_id ? "pointer" : "not-allowed",
                  fontSize: 12,
                  fontWeight: "bold",
                  opacity: customer.qr_id ? 1 : 0.5
                }}
              >
                💾 Save
              </button>
              <button
                onClick={() => { setShowLoadModal(true); loadDesigns(); }}
                disabled={!customer.qr_id}
                style={{
                  background: "#007bff",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "none",
                  cursor: customer.qr_id ? "pointer" : "not-allowed",
                  fontSize: 12,
                  fontWeight: "bold",
                  opacity: customer.qr_id ? 1 : 0.5
                }}
              >
                📂 Load ({savedDesigns.length})
              </button>
              <button
                onClick={handleClear}
                style={{
                  background: "#6c757d",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: "bold"
                }}
              >
                🔄 Clear
              </button>
            </div>

            {/* Controls */}
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

            {/* Download Quality - aligned with controls above */}
            <div style={{ marginTop: 15, paddingLeft: 25 }}>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Download Quality:</label>
              <select 
                value={downloadQuality} 
                onChange={(e) => setDownloadQuality(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: 4, border: "1px solid #ccc", fontSize: 12, cursor: "pointer", width: 205 }}
              >
                <option value="web">Web (300px)</option>
                <option value="standard">Standard (600px)</option>
                <option value="print">Print (1200px)</option>
                <option value="highres">High-Res (2400px)</option>
              </select>
            </div>
          </div>

          {/* RIGHT COLUMN - QR Preview (centered in available space) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              display: "inline-block",
              background: borderEnabled && paddingEnabled ? paddingColor : "#f5f5f5",
              padding: borderEnabled && paddingEnabled ? padding : 8,
              border: borderEnabled ? `${borderWidth}px solid ${borderColor}` : "1px solid #ddd",
              borderRadius: borderEnabled && cornersEnabled ? cornerRadius : 4,
              overflow: "hidden"
            }}>
              <canvas
                ref={canvasRef}
                style={{ display: "block", width: "225px", height: "225px" }}
              />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "#666", textAlign: "center", wordBreak: "break-all", maxWidth: 280 }}>
              {bottomText}
            </div>
            <div style={{ marginTop: 4, fontSize: 11, color: "#999", textAlign: "center" }}>
              Preview (actual: {qrSize}px)
            </div>
          </div>
        </div>

        {/* BOTTOM BUTTONS */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", paddingTop: 15, borderTop: "1px solid #eee" }}>
          <button
            onClick={handleDownload}
            style={{
              background: "#3e53f6",
              color: "white",
              padding: "10px 24px",
              borderRadius: 6,
              cursor: "pointer",
              border: "none",
              fontSize: 14,
              fontWeight: "bold"
            }}
          >
            ⬇ Download PNG
          </button>
          <button
            onClick={onClose}
            style={{
              background: "#eee",
              padding: "10px 24px",
              borderRadius: 6,
              cursor: "pointer",
              border: "none",
              fontSize: 14,
            }}
          >
            Close
          </button>
        </div>

        {/* ========== SAVE MODAL ========== */}
        {showSaveModal && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10002
          }} onClick={() => setShowSaveModal(false)}>
            <div style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: 300,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
            }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>Save Design</h3>
              <input
                type="text"
                placeholder="Design name (e.g., 'Blue Logo')"
                value={designName}
                onChange={e => setDesignName(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: 10,
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: 14,
                  marginBottom: 15,
                  boxSizing: "border-box"
                }}
              />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowSaveModal(false)}
                  style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, background: "white", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveDesign}
                  style={{ padding: "8px 16px", border: "none", borderRadius: 4, background: "#28a745", color: "white", cursor: "pointer", fontWeight: "bold" }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== LOAD MODAL ========== */}
        {showLoadModal && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10002
          }} onClick={() => setShowLoadModal(false)}>
            <div style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: 350,
              maxHeight: "70vh",
              overflowY: "auto",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
            }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>Load Saved Design</h3>
              
              {loadingDesigns ? (
                <p>Loading...</p>
              ) : savedDesigns.length === 0 ? (
                <p style={{ color: "#666" }}>No saved designs yet. Save one first!</p>
              ) : (
                <div style={{ marginBottom: 15 }}>
                  {savedDesigns.map(design => (
                    <div
                      key={design.id}
                      onClick={() => applyDesign(design)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 12,
                        border: "1px solid #eee",
                        borderRadius: 6,
                        marginBottom: 8,
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                      onMouseOver={e => e.currentTarget.style.background = "#f5f5f5"}
                      onMouseOut={e => e.currentTarget.style.background = "white"}
                    >
                      <div style={{ textAlign: "left" }}>
                        <strong>{design.design_name}</strong>
                        <div style={{ fontSize: 11, color: "#888" }}>
                          {design.qr_size}px • {design.qr_color} • {design.download_quality}
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteDesign(design.id, e)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 16,
                          opacity: 0.5
                        }}
                        title="Delete design"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                onClick={() => setShowLoadModal(false)}
                style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, background: "white", cursor: "pointer", width: "100%" }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
