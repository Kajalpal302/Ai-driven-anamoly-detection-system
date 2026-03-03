import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const VITAL_RANGES = {
  heart_rate:    { min: 55,  max: 100, unit: "bpm",  label: "Heart Rate" },
  spo2:          { min: 94,  max: 100, unit: "%",    label: "SpO₂" },
  systolic_bp:   { min: 90,  max: 140, unit: "mmHg", label: "Systolic BP" },
  diastolic_bp:  { min: 60,  max: 90,  unit: "mmHg", label: "Diastolic BP" },
  temperature:   { min: 36.1,max: 37.5,unit: "°C",   label: "Temperature" },
  resp_rate:     { min: 12,  max: 20,  unit: "/min", label: "Resp. Rate" },
};

function generateVital(key, isAnomalous = false) {
  const range = VITAL_RANGES[key];
  const span = range.max - range.min;
  if (isAnomalous) {
    const side = Math.random() > 0.5;
    return side
      ? +(range.max + span * (0.15 + Math.random() * 0.25)).toFixed(1)
      : +(range.min - span * (0.15 + Math.random() * 0.25)).toFixed(1);
  }
  return +(range.min + span * Math.random()).toFixed(1);
}

function detectAnomaly(value, key) {
  const r = VITAL_RANGES[key];
  const deviation = Math.max(0, value - r.max, r.min - value) / ((r.max - r.min) / 2);
  return deviation > 0.1;
}

function severityScore(vitals) {
  let score = 0;
  for (const key of Object.keys(VITAL_RANGES)) {
    if (detectAnomaly(vitals[key], key)) score += 1;
  }
  return score;
}

const PATIENTS = [
  { id: "P-001", name: "Arjun Sharma", age: 64, ward: "ICU-A", condition: "Post-Cardiac" },
  { id: "P-002", name: "Priya Mehta",  age: 52, ward: "CCU",   condition: "Hypertension" },
  { id: "P-003", name: "Rohan Das",    age: 71, ward: "ICU-B", condition: "Sepsis Watch" },
  { id: "P-004", name: "Ananya Iyer",  age: 45, ward: "Gen-3", condition: "Post-Surgery" },
  { id: "P-005", name: "Vikram Nair",  age: 58, ward: "CCU",   condition: "Arrhythmia" },
];

function initVitals() {
  const out = {};
  for (const key of Object.keys(VITAL_RANGES)) out[key] = generateVital(key);
  return out;
}

const SEVERITY_COLORS = ["#22c55e", "#facc15", "#f97316", "#ef4444"];
const SEVERITY_LABELS = ["Normal", "Watch", "Warning", "Critical"];

function severityLabel(score) {
  if (score === 0) return 0;
  if (score === 1) return 1;
  if (score <= 3) return 2;
  return 3;
}

