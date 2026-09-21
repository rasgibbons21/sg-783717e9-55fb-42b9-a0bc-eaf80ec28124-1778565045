import { useState } from "react";
import Head from "next/head";

type StepData = { status: string; error?: string; [k: string]: any };

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: "bg-green-900/40 text-green-400 border-green-500/30",
    checked: "bg-green-900/40 text-green-400 border-green-500/30",
    failed: "bg-red-900/40 text-red-400 border-red-500/30",
    error: "bg-red-900/40 text-red-400 border-red-500/30",
    no_data: "bg-yellow-900/40 text-yellow-400 border-yellow-500/30",
    no_triggers: "bg-yellow-900/40 text-yellow-400 border-yellow-500/30",
    no_match: "bg-yellow-900/40 text-yellow-400 border-yellow-500/30",
    pending: "bg-gray-800/40 text-gray-400 border-gray-500/30",
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${colors[status] ?? colors.pending}`}>
      {status}
    </span>
  );
}

function StepCard({ label, data }: { label: string; data: StepData }) {
  const [open, setOpen] = useState(false);
  const isOk = data.status === "success" || data.status === "checked";

  return (
    <div
      className={`rounded-xl border p-4 ${isOk ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <span className="text-lg">{isOk ? "✅" : "❌"}</span>
          <span className="text-sm font-bold text-[#F3EDE3]">{label}</span>
        </div>
        <StatusBadge status={data.status} />
      </button>
      {data.error && <p className="text-xs text-red-400 mt-2 ml-9">{data.error}</p>}
      {open && (
        <pre className="mt-3 text-[10px] text-[#F3EDE3]/50 bg-black/30 rounded-lg p-3 overflow-auto max-h-80">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function DebugScanner() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/debug/scanner-diagnostic", { method: "POST" });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const steps = result?.steps as Record<string, StepData> | undefined;
  const labels: Record<string, string> = {
    dataFetch: "1. Data Fetch (FMP API)",
    strategyMatch: "2. Strategy Match (Gap&Go / HOD / R2G)",
    alertLogic: "3. Alert Trigger Logic",
    notificationSend: "4. Notification Infrastructure",
    databaseRecord: "5. Database Tables",
  };

  return (
    <>
      <Head><title>Scanner Diagnostic</title></Head>
      <div className="min-h-screen bg-[#07080C] px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[#F3EDE3] mb-1">Scanner &amp; Alert Diagnostic</h1>
          <p className="text-xs text-[#F3EDE3]/40 mb-6">
            Tests every step: data fetch → strategy match → alert logic → notifications → database
          </p>

          <button
            onClick={runDiagnostic}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            style={{ background: "#27B7C8", color: "#fff" }}
          >
            {loading ? "Running diagnostic..." : "Run Diagnostic"}
          </button>

          {result?.error && !steps && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {result.error}
            </div>
          )}

          {steps && (
            <div className="mt-6 space-y-3">
              {Object.entries(steps).map(([key, data]) => (
                <StepCard key={key} label={labels[key] ?? key} data={data} />
              ))}
            </div>
          )}

          {result && (
            <details className="mt-8">
              <summary className="text-xs text-[#F3EDE3]/30 cursor-pointer hover:text-[#F3EDE3]/50">
                Raw JSON output
              </summary>
              <pre className="mt-2 text-[10px] text-[#F3EDE3]/40 bg-black/30 rounded-lg p-4 overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </>
  );
}
