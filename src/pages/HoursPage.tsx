import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { addMyHours, listMyHours, type HourEntry } from "../services/db";

const mock = String(import.meta.env.VITE_USE_MOCK_DB).toLowerCase() === "true";
console.log("[HoursPage] VITE_USE_MOCK_DB =", import.meta.env.VITE_USE_MOCK_DB, "→ mock =", mock);

export default function HoursPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<HourEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // simple form state
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    hours: 1,
    minutes: 0,
    activity: "",
    notes: "",
  });

  const totalMinutes = useMemo(
    () => Math.max(0, form.hours) * 60 + Math.max(0, Math.min(59, form.minutes)),
    [form.hours, form.minutes]
  );

  // DEV-only wiring sanity check (runs once regardless of auth)
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    (async () => {
      try {
        const rows = await listMyHours();
        console.log("[HoursPage] listMyHours (dev probe) ->", rows);
      } catch (e) {
        console.error("[HoursPage] listMyHours (dev probe) ERROR ->", e);
      }
    })();
  }, []);

  // fetch on mount / on login
  useEffect(() => {
    (async () => {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const rows = await listMyHours();
        setItems(rows);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load hours");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await addMyHours({
        date: form.date,
        minutes: totalMinutes,
        activity: form.activity || "General Service",
        notes: form.notes || undefined,
      });
      const rows = await listMyHours(); // refresh list
      setItems(rows);
      setForm((f) => ({ ...f, activity: "", notes: "" })); // reset some fields
    } catch (e: any) {
      setError(e?.message ?? "Failed to add hours");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user && !mock) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        <h1>Volunteer Hours</h1>
        <p>Please log in to view and record your volunteer hours.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      {mock && (
        <div
          style={{
            background: "#fffbe6",
            border: "1px solid #facc15",
            color: "#92400e",
            padding: "8px 12px",
            borderRadius: 8,
            marginBottom: 12,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          ⚙️ Mock Mode Active — Data is stored locally (not Supabase)
        </div>
      )}

      <h1 style={{ marginBottom: 12 }}>Volunteer Hours</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Log your time and keep track of your contributions.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          padding: "1rem",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          marginBottom: 24,
          background: "#fff",
        }}
      >
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
            style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Hours</label>
          <input
            type="number"
            min={0}
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
            style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Minutes</label>
          <input
            type="number"
            min={0}
            max={59}
            value={form.minutes}
            onChange={(e) => setForm({ ...form, minutes: Number(e.target.value) })}
            style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Activity</label>
          <input
            placeholder="e.g., Mobile pantry, Sorting, Distribution…"
            value={form.activity}
            onChange={(e) => setForm({ ...form, activity: e.target.value })}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Notes (optional)</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
        </div>

        <button
          disabled={submitting}
          style={{
            gridColumn: "1 / -1",
            justifySelf: "start",
            background: "#1d4ed8",
            color: "#fff",
            padding: "0.75rem 1.25rem",
            borderRadius: 10,
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {submitting ? "Saving…" : `Add ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
        </button>
      </form>

      {error && (
        <div style={{ marginBottom: 16, color: "#b91c1c", background: "#fee2e2", padding: 12, borderRadius: 8 }}>
          {error}
        </div>
      )}

      <h2 style={{ marginBottom: 8 }}>Your Logged Hours</h2>

      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p>No entries yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
          {items.map((r) => (
            <li
              key={r.id}
              style={{
                border: "1px solid #e5e7eb",
                background: "#fff",
                borderRadius: 12,
                padding: "0.75rem 1rem",
                marginBottom: 10,
              }}
            >
              <strong>{new Date(r.date).toLocaleDateString()}</strong> —{" "}
              {Math.floor(r.minutes / 60)}h {r.minutes % 60}m — {r.activity}
              {r.notes ? <div style={{ color: "#6b7280" }}>{r.notes}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
