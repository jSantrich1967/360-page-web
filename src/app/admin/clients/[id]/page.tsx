import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";
import { deleteClient } from "@/actions/client.actions";
import type { Client } from "@/types";

export default async function AdminClientDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hasDb = !!supabaseAdmin;
  let client: Client | null = null;

  if (hasDb) {
    const res = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();
    client = res.data as Client | null;
  }

  if (!hasDb || !client) {
    return (
      <div>
        <Link
          href="/admin/clients"
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
          {!hasDb ? "Supabase no configurado." : "Cliente no encontrado."}
        </p>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/admin/clients"
        style={{
          color: "#94a3b8",
          textDecoration: "none",
          marginBottom: "1rem",
          display: "inline-block"
        }}
      >
        ← Volver al listado
      </Link>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem" }}>
        {client.first_name} {client.last_name}
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        {client.email ?? "Sin email"} · {client.phone}
        {client.whatsapp ? ` · WhatsApp: ${client.whatsapp}` : ""}
      </p>
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 8,
          padding: "1.5rem",
          color: "#e2e8f0"
        }}
      >
        {client.notes ? (
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{client.notes}</p>
        ) : (
          <p style={{ margin: 0, color: "#94a3b8" }}>Sin notas.</p>
        )}
      </div>
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap"
        }}
      >
        {/* Botón de eliminar cliente */}
        <form action={deleteClient} style={{ display: "inline" }}>
          <input type="hidden" name="id" value={client.id} />
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#fca5a5",
              borderRadius: 6,
              border: "1px solid #ef4444",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer"
            }}
          >
            Eliminar cliente
          </button>
        </form>
      </div>
    </>
  );
}
