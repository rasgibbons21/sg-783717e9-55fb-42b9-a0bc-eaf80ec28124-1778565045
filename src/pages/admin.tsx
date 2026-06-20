import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_pro: boolean;
  onboarding_complete: boolean;
  created_at: string;
  last_sign_in: string | null;
  email_confirmed: boolean;
}

interface DashboardData {
  users: AdminUser[];
  onboarding: {
    totalSignups: number;
    completedOnboarding: number;
    stuckOnOnboarding: number;
  };
  health: {
    anthropic: boolean;
    apiKeys: { finnhub: boolean; fmp: boolean };
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / 3_600_000;
  if (diffH < 1) return `${Math.round(diffH * 60)}m ago`;
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: diffD > 365 ? "numeric" : undefined });
}

function fmtJoined(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [authError, setAuthError] = useState<401 | 403 | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      ({ data: { session } } = await supabase.auth.refreshSession());
    }

    if (!session?.access_token) {
      setAuthError(401);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.status === 401) { setAuthError(401); return; }
      if (res.status === 403) { setAuthError(403); return; }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFetchError(body.error || `HTTP ${res.status}`);
        return;
      }

      const json = await res.json();
      setData(json);
      setLoadedAt(new Date());
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Auth error states ────────────────────────────────────────────────────

  if (authError) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>
          <span style={{ fontSize: 32, marginBottom: 12 }}>🔒</span>
          <p style={{ color: "#d4788a", fontFamily: "DM Sans, sans-serif", fontSize: 15, margin: 0 }}>
            {authError === 403 ? "Not authorized." : "Not authenticated."}
          </p>
          <p style={{ color: "#666", fontFamily: "DM Sans, sans-serif", fontSize: 13, marginTop: 6 }}>
            {authError === 403
              ? "Your account is not in the admin allowlist."
              : "Sign in first, then return to this page."}
          </p>
        </div>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={{ color: "#666", fontFamily: "DM Sans, sans-serif" }}>Loading…</p>
      </div>
    );
  }

  // ── Fetch error ──────────────────────────────────────────────────────────

  if (fetchError || !data) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>
          <p style={{ color: "#d4788a", fontFamily: "DM Sans, sans-serif", fontSize: 15, margin: 0 }}>
            Failed to load: {fetchError ?? "no data"}
          </p>
          <button onClick={load} style={styles.refreshBtn}>Retry</button>
        </div>
      </div>
    );
  }

  const { users, onboarding, health } = data;
  const proCount = users.filter(u => u.is_pro).length;
  const funnelPct = onboarding.totalSignups > 0
    ? Math.round((onboarding.completedOnboarding / onboarding.totalSignups) * 100)
    : 0;

  // ── Dashboard ────────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Bloom Ops</h1>
          {loadedAt && (
            <p style={styles.subtitle}>
              {loadedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
            </p>
          )}
        </div>
        <button onClick={load} style={styles.refreshBtn} disabled={loading}>
          {loading ? "Loading…" : "↺ Refresh"}
        </button>
      </div>

      {/* Stat tiles */}
      <div style={styles.tileRow}>
        <Tile label="Total signups" value={onboarding.totalSignups} />
        <Tile label={`Onboarding complete (${funnelPct}%)`} value={onboarding.completedOnboarding} color="#3d7a54" />
        <Tile label="Stuck" value={onboarding.stuckOnOnboarding} color={onboarding.stuckOnOnboarding > 0 ? "#d4788a" : "#3d7a54"} />
        <Tile label="Pro" value={proCount} color="#c8953a" />
      </div>

      {/* Integration health */}
      <div style={styles.section}>
        <p style={styles.sectionLabel}>Integration health</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <HealthPill label="Anthropic" ok={health.anthropic} />
          <HealthPill label="Finnhub" ok={health.apiKeys.finnhub} />
          <HealthPill label="FMP" ok={health.apiKeys.fmp} />
        </div>
      </div>

      {/* Members table */}
      <div style={styles.section}>
        <p style={styles.sectionLabel}>Members — {users.length}</p>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Name", "Email", "Plan", "Joined", "Last seen", "Onboarding"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.025)" }}>
                  <td style={styles.td}>{u.full_name || <span style={{ color: "#555" }}>—</span>}</td>
                  <td style={{ ...styles.td, color: "#a0a0b0" }}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={u.is_pro ? styles.badgePro : styles.badgeFree}>
                      {u.is_pro ? "Pro" : "Free"}
                    </span>
                  </td>
                  <td style={{ ...styles.td, color: "#a0a0b0" }}>{fmtJoined(u.created_at)}</td>
                  <td style={{ ...styles.td, color: "#a0a0b0" }}>{fmt(u.last_sign_in)}</td>
                  <td style={styles.td}>
                    {u.onboarding_complete
                      ? <span style={{ color: "#3d7a54" }}>✓</span>
                      : <span style={{ color: "#d4788a" }}>✗</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Tile({ label, value, color = "#f5f0e8" }: { label: string; value: number; color?: string }) {
  return (
    <div style={styles.tile}>
      <span style={{ ...styles.tileValue, color }}>{value}</span>
      <span style={styles.tileLabel}>{label}</span>
    </div>
  );
}

function HealthPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 20, fontSize: 12,
      fontFamily: "DM Sans, sans-serif",
      background: ok ? "rgba(61,122,84,0.15)" : "rgba(212,120,138,0.15)",
      color: ok ? "#3d7a54" : "#d4788a",
      border: `1px solid ${ok ? "rgba(61,122,84,0.3)" : "rgba(212,120,138,0.3)"}`,
    }}>
      {ok ? "●" : "●"} {label}
    </span>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh",
    background: "#06060a",
    padding: "40px 32px",
    boxSizing: "border-box" as const,
    maxWidth: 1100,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  title: {
    fontFamily: "Cormorant Garamond, Georgia, serif",
    fontSize: 28,
    fontWeight: 600,
    color: "#f5f0e8",
    margin: 0,
  },
  subtitle: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: 12,
    color: "#555",
    margin: "4px 0 0",
  },
  tileRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 32,
  },
  tile: {
    background: "#0f0f17",
    border: "1px solid #1e1e2e",
    borderRadius: 8,
    padding: "20px 20px 16px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  tileValue: {
    fontFamily: "Cormorant Garamond, Georgia, serif",
    fontSize: 36,
    fontWeight: 600,
    lineHeight: 1,
  },
  tileLabel: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: 11,
    color: "#666",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  section: {
    marginBottom: 36,
  },
  sectionLabel: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: 11,
    color: "#555",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: 10,
  },
  tableWrapper: {
    overflowX: "auto" as const,
    border: "1px solid #1e1e2e",
    borderRadius: 8,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontFamily: "DM Sans, sans-serif",
    fontSize: 13,
  },
  th: {
    textAlign: "left" as const,
    padding: "10px 14px",
    color: "#555",
    fontWeight: 500,
    fontSize: 11,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    borderBottom: "1px solid #1e1e2e",
    whiteSpace: "nowrap" as const,
  },
  td: {
    padding: "10px 14px",
    color: "#d0ccc5",
    borderBottom: "1px solid #111118",
    whiteSpace: "nowrap" as const,
  },
  badgePro: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 10,
    fontSize: 11,
    background: "rgba(200,149,58,0.15)",
    color: "#c8953a",
    border: "1px solid rgba(200,149,58,0.3)",
    fontWeight: 500,
  },
  badgeFree: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 10,
    fontSize: 11,
    background: "rgba(255,255,255,0.05)",
    color: "#666",
    border: "1px solid #222",
  },
  errorBox: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "40vh",
    gap: 8,
  },
  refreshBtn: {
    background: "transparent",
    border: "1px solid #2a2a3a",
    borderRadius: 6,
    color: "#888",
    fontFamily: "DM Sans, sans-serif",
    fontSize: 12,
    padding: "6px 14px",
    cursor: "pointer",
  },
} as const;
