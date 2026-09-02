import React, { useState, useEffect, useRef } from "react";
import {
  Gauge, Waves, ScanSearch, Map as MapIcon, FileText, Rocket,
  Upload, PlayCircle, CheckCircle2, AlertTriangle, Activity,
  Anchor, Target, Download, ChevronRight, X, Cpu, Layers,
  MapPin, Database, BarChart3, ShieldCheck, Cloud, Clock,
  ArrowRight, RadioTower, Crosshair, RotateCw, FolderOpen,
  TrendingUp, CircleDot, Radar
} from "lucide-react";

/* ---------------------------------------------------------------- */
/* Design tokens                                                     */
/* ---------------------------------------------------------------- */
const C = {
  bg: "#060a0f",
  panel: "#0a1119",
  panel2: "#0d1620",
  border: "#152029",
  borderStrong: "#25404c",
  cyan: "#4fd7ef",
  cyanDim: "#2c8ea3",
  cyanFaint: "rgba(79,215,239,0.09)",
  text: "#dbe6ec",
  textDim: "#7d94a1",
  textFaint: "#465862",
  high: "#ff7a5c",
  highBg: "rgba(255,122,92,0.12)",
  medium: "#f2ba4c",
  mediumBg: "rgba(242,186,76,0.12)",
  low: "#43d9a2",
  lowBg: "rgba(67,217,162,0.12)",
  green: "#3ddc84",
};

const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Roboto Mono", monospace';
const sans = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

function sevColor(s) {
  if (s === "High") return C.high;
  if (s === "Medium") return C.medium;
  return C.low;
}
function sevBg(s) {
  if (s === "High") return C.highBg;
  if (s === "Medium") return C.mediumBg;
  return C.lowBg;
}

/* ---------------------------------------------------------------- */
/* Mock data                                                         */
/* ---------------------------------------------------------------- */
const DETECTIONS = [
  {
    id: "d1",
    type: "Ghost Net",
    confidence: 94.7,
    severity: "High",
    lat: 13.0621,
    lng: 80.2947,
    depth: "38.2 m",
    desc: "Large discarded fishing net entangled on the seabed. High entanglement risk to marine fauna; recommended for priority retrieval.",
    bbox: { x: 25, y: 30, w: 17, h: 14 },
    mapPos: { x: 40, y: 36 },
  },
  {
    id: "d2",
    type: "Unidentified Debris",
    confidence: 87.2,
    severity: "Medium",
    lat: 13.0498,
    lng: 80.3105,
    depth: "41.6 m",
    desc: "Irregular acoustic return consistent with a man-made debris cluster. Composition unconfirmed pending visual survey.",
    bbox: { x: 57, y: 50, w: 15, h: 11 },
    mapPos: { x: 62, y: 55 },
  },
  {
    id: "d3",
    type: "Metal Object",
    confidence: 81.5,
    severity: "Medium",
    lat: 13.0367,
    lng: 80.3018,
    depth: "44.0 m",
    desc: "High acoustic reflectivity signature typical of ferrous or metallic material. Possible vessel debris or discarded equipment.",
    bbox: { x: 39, y: 67, w: 11, h: 10 },
    mapPos: { x: 46, y: 72 },
  },
];

const RECENT = [
  { id: "SVY-2026-114", site: "Bay of Bengal — Sector NE-114", date: "02 Sep 2026", detections: 3, status: "Completed" },
  { id: "SVY-2026-109", site: "Palk Strait — Sector PS-07", date: "29 Aug 2026", detections: 1, status: "Completed" },
  { id: "SVY-2026-103", site: "Gulf of Mannar — Sector GM-22", date: "24 Aug 2026", detections: 5, status: "Reviewing" },
  { id: "SVY-2026-098", site: "Bay of Bengal — Sector NE-108", date: "18 Aug 2026", detections: 0, status: "Completed" },
];

const SYSTEM_STATUS = [
  { label: "Sonar feed ingestion", ok: true },
  { label: "Detection engine (CNN, mock)", ok: true },
  { label: "Geolocation sync", ok: true },
  { label: "Report generator", ok: true },
];

const ROADMAP = [
  { icon: Cpu, title: "Real AI inference engine", desc: "Replace mock detection logic with a trained convolutional model served through a live inference pipeline." },
  { icon: Layers, title: "Advanced segmentation", desc: "Pixel-level masks for precise debris boundary delineation, beyond bounding-box detection." },
  { icon: MapPin, title: "GPS / geotag integration", desc: "Automatic geotagging from survey vessel telemetry and towfish positioning data." },
  { icon: Database, title: "Historical survey database", desc: "Persistent storage and retrieval of past surveys for longitudinal seabed monitoring." },
  { icon: FileText, title: "Automated report generation", desc: "Scheduled, templated report pipeline with export to agency-standard formats." },
  { icon: BarChart3, title: "Multi-survey analytics", desc: "Cross-survey trend analysis, debris density heatmaps, and hotspot identification." },
  { icon: ShieldCheck, title: "Authentication & cloud deployment", desc: "Secure multi-user access, role permissions, and scalable cloud infrastructure." },
];

