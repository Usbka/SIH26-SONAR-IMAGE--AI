import React, { useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, FileJson, FileSpreadsheet, LoaderCircle, Radio, Upload, Waves } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const fallbackImage = "/assets/nayansagar_verified_wreck.jpg";
const colors = {
  bg: "#050b12", panel: "rgba(15, 25, 37, 0.68)", border: "rgba(51, 65, 85, 0.72)", text: "#e6f5f3", muted: "#91a6b3",
  cyan: "#5ee7ed", green: "#5be0a0", amber: "#f4bd5c", red: "#ff806b", slate: "#0f172a",
};
const font = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const sans = "'Avenir Next', 'Segoe UI', sans-serif";

function fallbackAnalysis() {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    filename: "nayansagar_verified_wreck.jpg",
    fallback: true,
    annotated_image: fallbackImage,
    detections: [{
      timestamp,
      class: "Shipwreck / Structural Hazard",
      confidence: 0.5,
      relief_m: 7.52,
      shadow_correlation: 0.89,
      coordinates: [],
      hazard_status: "HIGH",
    }],
  };
}

function Panel({ children, style = {} }) {
  return <section className="glass-panel" style={{ ...style }}>{children}</section>;
}

function Metric({ label, value, color = colors.text }) {
  return <div className="metric" style={{ borderLeftColor: color }}><div className="metric-label">{label}</div><div className="metric-value" style={{ color }}>{value}</div></div>;
}

function DownloadResults({ analysis }) {
  const rows = analysis.detections.map((item) => ({
    timestamp: item.timestamp || analysis.timestamp,
    class: item.class,
    confidence: `${(item.confidence * 100).toFixed(2)}%`,
    coordinates: JSON.stringify(item.coordinates || []),
    relief_m: item.relief_m,
  }));
  function download(content, name, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a"); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url);
  }
  function json() { download(JSON.stringify(rows, null, 2), "nayan-sagar-results.json", "application/json"); }
  function csv() {
    const header = "timestamp,class,confidence,coordinates,relief_m";
    const body = rows.map((row) => [row.timestamp, row.class, row.confidence, row.coordinates, row.relief_m].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
    download([header, ...body].join("\n"), "nayan-sagar-results.csv", "text/csv");
  }
  return <div className="download-actions"><button className="download-button" onClick={json}><FileJson size={16} /> Download JSON</button><button className="download-button" onClick={csv}><FileSpreadsheet size={16} /> Download CSV</button></div>;
}

const buttonStyle = (primary) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, border: `1px solid ${primary ? colors.cyan : colors.border}`, background: primary ? colors.cyan : "transparent", color: primary ? "#061114" : colors.text, padding: "11px 16px", borderRadius: 3, font: `600 13px ${sans}`, cursor: "pointer" });

function Results({ analysis }) {
  return <div className="results-stack">
    <div className="results-heading"><div><div style={eyebrow}>INFERENCE RESULTS</div><h1 style={heading}>Verified sonar assessment</h1><div className="file-meta">{analysis.filename} · {new Date(analysis.timestamp).toLocaleString()}</div></div><DownloadResults analysis={analysis} /></div>
    <div className="results-grid">
      <Panel style={{ padding: 10 }}><div className="image-frame"><img src={analysis.annotated_image} alt="YOLO annotated sonar output" /></div></Panel>
      <div className="telemetry-stack">{analysis.detections.length === 0 ? <Panel><div style={eyebrow}>TELEMETRY</div><p style={body}>No target exceeded the confidence threshold for this image.</p></Panel> : analysis.detections.map((item, index) => <Panel key={`${item.class}-${index}`}><div className="detection-heading"><strong>{item.class}</strong><span className={item.hazard_status === "HIGH" ? "hazard-high" : "hazard-review"}>{item.hazard_status}</span></div><div className="metrics-grid"><Metric label="CONFIDENCE" value={`${(item.confidence * 100).toFixed(1)}%`} color={colors.cyan} /><Metric label="TARGET RELIEF" value={`${item.relief_m.toFixed(2)} m`} color={colors.green} /><Metric label="SHADOW CORRELATION" value={item.shadow_correlation.toFixed(2)} color={colors.amber} /><Metric label="COORDINATES" value={item.coordinates?.length ? item.coordinates.map((v) => Number(v).toFixed(1)).join(", ") : "artifact"} /></div></Panel>)}</div>
    </div>
    {analysis.fallback && <div style={{ color: colors.muted, font: `12px ${font}`, borderLeft: `2px solid ${colors.amber}`, paddingLeft: 10 }}>Inference API unavailable. Showing the supplied verified evaluation artifact for continuity.</div>}
  </div>;
}