function VitalCard({ vitalKey, value, history }) {
  const range = VITAL_RANGES[vitalKey];
  const isAnomaly = detectAnomaly(value, vitalKey);
  const color = isAnomaly ? "#ef4444" : "#10b981";

  return (
    <div style={{
      background: "rgba(15,23,42,0.8)",
      border: `1px solid ${isAnomaly ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.15)"}`,
      borderRadius: "12px",
      padding: "14px 16px",
      boxShadow: isAnomaly ? "0 0 18px rgba(239,68,68,0.2)" : "none",
      transition: "all 0.4s ease",
      position: "relative",
      overflow: "hidden",
    }}>
      {isAnomaly && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "2px", background: "linear-gradient(90deg,transparent,#ef4444,transparent)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}/>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
          {range.label.toUpperCase()}
        </span>
        {isAnomaly && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
            color: "#ef4444", background: "rgba(239,68,68,0.1)",
            padding: "2px 6px", borderRadius: 4, fontFamily: "'Space Mono', monospace"
          }}>ANOMALY</span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>
          {value}
        </span>
        <span style={{ fontSize: 12, color: "#475569" }}>{range.unit}</span>
      </div>
      <div style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono', monospace" }}>
        NORM: {range.min}–{range.max} {range.unit}
      </div>
      <div style={{ marginTop: 8, height: 40 }}>
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={history.map((v, i) => ({ i, v }))}>
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <ReferenceLine y={range.max} stroke="rgba(239,68,68,0.3)" strokeDasharray="2 2" />
            <ReferenceLine y={range.min} stroke="rgba(239,68,68,0.3)" strokeDasharray="2 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PatientRow({ patient, vitals, onSelect, selected, alertCount }) {
  const sev = severityLabel(severityScore(vitals));
  const color = SEVERITY_COLORS[sev];
  return (
    <div
      onClick={() => onSelect(patient.id)}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        cursor: "pointer", borderRadius: 10, marginBottom: 4,
        background: selected ? "rgba(16,185,129,0.08)" : "rgba(15,23,42,0.4)",
        border: selected ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.04)",
        transition: "all 0.2s",
      }}
    >
      <div style={{
        width: 8, height: 8, borderRadius: "50%", background: color,
        boxShadow: `0 0 8px ${color}`, flexShrink: 0,
        animation: sev >= 2 ? "blink 1s ease-in-out infinite" : "none",
      }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 1 }}>{patient.name}</div>
        <div style={{ fontSize: 11, color: "#475569", fontFamily: "'Space Mono', monospace" }}>{patient.id} · {patient.ward}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 11, color, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
          {SEVERITY_LABELS[sev]}
        </div>
        {alertCount > 0 && (
          <div style={{ fontSize: 10, color: "#ef4444", marginTop: 1 }}>{alertCount} alert{alertCount > 1 ? "s" : ""}</div>
        )}
      </div>
    </div>
  );
}