const STAGES = [
  "Preprocessing sonar imagery",
  "Running detection model",
  "Clustering anomaly signatures",
  "Estimating coordinates",
  "Finalizing detection report",
];

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "analysis", label: "Sonar Analysis", icon: Waves },
  { id: "results", label: "Results", icon: ScanSearch },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "roadmap", label: "Roadmap", icon: Rocket },
];

/* ---------------------------------------------------------------- */
/* Small building blocks                                             */
/* ---------------------------------------------------------------- */
function Corner({ pos, color }) {
  const t = 2;
  const base = { position: "absolute", width: 11, height: 11, pointerEvents: "none" };
  const map = {
    tl: { ...base, top: -1, left: -1, borderTop: `${t}px solid ${color}`, borderLeft: `${t}px solid ${color}` },
    tr: { ...base, top: -1, right: -1, borderTop: `${t}px solid ${color}`, borderRight: `${t}px solid ${color}` },
    bl: { ...base, bottom: -1, left: -1, borderBottom: `${t}px solid ${color}`, borderLeft: `${t}px solid ${color}` },
    br: { ...base, bottom: -1, right: -1, borderBottom: `${t}px solid ${color}`, borderRight: `${t}px solid ${color}` },
  };
  return <div style={map[pos]} />;
}

function Frame({ children, style, accent, noPad }) {
  const col = accent || C.borderStrong;
  return (
    <div
      style={{
        position: "relative",
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 3,
        padding: noPad ? 0 : 20,
        ...style,
      }}
    >
      <Corner pos="tl" color={col} />
      <Corner pos="tr" color={col} />
      <Corner pos="bl" color={col} />
      <Corner pos="br" color={col} />
      {children}
    </div>
  );
}

