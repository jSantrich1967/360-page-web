import Link from "next/link";
import { createClient } from "@/actions/client.actions";
import { supabaseAdmin } from "@/lib/supabase/server";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 6,
  color: "#e2e8f0",
  fontSize: "1rem"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "0.25rem",
  color: "#94a3b8",
  fontSize: "0.875rem"
};

export default async function NewClientPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const hasDb = !!supabaseAdmin;

  if (!hasDb) {
    return (
      <div>
        <Link href="/admin/clients" style={{ color: "#94a3b8", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
          ← Volver al listado
        </Link>
        <p style={{ color: "#94a3b8" }}>
          Configura Supabase en <code>.env.local</code> para poder crear clientes.
        </p>
      </div>
    );
  }

  return (
    <>
      <Link href="/admin/clients" style={{ color: "#94a3b8", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
        ← Volver al listado
      </Link>
      <h1 style={{ margin: "0 0 1rem", fontSize: "1.75rem" }}>
        Nuevo cliente
      </h1>

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid #ef4444",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1.5rem",
            color: "#fca5a5"
          }}
        >
          {error}
        </div>
      )}

      <form
        action={createClient}
        style={{
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem"
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="first_name" style={labelStyle}>
              Nombre *
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              placeholder="Juan"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="last_name" style={labelStyle}>
              Apellido *
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              required
              placeholder="Pérez"
              style={inputStyle}
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" style={labelStyle}>
            Teléfono *
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            required
            placeholder="+58 412 1234567"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="email" style={labelStyle}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="juan@ejemplo.com"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="whatsapp" style={labelStyle}>
            WhatsApp
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="text"
            placeholder="+58 412 1234567"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="source" style={labelStyle}>
            Origen (web, referencia, Instagram, etc.)
          </label>
          <input
            id="source"
            name="source"
            type="text"
            placeholder="web"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="notes" style={labelStyle}>
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Notas internas sobre el cliente..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          <button
            type="submit"
            style={{
              padding: "0.6rem 1.25rem",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Crear cliente
          </button>
          <Link
            href="/admin/clients"
            style={{
              padding: "0.6rem 1.25rem",
              color: "#94a3b8",
              textDecoration: "none",
              borderRadius: 6
            }}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