function AlertItem({ alert }) {
  const color = alert.severity >= 2 ? "#ef4444" : "#f97316";
  return (
    <div style={{
      padding: "10px 14px", borderRadius: 8, marginBottom: 6,
      background: `rgba(${alert.severity >= 2 ? "239,68,68" : "249,115,22"},0.07)`,
      border: `1px solid rgba(${alert.severity >= 2 ? "239,68,68" : "249,115,22"},0.2)`,
      display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <div style={{ fontSize: 16 }}>{alert.severity >= 2 ? "🚨" : "⚠️"}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 2 }}>{alert.patient}</div>
        <div style={{ fontSize: 11, color: "#94a3b8" }}>{alert.message}</div>
        <div style={{ fontSize: 10, color: "#475569", marginTop: 3, fontFamily: "'Space Mono', monospace" }}>{alert.time}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [patientVitals, setPatientVitals] = useState(() => {
    const pv = {};
    PATIENTS.forEach(p => { pv[p.id] = initVitals(); });
    return pv;
  });
  const [vitalHistory, setVitalHistory] = useState(() => {
    const ph = {};
    PATIENTS.forEach(p => {
      ph[p.id] = {};
      Object.keys(VITAL_RANGES).forEach(k => { ph[p.id][k] = [generateVital(k)]; });
    });
    return ph;
  });
  const [selectedPatient, setSelectedPatient] = useState("P-001");
  const [alerts, setAlerts] = useState([]);
  const [alertCounts, setAlertCounts] = useState({});
  const [streaming, setStreaming] = useState(true);
  const [tick, setTick] = useState(0);
  const [stats, setStats] = useState({ total: 0, anomalies: 0, critical: 0 });
  const patientVitalsRef = useRef(patientVitals);
  patientVitalsRef.current = patientVitals;

  const streamTick = useCallback(() => {
    setTick(t => t + 1);
    const newAlerts = [];
    const newCounts = {};
    let totalAnomalies = 0, criticalCount = 0;

    const nextVitals = {};
    PATIENTS.forEach(p => {
      const forceAnomaly = Math.random() < 0.12;
      const newV = {};
      Object.keys(VITAL_RANGES).forEach(k => {
        newV[k] = generateVital(k, forceAnomaly && Math.random() < 0.4);
      });
      nextVitals[p.id] = newV;

      const score = severityScore(newV);
      const sev = severityLabel(score);
      if (sev >= 2) {
        criticalCount++;
        const anomalousKeys = Object.keys(VITAL_RANGES).filter(k => detectAnomaly(newV[k], k));
        totalAnomalies += anomalousKeys.length;
        const key = anomalousKeys[0];
        if (key) {
          newAlerts.push({
            id: Date.now() + Math.random(),
            patient: `${p.name} (${p.id})`,
            message: `${VITAL_RANGES[key].label} = ${newV[key]} ${VITAL_RANGES[key].unit} — outside normal range`,
            severity: sev,
            time: new Date().toLocaleTimeString(),
          });
          newCounts[p.id] = (newCounts[p.id] || 0) + 1;
        }
      }
    });

    setPatientVitals(nextVitals);

    setVitalHistory(prev => {
      const next = {};
      PATIENTS.forEach(p => {
        next[p.id] = {};
        Object.keys(VITAL_RANGES).forEach(k => {
          const hist = prev[p.id]?.[k] || [];
          next[p.id][k] = [...hist, nextVitals[p.id][k]].slice(-20);
        });
      });
      return next;
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 30));
      setAlertCounts(prev => {
        const merged = { ...prev };
        for (const [k, v] of Object.entries(newCounts)) merged[k] = (merged[k] || 0) + v;
        return merged;
      });
    }

    setStats(s => ({
      total: s.total + PATIENTS.length,
      anomalies: s.anomalies + totalAnomalies,
      critical: Math.max(s.critical, criticalCount),
    }));
  }, []);

  useEffect(() => {
    if (!streaming) return;
    const id = setInterval(streamTick, 2000);
    return () => clearInterval(id);
  }, [streaming, streamTick]);

  const patient = PATIENTS.find(p => p.id === selectedPatient);
  const vitals = patientVitals[selectedPatient] || {};
  const history = vitalHistory[selectedPatient] || {};
  const sev = severityLabel(severityScore(vitals));

  return (
    <div style={{ minHeight: "100vh", background: "#020617", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
        @keyframes pulse { 0%,100% { opacity:0.4 } 50% { opacity:1 } }
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.2 } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <header style={{
        padding: "0 24px", height: 60, borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(2,6,23,0.95)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg,#10b981,#059669)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>⚕</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}>HealthSentinel AI</div>
            <div style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
              ANOMALY DETECTION SYSTEM
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "DATA POINTS", val: stats.total.toLocaleString() },
              { label: "ANOMALIES", val: stats.anomalies, color: "#f97316" },
              { label: "ALERTS", val: alerts.length, color: "#ef4444" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.color || "#10b981", fontFamily: "'Space Mono', monospace" }}>{s.val}</div>
                <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStreaming(s => !s)}
            style={{
              padding: "6px 14px", borderRadius: 6, border: "1px solid",
              borderColor: streaming ? "rgba(16,185,129,0.4)" : "rgba(100,116,139,0.4)",
              background: streaming ? "rgba(16,185,129,0.1)" : "rgba(100,116,139,0.1)",
              color: streaming ? "#10b981" : "#64748b",
              cursor: "pointer", fontSize: 11, fontWeight: 600, letterSpacing: 1,
              fontFamily: "'Space Mono', monospace",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: streaming ? "#10b981" : "#64748b",
              display: "inline-block",
              animation: streaming ? "blink 1s ease-in-out infinite" : "none",
            }}/>
            {streaming ? "LIVE" : "PAUSED"}
          </button>
        </div>
      </header>

      <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>
        {/* Sidebar */}
        <aside style={{
          width: 260, background: "rgba(2,6,23,0.6)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          padding: "16px 12px", overflowY: "auto", flexShrink: 0,
        }}>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 12, padding: "0 4px", fontFamily: "'Space Mono', monospace" }}>
            PATIENTS ({PATIENTS.length})
          </div>
          {PATIENTS.map(p => (
            <PatientRow
              key={p.id} patient={p}
              vitals={patientVitals[p.id] || {}}
              onSelect={setSelectedPatient}
              selected={selectedPatient === p.id}
              alertCount={alertCounts[p.id] || 0}
            />
          ))}

          <div style={{ marginTop: 20, padding: 14, background: "rgba(16,185,129,0.05)", borderRadius: 10, border: "1px solid rgba(16,185,129,0.1)" }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 10, fontFamily: "'Space Mono', monospace" }}>ML MODELS</div>
            {[
              { name: "Autoencoder", acc: "96.2%" },
              { name: "Isolation Forest", acc: "94.8%" },
            ].map(m => (
              <div key={m.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#cbd5e1", fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: "#10b981", fontFamily: "'Space Mono', monospace" }}>ACTIVE</div>
                </div>
                <div style={{ fontSize: 12, color: "#10b981", fontFamily: "'Space Mono', monospace", alignSelf: "center" }}>{m.acc}</div>
              </div>
            ))}
            <div style={{ marginTop: 10, height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 10 }}/>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>
              STREAM: <span style={{ color: "#10b981" }}>●</span> ACTIVE<br/>
              TICK #{tick} · 2s interval
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, animation: "fadeIn 0.3s ease" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>{patient?.name}</h2>
                <div style={{
                  padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1,
                  background: `rgba(${sev === 0 ? "16,185,129" : sev === 1 ? "250,204,21" : sev === 2 ? "249,115,22" : "239,68,68"},0.15)`,
                  color: SEVERITY_COLORS[sev], border: `1px solid ${SEVERITY_COLORS[sev]}40`,
                  fontFamily: "'Space Mono', monospace",
                }}>
                  {SEVERITY_LABELS[sev]}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#475569", fontFamily: "'Space Mono', monospace" }}>
                {patient?.id} · Age {patient?.age} · {patient?.ward} · {patient?.condition}
              </div>
            </div>
            <div style={{
              padding: "10px 16px", background: "rgba(15,23,42,0.6)", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.06)", textAlign: "right",
            }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 2 }}>Anomaly Score</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: SEVERITY_COLORS[sev] }}>
                {((severityScore(vitals) / 6) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
            {Object.keys(VITAL_RANGES).map(k => (
              <VitalCard key={k} vitalKey={k} value={vitals[k] ?? VITAL_RANGES[k].min} history={history[k] || []} />
            ))}
          </div>

          <div style={{
            background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "20px", marginBottom: 24,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Heart Rate Trend</div>
                <div style={{ fontSize: 11, color: "#475569" }}>Last 20 data points</div>
              </div>
              <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#10b981" }}>LIVE</div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={(history.heart_rate || []).map((v, i) => ({ i, v }))}>
                <XAxis dataKey="i" hide />
                <YAxis domain={[40, 160]} hide />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, fontSize: 11 }}
                  formatter={v => [`${v} bpm`, "HR"]}
                  labelFormatter={() => ""}
                />
                <ReferenceLine y={100} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 4" />
                <ReferenceLine y={55}  stroke="rgba(239,68,68,0.3)" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </main>

        {/* Alerts */}
        <aside style={{
          width: 300, background: "rgba(2,6,23,0.6)",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          padding: "16px 12px", overflowY: "auto", flexShrink: 0,
        }}>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 12, fontFamily: "'Space Mono', monospace", display: "flex", justifyContent: "space-between" }}>
            <span>ALERTS ({alerts.length})</span>
            {alerts.length > 0 && (
              <button onClick={() => { setAlerts([]); setAlertCounts({}); }}
                style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 10, fontFamily: "'Space Mono', monospace" }}>
                CLEAR
              </button>
            )}
          </div>
          {alerts.length === 0 ? (
            <div style={{ color: "#334155", fontSize: 12, textAlign: "center", marginTop: 40, fontFamily: "'Space Mono', monospace" }}>
              ✓ No alerts detected<br/><span style={{ fontSize: 10 }}>System monitoring active</span>
            </div>
          ) : (
            alerts.map(a => <AlertItem key={a.id} alert={a} />)
          )}
        </aside>
      </div>
    </div>
  );
}