function Eyebrow({ children, color }) {
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 11,
        letterSpacing: "0.08em",
        color: color || C.cyanDim,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function SeverityTag({ severity }) {
  return (
    <span
      style={{
        fontFamily: mono,
        fontSize: 11,
        padding: "3px 8px",
        borderRadius: 2,
        color: sevColor(severity),
        background: sevBg(severity),
        border: `1px solid ${sevColor(severity)}33`,
        whiteSpace: "nowrap",
      }}
    >
      {severity}
    </span>
  );
}

function PrimaryButton({ children, onClick, disabled, icon: Icon, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: sans,
        fontSize: 14,
        fontWeight: 500,
        color: disabled ? C.textFaint : "#04141a",
        background: disabled ? C.panel2 : C.cyan,
        border: `1px solid ${disabled ? C.border : C.cyan}`,
        borderRadius: 3,
        padding: "10px 18px",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 120ms ease",
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, icon: Icon, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: sans,
        fontSize: 13.5,
        fontWeight: 500,
        color: C.text,
        background: "transparent",
        border: `1px solid ${C.borderStrong}`,
        borderRadius: 3,
        padding: "9px 16px",
        cursor: "pointer",
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = C.cyanFaint; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- */
/* Sonar image (procedural mock)                                     */
/* ---------------------------------------------------------------- */
function SonarTexture({ seed = 7 }) {
  return (
    <svg viewBox="0 0 800 500" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id={`noise-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.06" numOctaves={4} seed={seed} result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.09
                    0 0 0 0 0.52
                    0 0 0 0 0.6
                    0 0 0 0.85 0"
          />
        </filter>
        <linearGradient id="depthGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#02060a" />
          <stop offset="100%" stopColor="#081119" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#depthGrad)" />
      <rect width="800" height="500" filter={`url(#noise-${seed})`} opacity="0.55" />
      {/* nadir gap */}
      <rect x="388" y="0" width="24" height="500" fill="#010305" opacity="0.72" />
      {/* subtle scan lines */}
      {Array.from({ length: 50 }).map((_, i) => (
        <line key={i} x1="0" x2="800" y1={i * 10} y2={i * 10} stroke="#000" strokeWidth="0.4" opacity="0.12" />
      ))}
      {/* object returns */}
      <ellipse cx="180" cy="180" rx="70" ry="26" fill="#000" opacity="0.5" transform="rotate(-12 180 180)" />
      <ellipse cx="175" cy="172" rx="55" ry="14" fill="#0e1a1f" opacity="0.65" transform="rotate(-12 175 172)" />
      <ellipse cx="470" cy="280" rx="50" ry="20" fill="#000" opacity="0.45" transform="rotate(8 470 280)" />
      <ellipse cx="330" cy="380" rx="34" ry="16" fill="#000" opacity="0.5" />
      <circle cx="330" cy="376" r="10" fill="#13232a" opacity="0.7" />
    </svg>
  );
}

function SonarViewer({ imageSrc, detections, selectedId, onSelect, scanning, height }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: height || 360,
        overflow: "hidden",
        borderRadius: 2,
        background: "#02060a",
      }}
    >
      {imageSrc === "demo" || !imageSrc ? (
        <SonarTexture />
      ) : (
        <img src={imageSrc} alt="Uploaded sonar scan" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}

      {/* grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(79,215,239,0.05) 0px, rgba(79,215,239,0.05) 1px, transparent 1px, transparent 48px), repeating-linear-gradient(90deg, rgba(79,215,239,0.05) 0px, rgba(79,215,239,0.05) 1px, transparent 1px, transparent 48px)",
          pointerEvents: "none",
        }}
      />

      {/* detections */}
      {detections &&
        detections.map((d) => {
          const active = d.id === selectedId;
          return (
            <div
              key={d.id}
              onClick={() => onSelect && onSelect(d.id)}
              style={{
                position: "absolute",
                left: `${d.bbox.x}%`,
                top: `${d.bbox.y}%`,
                width: `${d.bbox.w}%`,
                height: `${d.bbox.h}%`,
                border: `1.5px solid ${sevColor(d.severity)}`,
                boxShadow: active ? `0 0 0 3px ${sevColor(d.severity)}22` : "none",
                cursor: onSelect ? "pointer" : "default",
                transition: "box-shadow 150ms ease",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -22,
                  left: -1.5,
                  fontFamily: mono,
                  fontSize: 10.5,
                  whiteSpace: "nowrap",
                  color: "#04141a",
                  background: sevColor(d.severity),
                  padding: "2px 6px",
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                {d.type} · {d.confidence}%
              </div>
            </div>
          );
        })}

      {/* scanning sweep */}
      {scanning && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`,
            animation: "scanSweep 1.6s linear infinite",
            boxShadow: `0 0 12px 2px ${C.cyan}`,
          }}
        />
      )}
      <style>{`
        @keyframes scanSweep {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Nautical chart (mock map)                                         */
/* ---------------------------------------------------------------- */
function ChartBackground() {
  return (
    <svg viewBox="0 0 800 500" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="800" height="500" fill="#050a0f" />
      {Array.from({ length: 17 }).map((_, i) => (
        <line key={"v" + i} x1={i * 50} x2={i * 50} y1="0" y2="500" stroke={C.border} strokeWidth="1" />
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <line key={"h" + i} x1="0" x2="800" y1={i * 50} y2={i * 50} stroke={C.border} strokeWidth="1" />
      ))}
      {/* coastline */}
      <path
        d="M 800 0 L 800 500 L 520 500 C 500 430 560 390 540 330 C 520 270 460 250 480 190 C 500 130 470 90 520 40 C 560 5 620 10 650 0 Z"
        fill="#0c1720"
        stroke={C.borderStrong}
        strokeWidth="1.5"
      />
      {/* depth contours */}
      <path d="M 380 40 C 300 120 280 260 350 380 C 400 460 470 470 520 440" fill="none" stroke={C.cyanDim} strokeWidth="1" strokeDasharray="4 4" opacity="0.55" />
      <path d="M 300 20 C 200 130 180 290 270 420 C 330 500 420 500 480 480" fill="none" stroke={C.cyanDim} strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
      <path d="M 220 0 C 100 140 90 320 200 460" fill="none" stroke={C.cyanDim} strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
      <text x="410" y="115" fill={C.textFaint} fontSize="11" fontFamily={mono}>-20m</text>
      <text x="330" y="205" fill={C.textFaint} fontSize="11" fontFamily={mono}>-40m</text>
      <text x="235" y="290" fill={C.textFaint} fontSize="11" fontFamily={mono}>-60m</text>
      {/* survey track */}
      <path d="M 120 90 L 460 90 L 460 430 L 120 430 Z" fill="none" stroke={C.cyan} strokeWidth="1" strokeDasharray="2 5" opacity="0.4" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* Stat tile                                                          */
/* ---------------------------------------------------------------- */
function StatTile({ label, value, icon: Icon, accent }) {
  return (
    <Frame accent={accent}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Eyebrow>{label}</Eyebrow>
        <Icon size={15} color={C.textFaint} />
      </div>
      <div style={{ fontFamily: mono, fontSize: 30, color: C.text, fontWeight: 500, letterSpacing: "-0.01em" }}>
        {value}
      </div>
    </Frame>
  );
}

/* ---------------------------------------------------------------- */
/* Logo                                                                */
/* ---------------------------------------------------------------- */
function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke={C.cyanDim} strokeWidth="1" opacity="0.5" />
      <circle cx="20" cy="20" r="12" stroke={C.cyan} strokeWidth="1.2" opacity="0.8" />
      <circle cx="20" cy="20" r="3.2" fill={C.cyan} />
      <line x1="20" y1="1" x2="20" y2="8" stroke={C.cyanDim} strokeWidth="1.2" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* Pages                                                               */
/* ---------------------------------------------------------------- */
function DashboardPage({ go }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <Logo size={34} />
            <div>
              <div style={{ fontFamily: sans, fontSize: 22, fontWeight: 600, color: C.text, letterSpacing: "-0.01em" }}>
                MarineScan AI
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.cyanDim, letterSpacing: "0.06em" }}>
                SIH 2026 · SEABED ANOMALY DETECTION PROTOTYPE
              </div>
            </div>
          </div>
          <p style={{ fontFamily: sans, fontSize: 14.5, color: C.textDim, lineHeight: 1.65, margin: 0 }}>
            An AI-assisted system for detecting and locating underwater anomalies and marine debris
            from side-scan sonar imagery — surfacing ghost nets, wreckage, and unidentified objects
            for faster review by marine survey teams.
          </p>
        </div>
        <PrimaryButton icon={PlayCircle} onClick={() => go("analysis")}>
          Start Analysis
        </PrimaryButton>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14, marginBottom: 24 }}>
        <StatTile label="SURVEYS CONDUCTED" value="128" icon={Anchor} />
        <StatTile label="ANOMALIES DETECTED" value="342" icon={Target} />
        <StatTile label="HIGH PRIORITY" value="47" icon={AlertTriangle} accent={C.high + "55"} />
        <StatTile label="MODEL ACCURACY" value="96.3%" icon={TrendingUp} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, alignItems: "start" }}>
        <Frame>
          <Eyebrow>RECENT ANALYSES</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.8fr 1fr 0.8fr 1fr", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontFamily: mono, fontSize: 11, color: C.textFaint }}>
              <span>SURVEY ID</span><span>SITE</span><span>DATE</span><span>DET.</span><span>STATUS</span>
            </div>
            {RECENT.map((r) => (
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1.3fr 1.8fr 1fr 0.8fr 1fr", padding: "11px 0", borderBottom: `1px solid ${C.border}`, fontFamily: sans, fontSize: 13, color: C.text, alignItems: "center" }}>
                <span style={{ fontFamily: mono, color: C.cyanDim, fontSize: 12 }}>{r.id}</span>
                <span>{r.site}</span>
                <span style={{ color: C.textDim, fontSize: 12.5 }}>{r.date}</span>
                <span style={{ fontFamily: mono }}>{r.detections}</span>
                <span style={{ fontSize: 12, color: r.status === "Completed" ? C.green : C.medium }}>{r.status}</span>
              </div>
            ))}
          </div>
        </Frame>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Frame>
            <Eyebrow>SYSTEM STATUS</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SYSTEM_STATUS.map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: sans, fontSize: 13, color: C.text }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
                  {s.label}
                  <span style={{ marginLeft: "auto", fontFamily: mono, fontSize: 10.5, color: C.green }}>NOMINAL</span>
                </div>
              ))}
            </div>
          </Frame>

          <Frame>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Eyebrow>PLANNED CAPABILITIES</Eyebrow>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {ROADMAP.slice(0, 3).map((r) => (
                <div key={r.title} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: sans, fontSize: 12.5, color: C.textDim }}>
                  <r.icon size={13} color={C.cyanDim} />
                  {r.title}
                </div>
              ))}
            </div>
            <button
              onClick={() => go("roadmap")}
              style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 5, fontFamily: sans, fontSize: 12.5, color: C.cyan, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              View full roadmap <ChevronRight size={13} />
            </button>
          </Frame>
        </div>
      </div>
    </div>
  );
}