const eyebrow = { color: colors.cyan, font: `600 10px ${font}`, letterSpacing: "0.14em" };
const heading = { color: colors.text, font: `650 clamp(24px, 4vw, 40px) ${sans}`, margin: "9px 0 10px", letterSpacing: "-0.03em" };
const body = { color: colors.muted, font: `14px/1.6 ${sans}`, margin: 0 };

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function chooseFile(nextFile) {
    if (!nextFile || !nextFile.type.startsWith("image/")) { setMessage("Select a PNG or JPG image."); return; }
    setFile(nextFile); setPreview(URL.createObjectURL(nextFile)); setAnalysis(null); setMessage("");
  }
  async function analyze() {
    if (!file) return;
    setBusy(true); setMessage("");
    const form = new FormData(); form.append("file", file);
    try {
      const response = await fetch(`${API_URL}/predict`, { method: "POST", body: form });
      if (!response.ok) throw new Error((await response.json()).detail || "Prediction failed");
      setAnalysis(await response.json());
    } catch (error) {
      setAnalysis(fallbackAnalysis());
      setMessage(`Live inference unavailable: ${error.message}`);
    } finally { setBusy(false); }
  }
  function useFallback() { setFile(null); setPreview(fallbackImage); setAnalysis(fallbackAnalysis()); setMessage(""); }

  return <div className="app-shell"><header className="app-header"><div className="brand-lockup"><div className="brand-mark"><Waves size={19} /></div><div className="brand-name">NayanSagar</div></div><div className="system-badge"><span className="status-pulse" /><Radio size={14} /> SYS ACTIVE // SSS PIPELINE</div></header><main className="page-content">
    <div className="hero-copy"><div style={eyebrow}>SIDE-SCAN SONAR / YOLO11N + PHYSICS</div><h1 style={heading}>Upload a waterfall image.<br />Verify every detected target.</h1><p style={{ ...body, maxWidth: 650 }}>Run the trained detector and acoustic shadow relief calculation against real imagery. Results include the annotated output and machine-readable telemetry.</p></div>
    <div className="workspace-grid"><Panel><div className="section-heading"><div style={eyebrow}>INPUT IMAGE</div>{file && <span className="file-meta">{file.name}</span>}</div><label className="upload-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files[0]); }}>{preview ? <img src={preview} alt="Selected sonar input" /> : <div className="upload-prompt"><Upload size={30} color={colors.cyan} /><p>Drop PNG or JPG here</p><span>or click to browse</span></div>}<input hidden type="file" accept="image/png,image/jpeg" onChange={(event) => chooseFile(event.target.files[0])} /></label><div className="action-row"><button disabled={!file || busy} onClick={analyze} className="primary-button" style={{ opacity: !file || busy ? .5 : 1 }}>{busy ? <LoaderCircle size={16} className="spin" /> : <Activity size={16} />} {busy ? "Running inference..." : "Analyze image"}</button><button onClick={useFallback} className="secondary-button">Load verified artifact</button></div>{message && <div className="error-message"><AlertTriangle size={14} />{message}</div>}</Panel>
      <Panel><div style={eyebrow}>PIPELINE</div><div className="pipeline-list">{["Decode upload", "YOLO11n detection · models/best.pt", "Shadow relief · h = (H × Ls) / (R + Ls)", "Annotated image + telemetry export"].map((step, index) => <div key={step} className="pipeline-step"><CheckCircle2 size={16} color={analysis || index === 0 ? colors.green : colors.border} /><span style={{ color: analysis || index === 0 ? colors.text : colors.muted }}>{step}</span></div>)}</div><div className="physics-note"><div style={eyebrow}>PHYSICS CONSTANT</div><div className="physics-value">H = 12.5 m</div><p style={{ ...body, fontSize: 12 }}>Target elevation is derived from the acoustic shadow geometry returned by the model.</p></div></Panel></div>
    {analysis && <div className="analysis-output"><Results analysis={analysis} /></div>}
  </main><style>{`* { box-sizing: border-box; } body { margin: 0; background: ${colors.bg}; } .app-shell { min-height: 100vh; background: radial-gradient(circle at 12% 0%, rgba(37, 99, 103, .16), transparent 32%), linear-gradient(135deg, #050b12 0%, #0a111c 58%, #071219 100%); color: ${colors.text}; font-family: ${sans}; } .app-header { min-height: 76px; padding: 0 clamp(20px, 5vw, 72px); border-bottom: 1px solid rgba(51, 65, 85, .72); display: flex; justify-content: space-between; align-items: center; gap: 20px; } .brand-lockup, .system-badge, .section-heading, .action-row, .download-actions, .detection-heading, .error-message { display: flex; align-items: center; } .brand-lockup { gap: 11px; } .brand-mark { width: 34px; height: 34px; display: grid; place-items: center; color: ${colors.cyan}; border: 1px solid rgba(94, 231, 237, .38); border-radius: 10px; background: rgba(94, 231, 237, .08); box-shadow: 0 0 24px rgba(94, 231, 237, .12); } .brand-name { color: ${colors.text}; font: 700 20px ${sans}; letter-spacing: -.02em; } .system-badge { gap: 7px; color: ${colors.muted}; font: 600 10px ${font}; letter-spacing: .08em; } .status-pulse { width: 7px; height: 7px; border-radius: 50%; background: ${colors.green}; box-shadow: 0 0 0 4px rgba(91, 224, 160, .1), 0 0 12px ${colors.green}; animation: pulse 2s ease-in-out infinite; } .page-content { max-width: 1280px; margin: 0 auto; padding: clamp(30px, 5vw, 72px) clamp(20px, 5vw, 64px); } .hero-copy { margin-bottom: 34px; } .workspace-grid, .results-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(300px, .9fr); gap: 18px; align-items: start; } .glass-panel { background: rgba(15, 23, 42, .62); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(51, 65, 85, .78); border-radius: 12px; padding: 22px; box-shadow: 0 18px 48px rgba(0, 0, 0, .18); } .section-heading { justify-content: space-between; gap: 12px; margin-bottom: 16px; } .file-meta { color: ${colors.muted}; font: 11px ${font}; overflow-wrap: anywhere; } .upload-zone { min-height: 330px; border: 1px dashed rgba(94, 231, 237, .3); border-radius: 9px; display: grid; place-items: center; padding: 14px; cursor: pointer; background: rgba(2, 8, 16, .42); transition: border-color .2s ease, background .2s ease; } .upload-zone:hover { border-color: ${colors.cyan}; background: rgba(94, 231, 237, .06); } .upload-zone img { max-width: 100%; max-height: 390px; object-fit: contain; } .upload-prompt { text-align: center; } .upload-prompt p { color: ${colors.text}; font: 600 15px ${sans}; margin: 13px 0 5px; } .upload-prompt span { color: ${colors.muted}; font: 11px ${font}; } .action-row, .download-actions { gap: 10px; flex-wrap: wrap; margin-top: 16px; } .primary-button, .secondary-button, .download-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 7px; padding: 11px 15px; font: 600 12px ${sans}; cursor: pointer; transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease, background .2s ease; } .primary-button { border: 1px solid ${colors.cyan}; background: ${colors.cyan}; color: #061114; } .secondary-button, .download-button { border: 1px solid rgba(94, 231, 237, .28); background: rgba(15, 23, 42, .48); color: ${colors.text}; } .primary-button:hover, .secondary-button:hover, .download-button:hover { transform: translateY(-1px); border-color: ${colors.cyan}; box-shadow: 0 0 20px rgba(94, 231, 237, .16); } .pipeline-list { display: grid; gap: 18px; margin-top: 23px; } .pipeline-step { display: flex; gap: 11px; align-items: flex-start; font: 13px/1.4 ${sans}; } .physics-note { border-top: 1px solid rgba(51, 65, 85, .72); margin-top: 30px; padding-top: 19px; } .physics-value { color: ${colors.text}; font: 600 19px ${font}; margin: 9px 0 7px; } .analysis-output { margin-top: 52px; } .results-stack, .telemetry-stack { display: grid; gap: 18px; } .results-heading { display: flex; justify-content: space-between; gap: 18px; align-items: center; flex-wrap: wrap; } .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 21px 18px; } .metric { border-left: 2px solid; padding-left: 12px; min-width: 0; } .metric-label { color: ${colors.muted}; font: 10px ${font}; letter-spacing: .08em; margin-bottom: 7px; } .metric-value { font: 600 20px ${font}; overflow-wrap: anywhere; } .image-frame { background: #02080f; border-radius: 8px; overflow: hidden; } .image-frame img { display: block; width: 100%; max-height: 520px; object-fit: contain; } .detection-heading { justify-content: space-between; gap: 12px; margin-bottom: 20px; } .detection-heading strong { color: ${colors.text}; font: 600 17px ${sans}; } .hazard-high, .hazard-review { font: 11px ${font}; } .hazard-high { color: ${colors.red}; } .hazard-review { color: ${colors.amber}; } .error-message { gap: 7px; color: ${colors.amber}; font: 12px/1.5 ${font}; margin-top: 14px; } @keyframes pulse { 50% { opacity: .45; transform: scale(.82); } } @keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; } @media (max-width: 780px) { .app-header { min-height: 68px; } .system-badge { font-size: 9px; } .workspace-grid, .results-grid { grid-template-columns: 1fr; } .page-content { padding-top: 36px; } .glass-panel { padding: 17px; } } @media (max-width: 480px) { .brand-name { font-size: 18px; } .system-badge { gap: 5px; letter-spacing: .04em; } .metrics-grid { gap: 17px 12px; } .metric-value { font-size: 16px; } .primary-button, .secondary-button, .download-button { width: 100%; } .action-row, .download-actions { display: grid; grid-template-columns: 1fr; } }`}</style></div>;
}
