import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createUserInvitation } from "@/actions/invitation.actions";

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

export default async function InviteUserPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const hasDb = !!supabaseAdmin;

  if (!hasDb) {
    return (
      <div>
        <Link
          href="/admin/users"
          style={{
            color: "#94a3b8",
            textDecoration: "none",
            marginBottom: "1rem",
            display: "inline-block"
          }}
        >
          ← Volver al listado
        </Link>
        <p style={{ color: "#94a3b8" }}>
          Configura Supabase en <code>.env.local</code> para poder invitar
          usuarios.
        </p>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/admin/users"
        style={{
          color: "#94a3b8",
          textDecoration: "none",
          marginBottom: "1rem",
          display: "inline-block"
        }}
      >
        ← Volver al listado
      </Link>
      <h1 style={{ margin: "0 0 1rem", fontSize: "1.75rem" }}>
        Invitar usuario
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

      <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>
        Esta versión sencilla solo guarda la invitación en la base de datos.
        Más adelante se puede conectar con emails reales.
      </p>

      <form
        action={createUserInvitation}
        style={{
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem"
        }}
      >
        <div>
          <label htmlFor="email" style={labelStyle}>
            Email del usuario *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="usuario@ejemplo.com"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="role" style={labelStyle}>
            Rol
          </label>
          <select id="role" name="role" style={inputStyle} defaultValue="agent">
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
          </select>
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
            Crear invitación
          </button>
          <Link
            href="/admin/users"
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