function AnalysisPage({ go, image, setImage, processing, stage, analyzed, runAnalysis, resetAll }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function onFiles(files) {
    const file = files && files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <Eyebrow color={C.textDim}>SONAR ANALYSIS</Eyebrow>
      <h1 style={{ fontFamily: sans, fontSize: 20, fontWeight: 600, color: C.text, margin: "0 0 22px" }}>
        Upload or select a side-scan sonar image
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
        <Frame noPad style={{ padding: 16 }}>
          {!image ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
              onClick={() => inputRef.current && inputRef.current.click()}
              style={{
                height: 360,
                border: `1.5px dashed ${dragOver ? C.cyan : C.borderStrong}`,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer",
                background: dragOver ? C.cyanFaint : "transparent",
                transition: "all 120ms ease",
              }}
            >
              <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />
              <Upload size={26} color={C.textFaint} />
              <div style={{ fontFamily: sans, fontSize: 14, color: C.text }}>
                Drag and drop a sonar image, or click to browse
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.textFaint }}>PNG, JPG — .XTF waterfall exports supported in production</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, width: "70%" }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontFamily: mono, fontSize: 10.5, color: C.textFaint }}>OR</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              <GhostButton icon={FolderOpen} onClick={(e) => { e.stopPropagation(); setImage("demo"); }} style={{ marginTop: 4 }}>
                Use Demo Image
              </GhostButton>
            </div>
          ) : (
            <div>
              <SonarViewer imageSrc={image} scanning={processing} height={360} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <span style={{ fontFamily: mono, fontSize: 11.5, color: C.textDim }}>
                  {image === "demo" ? "DEMO_SONAR_SCAN_001.PNG" : "UPLOADED_IMAGE.PNG"} · 800×500 · SIDE-SCAN
                </span>
                {!processing && (
                  <button
                    onClick={resetAll}
                    style={{ fontFamily: sans, fontSize: 12.5, color: C.textDim, background: "none", border: "none", cursor: "pointer" }}
                  >
                    Replace image
                  </button>
                )}
              </div>
            </div>
          )}
        </Frame>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Frame>
            <Eyebrow>DETECTION PIPELINE</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {STAGES.map((s, i) => {
                const done = analyzed || (processing && i < stage);
                const active = processing && i === stage;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                        border: `1.5px solid ${done ? C.green : active ? C.cyan : C.borderStrong}`,
                        background: done ? C.green : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {active && <RotateCw size={10} color={C.cyan} style={{ animation: "spin 1s linear infinite" }} />}
                    </div>
                    <span style={{ fontFamily: sans, fontSize: 13, color: done ? C.text : active ? C.cyan : C.textFaint }}>{s}</span>
                  </div>
                );
              })}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </Frame>

          {analyzed ? (
            <Frame accent={C.green + "55"}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <CheckCircle2 size={16} color={C.green} />
                <span style={{ fontFamily: sans, fontSize: 13.5, color: C.text, fontWeight: 500 }}>Analysis complete</span>
              </div>
              <p style={{ fontFamily: sans, fontSize: 12.5, color: C.textDim, margin: "0 0 14px", lineHeight: 1.5 }}>
                3 anomalies detected across the scanned area in 2.4s.
              </p>
              <PrimaryButton icon={ArrowRight} onClick={() => go("results")} style={{ width: "100%", justifyContent: "center" }}>
                View Results
              </PrimaryButton>
            </Frame>
          ) : (
            <PrimaryButton
              icon={processing ? RotateCw : Radar}
              disabled={!image || processing}
              onClick={runAnalysis}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {processing ? "Analyzing…" : "Analyze Sonar"}
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsPage({ go, image, selectedId, setSelectedId }) {
  const selected = DETECTIONS.find((d) => d.id === selectedId) || DETECTIONS[0];
  const counts = { High: 0, Medium: 0, Low: 0 };
  DETECTIONS.forEach((d) => counts[d.severity]++);

  return (
    <div>
      <Eyebrow color={C.textDim}>SONAR ANALYSIS / RESULTS</Eyebrow>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <h1 style={{ fontFamily: sans, fontSize: 20, fontWeight: 600, color: C.text, margin: 0 }}>
          Survey SVY-2026-114 — detection results
        </h1>
        <span style={{ fontFamily: mono, fontSize: 11.5, color: C.textDim }}>
          Bay of Bengal · Sector NE-114 · 02 Sep 2026
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, alignItems: "start" }}>
        <Frame noPad style={{ padding: 14 }}>
          <SonarViewer imageSrc={image || "demo"} detections={DETECTIONS} selectedId={selected.id} onSelect={setSelectedId} height={400} />
        </Frame>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Frame>
            <Eyebrow>DETECTIONS ({DETECTIONS.length})</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DETECTIONS.map((d) => {
                const active = d.id === selected.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    style={{
                      cursor: "pointer",
                      padding: "10px 12px",
                      borderRadius: 2,
                      border: `1px solid ${active ? sevColor(d.severity) + "77" : C.border}`,
                      background: active ? sevBg(d.severity) : "transparent",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontFamily: sans, fontSize: 13.5, color: C.text, fontWeight: 500 }}>{d.type}</span>
                      <SeverityTag severity={d.severity} />
                    </div>
                    <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
                      <div style={{ height: "100%", width: `${d.confidence}%`, background: sevColor(d.severity) }} />
                    </div>
                    <div style={{ fontFamily: mono, fontSize: 11, color: C.textDim }}>{d.confidence}% confidence</div>
                  </div>
                );
              })}
            </div>
          </Frame>

          <Frame>
            <Eyebrow>SELECTED DETECTION</Eyebrow>
            <div style={{ fontFamily: sans, fontSize: 14, color: C.text, fontWeight: 600, marginBottom: 8 }}>{selected.type}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <Field label="CONFIDENCE" value={`${selected.confidence}%`} />
              <Field label="SEVERITY" value={selected.severity} color={sevColor(selected.severity)} />
              <Field label="COORDINATES" value={`${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`} />
              <Field label="DEPTH" value={selected.depth} />
            </div>
            <p style={{ fontFamily: sans, fontSize: 12.5, color: C.textDim, lineHeight: 1.55, margin: 0 }}>{selected.desc}</p>
          </Frame>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Frame>
          <Eyebrow>DETECTION SUMMARY</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            <SummaryStat label="Total" value={DETECTIONS.length} />
            <SummaryStat label="High" value={counts.High} color={C.high} />
            <SummaryStat label="Medium" value={counts.Medium} color={C.medium} />
            <SummaryStat label="Area scanned" value="1.4 km²" />
            <SummaryStat label="Processing time" value="2.4s" />
          </div>
        </Frame>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <GhostButton icon={MapIcon} onClick={() => go("map")} style={{ flex: 1, justifyContent: "center" }}>
            View on Map
          </GhostButton>
          <PrimaryButton icon={FileText} onClick={() => go("reports")} style={{ flex: 1, justifyContent: "center" }}>
            Generate Report
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, color }) {
  return (
    <div>
      <div style={{ fontFamily: mono, fontSize: 10, color: C.textFaint, letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: mono, fontSize: 13, color: color || C.text }}>{value}</div>
    </div>
  );
}

