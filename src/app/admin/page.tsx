import { supabaseAdmin } from "@/lib/supabase/server";
import { fetchDashboardStats } from "@/lib/data/dashboard";

const cardStyle: React.CSSProperties = {
  background: "#1e293b",
  borderRadius: 8,
  padding: "1.5rem",
  border: "1px solid #334155"
};

export default async function AdminDashboardPage() {
  const hasDb = !!supabaseAdmin;
  const stats = hasDb ? await fetchDashboardStats(supabaseAdmin) : null;

  return (
    <>
      <h1 style={{ margin: "0 0 1.5rem", fontSize: "1.75rem" }}>
        Dashboard
      </h1>

      {!hasDb && (
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: "1.5rem",
            marginBottom: "2rem",
            color: "#94a3b8"
          }}
        >
          <strong style={{ color: "#e2e8f0" }}>Supabase no configurado.</strong>
          <br />
          Copia <code style={{ background: "#334155", padding: "0.2rem 0.4rem", borderRadius: 4 }}>.env.example</code> a{" "}
          <code style={{ background: "#334155", padding: "0.2rem 0.4rem", borderRadius: 4 }}>.env.local</code> y rellena{" "}
          <code>SUPABASE_URL</code> y <code>SUPABASE_SERVICE_ROLE_KEY</code>. Luego ejecuta las migraciones SQL en tu proyecto Supabase.
        </div>
      )}

      {hasDb && stats === null && (
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: "1.5rem",
            marginBottom: "2rem",
            color: "#94a3b8"
          }}
        >
          No se pudieron cargar las estadísticas. Asegúrate de haber ejecutado las migraciones (<code>001_initial_schema.sql</code> y <code>002_rls_policies.sql</code>) en el SQL Editor de Supabase.
        </div>
      )}

      <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
        {hasDb && stats !== null
          ? "Resumen de tu agencia."
          : "Resumen de tu agencia. Los datos reales se cargarán cuando conectes Supabase."}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem"
        }}
      >
        <div style={cardStyle}>
          <div style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
            Propiedades
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            {stats?.totalProperties ?? "—"}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
            Disponibles
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            {stats?.availableCount ?? "—"}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
            Clientes
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            {stats?.totalClients ?? "—"}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
            Publicaciones pendientes
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            {stats?.pendingJobs ?? "—"}
          </div>
        </div>
      </div>
    </>
  );
}
