import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Client } from "@/types";

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#1e293b",
  borderRadius: 8,
  overflow: "hidden",
  border: "1px solid #334155"
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.75rem 1rem",
  background: "#0f172a",
  color: "#94a3b8",
  fontSize: "0.875rem",
  fontWeight: 600
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderTop: "1px solid #334155",
  color: "#e2e8f0"
};

export default async function AdminClientsPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    source?: string;
    onlyActive?: string;
  }>;
}) {
  const { q, source, onlyActive } = await searchParams;

  const hasDb = !!supabaseAdmin;
  let clients: Client[] = [];
  let error = false;

  if (hasDb) {
    let query = supabaseAdmin
      .from("clients")
      .select("id, first_name, last_name, email, phone, is_active, source")
      .order("created_at", { ascending: false })
      .limit(50);

    if (q && q.trim().length > 0) {
      const term = `%${q.trim()}%`;
      query = query.or(
        `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`
      );
    }

    if (source && source.trim().length > 0) {
      query = query.ilike("source", `%${source.trim()}%`);
    }

    if (onlyActive === "1") {
      query = query.eq("is_active", true);
    }

    const res = await query;
    if (res.error) error = true;
    else clients = (res.data ?? []) as Client[];
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem" }}>
            Clientes
          </h1>
          <p style={{ color: "#94a3b8", margin: 0 }}>
            {hasDb && !error
              ? `Listado de clientes (${clients.length} mostrados).`
              : "Gestiona tus clientes. Configura Supabase y ejecuta las migraciones para ver datos reales."}
          </p>
        </div>
        {hasDb && !error && (
          <Link
            href="/admin/clients/new"
            style={{
              padding: "0.5rem 1rem",
              background: "#3b82f6",
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 600,
              whiteSpace: "nowrap"
            }}
          >
            Nuevo cliente
          </Link>
        )}
      </div>

      {hasDb && !error && (
        <form
          method="GET"
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "0.75rem"
          }}
        >
          <div>
            <label
              htmlFor="q"
              style={{
                display: "block",
                marginBottom: "0.25rem",
                color: "#94a3b8",
                fontSize: "0.8rem"
              }}
            >
              Buscar por nombre, email o teléfono
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Ej. Juan, +58, @gmail.com..."
              style={{
                width: "100%",
                padding: "0.4rem 0.6rem",
                background: "#1e293b",
                borderRadius: 6,
                border: "1px solid #334155",
                color: "#e5e7eb",
                fontSize: "0.9rem"
              }}
            />
          </div>
          <div>
            <label
              htmlFor="source"
              style={{
                display: "block",
                marginBottom: "0.25rem",
                color: "#94a3b8",
                fontSize: "0.8rem"
              }}
            >
              Origen (web, referencia, Instagram...)
            </label>
            <input
              id="source"
              name="source"
              defaultValue={source ?? ""}
              placeholder="Ej. web, instagram..."
              style={{
                width: "100%",
                padding: "0.4rem 0.6rem",
                background: "#1e293b",
                borderRadius: 6,
                border: "1px solid #334155",
                color: "#e5e7eb",
                fontSize: "0.9rem"
              }}
            />
          </div>
          <div>
            <label
              htmlFor="onlyActive"
              style={{
                display: "block",
                marginBottom: "0.25rem",
                color: "#94a3b8",
                fontSize: "0.8rem"
              }}
            >
              Solo activos
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.4rem 0.6rem",
                background: "#1e293b",
                borderRadius: 6,
                border: "1px solid #334155",
                color: "#e5e7eb",
                fontSize: "0.9rem"
              }}
            >
              <input
                id="onlyActive"
                name="onlyActive"
                type="checkbox"
                value="1"
                defaultChecked={onlyActive === "1"}
                style={{ margin: 0 }}
              />
              <span style={{ fontSize: "0.85rem" }}>Mostrar solo clientes activos</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "0.5rem"
            }}
          >
            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer"
              }}
            >
              Buscar
            </button>
            <Link
              href="/admin/clients"
              style={{
                padding: "0.5rem 1rem",
                color: "#94a3b8",
                textDecoration: "none",
                borderRadius: 6,
                fontSize: "0.9rem"
              }}
            >
              Limpiar
            </Link>
          </div>
        </form>
      )}

      {!hasDb && (
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: "1.5rem",
            color: "#94a3b8"
          }}
        >
          Configura el archivo <code>.env.local</code> con estas dos variables: <code>SUPABASE_URL</code> y <code>SUPABASE_SERVICE_ROLE_KEY</code>.
        </div>
      )}

      {hasDb && error && (
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: "1.5rem",
            color: "#94a3b8"
          }}
        >
          Error al cargar clientes. ¿Ejecutaste las migraciones SQL en Supabase?
        </div>
      )}

      {hasDb && !error && (
        <>
          {clients.length === 0 ? (
            <div
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
                padding: "2rem",
                textAlign: "center",
                color: "#94a3b8"
              }}
            >
              Aún no hay clientes. Próximamente podrás agregarlos desde aquí.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Teléfono</th>
                    <th style={thStyle}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id}>
                      <td style={tdStyle}>
                        <Link
                          href={`/admin/clients/${c.id}`}
                          style={{ color: "#3b82f6", textDecoration: "none" }}
                        >
                          {c.first_name} {c.last_name}
                        </Link>
                      </td>
                      <td style={tdStyle}>{c.email ?? "—"}</td>
                      <td style={tdStyle}>{c.phone}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: 4,
                            fontSize: "0.8125rem",
                            ...(c.is_active
                              ? { background: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }
                              : { background: "rgba(148, 163, 184, 0.2)", color: "#94a3b8" })
                          }}
                        >
                          {c.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