function SummaryStat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontFamily: mono, fontSize: 22, color: color || C.text, fontWeight: 500 }}>{value}</div>
      <div style={{ fontFamily: sans, fontSize: 11.5, color: C.textDim, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function MapPage() {
  const [selectedId, setSelectedId] = useState(DETECTIONS[0].id);
  const selected = DETECTIONS.find((d) => d.id === selectedId);

  return (
    <div>
      <Eyebrow color={C.textDim}>MAP</Eyebrow>
      <h1 style={{ fontFamily: sans, fontSize: 20, fontWeight: 600, color: C.text, margin: "0 0 20px" }}>
        Survey area — detection locations
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16, alignItems: "start" }}>
        <Frame noPad style={{ padding: 12 }}>
          <div style={{ position: "relative", width: "100%", height: 440, borderRadius: 2, overflow: "hidden" }}>
            <ChartBackground />
            {DETECTIONS.map((d) => {
              const active = d.id === selectedId;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  style={{
                    position: "absolute",
                    left: `${d.mapPos.x}%`,
                    top: `${d.mapPos.y}%`,
                    transform: "translate(-50%,-50%)",
                    cursor: "pointer",
                  }}
                >
                  {d.severity === "High" && (
                    <span
                      style={{
                        position: "absolute", inset: -10, borderRadius: "50%",
                        border: `1.5px solid ${sevColor(d.severity)}`, opacity: 0.5,
                        animation: "pulseRing 2s ease-out infinite",
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: active ? 16 : 12, height: active ? 16 : 12, borderRadius: "50%",
                      background: sevColor(d.severity), border: `2px solid ${C.bg}`,
                      boxShadow: `0 0 8px ${sevColor(d.severity)}aa`,
                    }}
                  />
                </div>
              );
            })}
            <style>{`
              @keyframes pulseRing {
                0% { transform: scale(0.6); opacity: 0.6; }
                100% { transform: scale(1.6); opacity: 0; }
              }
            `}</style>
            <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", gap: 14, fontFamily: mono, fontSize: 10.5, color: C.textDim, background: "rgba(6,10,15,0.7)", padding: "6px 10px", borderRadius: 2 }}>
              <LegendDot color={C.high} label="High" />
              <LegendDot color={C.medium} label="Medium" />
              <LegendDot color={C.low} label="Low" />
            </div>
          </div>
        </Frame>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Frame>
            <Eyebrow>DETECTIONS</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DETECTIONS.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "9px 11px", borderRadius: 2, cursor: "pointer",
                    border: `1px solid ${d.id === selectedId ? sevColor(d.severity) + "77" : C.border}`,
                    background: d.id === selectedId ? sevBg(d.severity) : "transparent",
                  }}
                >
                  <span style={{ fontFamily: sans, fontSize: 13, color: C.text }}>{d.type}</span>
                  <SeverityTag severity={d.severity} />
                </div>
              ))}
            </div>
          </Frame>

          {selected && (
            <Frame accent={sevColor(selected.severity) + "55"}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Crosshair size={15} color={sevColor(selected.severity)} />
                <span style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.text }}>{selected.type}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <Field label="CONFIDENCE" value={`${selected.confidence}%`} />
                <Field label="SEVERITY" value={selected.severity} color={sevColor(selected.severity)} />
                <Field label="LATITUDE" value={selected.lat.toFixed(4)} />
                <Field label="LONGITUDE" value={selected.lng.toFixed(4)} />
              </div>
              <p style={{ fontFamily: sans, fontSize: 12.5, color: C.textDim, lineHeight: 1.5, margin: 0 }}>{selected.desc}</p>
            </Frame>
          )}
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {label}
    </span>
  );
}

function ReportsPage() {
  function download() {
    const lines = [
      "MARINESCAN AI — ANOMALY DETECTION REPORT",
      "==========================================",
      "Survey ID: SVY-2026-114",
      "Site: Bay of Bengal — Sector NE-114",
      "Date: 02 Sep 2026",
      "Generated by: MarineScan AI (auto-generated, prototype)",
      "",
      "DETECTIONS",
      "----------",
      ...DETECTIONS.map(
        (d, i) =>
          `${i + 1}. ${d.type}\n   Confidence: ${d.confidence}%\n   Severity: ${d.severity}\n   Coordinates: ${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}\n   Depth: ${d.depth}\n   Notes: ${d.desc}\n`
      ),
      "SUMMARY",
      "-------",
      `Total detections: ${DETECTIONS.length}`,
      `High priority: ${DETECTIONS.filter((d) => d.severity === "High").length}`,
      `Medium priority: ${DETECTIONS.filter((d) => d.severity === "Medium").length}`,
      "Area scanned: 1.4 km²",
      "",
      "RECOMMENDATION",
      "--------------",
      "Prioritize retrieval of the Ghost Net detection (94.7% confidence, High severity)",
      "due to entanglement risk to marine life. Schedule visual ROV confirmation for",
      "remaining medium-severity detections.",
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "MarineScanAI_Report_SVY-2026-114.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const counts = { High: 0, Medium: 0, Low: 0 };
  DETECTIONS.forEach((d) => counts[d.severity]++);
  const total = DETECTIONS.length;

  return (
    <div>
      <Eyebrow color={C.textDim}>REPORTS</Eyebrow>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <h1 style={{ fontFamily: sans, fontSize: 20, fontWeight: 600, color: C.text, margin: 0 }}>
          Anomaly detection report
        </h1>
        <PrimaryButton icon={Download} onClick={download}>Download Report (.txt)</PrimaryButton>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "start" }}>
        <Frame>
          <Eyebrow>SURVEY DETAILS</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <Field label="SURVEY ID" value="SVY-2026-114" />
            <Field label="SITE" value="Bay of Bengal, NE-114" />
            <Field label="DATE" value="02 Sep 2026" />
            <Field label="OPERATOR" value="AI Auto-Generated" />
            <Field label="AREA SCANNED" value="1.4 km²" />
            <Field label="MODEL VERSION" value="mock-v0.1" />
          </div>

          <Eyebrow>DETECTIONS</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1.4fr 1fr", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontFamily: mono, fontSize: 10.5, color: C.textFaint }}>
            <span>TYPE</span><span>CONFIDENCE</span><span>COORDINATES</span><span>SEVERITY</span>
          </div>
          {DETECTIONS.map((d) => (
            <div key={d.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1.4fr 1fr", padding: "10px 0", borderBottom: `1px solid ${C.border}`, alignItems: "center", fontFamily: sans, fontSize: 13, color: C.text }}>
              <span>{d.type}</span>
              <span style={{ fontFamily: mono }}>{d.confidence}%</span>
              <span style={{ fontFamily: mono, fontSize: 11.5, color: C.textDim }}>{d.lat.toFixed(3)}, {d.lng.toFixed(3)}</span>
              <SeverityTag severity={d.severity} />
            </div>
          ))}

          <div style={{ marginTop: 18 }}>
            <Eyebrow>RECOMMENDATION</Eyebrow>
            <p style={{ fontFamily: sans, fontSize: 13, color: C.textDim, lineHeight: 1.6, margin: 0 }}>
              Prioritize retrieval of the Ghost Net detection due to its high entanglement risk to
              marine life. Schedule ROV visual confirmation for the remaining medium-severity
              detections before the next survey cycle.
            </p>
          </div>
        </Frame>

        <Frame>
          <Eyebrow>SEVERITY BREAKDOWN</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "High", value: counts.High, color: C.high },
              { label: "Medium", value: counts.Medium, color: C.medium },
              { label: "Low", value: counts.Low, color: C.low },
            ].map((row) => (
              <div key={row.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: sans, fontSize: 12.5, color: C.text, marginBottom: 4 }}>
                  <span>{row.label}</span>
                  <span style={{ fontFamily: mono, color: C.textDim }}>{row.value}/{total}</span>
                </div>
                <div style={{ height: 6, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(row.value / total) * 100}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </Frame>
      </div>
    </div>
  );
}

function RoadmapPage() {
  return (
    <div>
      <Eyebrow color={C.textDim}>ROADMAP</Eyebrow>
      <h1 style={{ fontFamily: sans, fontSize: 20, fontWeight: 600, color: C.text, margin: "0 0 6px" }}>
        Planned capabilities
      </h1>
      <p style={{ fontFamily: sans, fontSize: 13.5, color: C.textDim, margin: "0 0 24px" }}>
        This build is a frontend prototype using mock data. The items below are planned for the
        production system and are not yet implemented.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14 }}>
        {ROADMAP.map((r) => (
          <Frame key={r.title}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 4, background: C.cyanFaint, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <r.icon size={17} color={C.cyan} />
              </div>
              <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.06em", color: C.textFaint, border: `1px solid ${C.border}`, padding: "3px 7px", borderRadius: 2 }}>
                PLANNED
              </span>
            </div>
            <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 6 }}>{r.title}</div>
            <div style={{ fontFamily: sans, fontSize: 12.5, color: C.textDim, lineHeight: 1.55 }}>{r.desc}</div>
          </Frame>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* App shell                                                           */
/* ---------------------------------------------------------------- */
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState(0);
  const [analyzed, setAnalyzed] = useState(false);
  const [selectedId, setSelectedId] = useState(DETECTIONS[0].id);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function go(p) { setPage(p); }

  function resetAll() {
    setImage(null);
    setAnalyzed(false);
    setProcessing(false);
    setStage(0);
  }

  function runAnalysis() {
    setProcessing(true);
    setAnalyzed(false);
    setStage(0);
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      if (i >= STAGES.length) {
        clearInterval(iv);
        setProcessing(false);
        setAnalyzed(true);
      } else {
        setStage(i);
      }
    }, 480);
  }

  const pageTitleMap = {
    dashboard: "Dashboard", analysis: "Sonar Analysis", results: "Results",
    map: "Map", reports: "Reports", roadmap: "Roadmap",
  };

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", background: C.bg, fontFamily: sans, color: C.text }}>
      {/* sidebar */}
      <div style={{ width: 210, flexShrink: 0, borderRight: `1px solid ${C.border}`, background: C.panel, display: "flex", flexDirection: "column", padding: "18px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 8px 20px" }}>
          <Logo size={22} />
          <span style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.text }}>MarineScan AI</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV.map((n) => {
            const active = page === n.id;
            return (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "9px 10px", borderRadius: 3, border: "none", cursor: "pointer",
                  background: active ? C.cyanFaint : "transparent",
                  borderLeft: active ? `2px solid ${C.cyan}` : "2px solid transparent",
                  fontFamily: sans, fontSize: 13.5, fontWeight: active ? 500 : 400,
                  color: active ? C.cyan : C.textDim, textAlign: "left",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = C.text; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = C.textDim; }}
              >
                <n.icon size={16} />
                {n.label}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: "auto", padding: "10px 8px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 5px ${C.green}` }} />
          <span style={{ fontFamily: mono, fontSize: 10.5, color: C.textFaint }}>SYSTEM ONLINE</span>
        </div>
      </div>

      {/* main */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 46, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: mono, fontSize: 11.5, color: C.textDim }}>
            <RadioTower size={13} color={C.cyanDim} />
            MARINESCAN AI / {pageTitleMap[page].toUpperCase()}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: mono, fontSize: 11, color: C.textFaint }}>
            <span>SONAR FEED ACTIVE</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Clock size={12} />
              {time.toLocaleTimeString("en-GB", { hour12: false })} UTC
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
          {page === "dashboard" && <DashboardPage go={go} />}
          {page === "analysis" && (
            <AnalysisPage
              go={go}
              image={image}
              setImage={setImage}
              processing={processing}
              stage={stage}
              analyzed={analyzed}
              runAnalysis={runAnalysis}
              resetAll={resetAll}
            />
          )}
          {page === "results" && (
            <ResultsPage go={go} image={image} selectedId={selectedId} setSelectedId={setSelectedId} />
          )}
          {page === "map" && <MapPage />}
          {page === "reports" && <ReportsPage />}
          {page === "roadmap" && <RoadmapPage />}
        </div>
      </div>
    </div>
  );
}
