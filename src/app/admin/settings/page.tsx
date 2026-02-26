import { supabaseAdmin } from "@/lib/supabase/server";
import { updateAgencySettings } from "@/actions/settings.actions";
import { importBackup } from "@/actions/backup.actions";
import type { Agency } from "@/types";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 6,
  color: "#e2e8f0",
  fontSize: "0.95rem"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "0.25rem",
  color: "#94a3b8",
  fontSize: "0.8rem"
};

export default async function AdminSettingsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; backupMsg?: string }>;
}) {
  const { error, backupMsg } = await searchParams;
  const hasDb = !!supabaseAdmin;
  let agency: Agency | null = null;

  if (hasDb) {
    const res = await supabaseAdmin
      .from("agencies")
      .select("*")
      .limit(1)
      .single();
    agency = (res.data as Agency | null) ?? null;
  }

  return (
    <>
      <h1
        style={{
          margin: "0 0 0.5rem",
          fontSize: "clamp(1.4rem, 3vw, 1.75rem)"
        }}
      >
        Configuración
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        Datos de la agencia, colores, dominio y conexión con Instagram/Facebook.
      </p>

      {!hasDb && (
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: "1.5rem",
            color: "#94a3b8",
            marginBottom: "1.5rem"
          }}
        >
          Configura el archivo <code>.env.local</code> con{" "}
          <code>SUPABASE_URL</code> y <code>SUPABASE_SERVICE_ROLE_KEY</code>.
        </div>
      )}

      {hasDb && !agency && (
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: "1.5rem",
            color: "#94a3b8",
            marginBottom: "1.5rem"
          }}
        >
          No se encontró ninguna agencia. Ejecuta{" "}
          <code>supabase/seed_agency.sql</code> en Supabase para crear una
          agencia de ejemplo.
        </div>
      )}

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid #ef4444",
            borderRadius: 8,
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            color: "#fca5a5",
            fontSize: "0.9rem"
          }}
        >
          {error}
        </div>
      )}

      {backupMsg && (
        <div
          style={{
            background: "rgba(34, 197, 94, 0.12)",
            border: "1px solid #22c55e",
            borderRadius: 8,
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            color: "#bbf7d0",
            fontSize: "0.9rem"
          }}
        >
          {backupMsg}
        </div>
      )}

      {hasDb && agency && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            alignItems: "stretch"
          }}
        >
          {/* Formulario de datos de agencia */}
          <form
            action={updateAgencySettings}
            style={{
              padding: "1.25rem",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#020617",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}
          >
            <input type="hidden" name="id" value={agency.id} />
            <h2
              style={{
                fontSize: "1.1rem",
                margin: 0,
                marginBottom: "0.5rem"
              }}
            >
              Datos de la agencia
            </h2>

            <div>
              <label htmlFor="name" style={labelStyle}>
                Nombre *
              </label>
              <input
                id="name"
                name="name"
                defaultValue={agency.name}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="email" style={labelStyle}>
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={agency.email}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="phone" style={labelStyle}>
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                defaultValue={agency.phone ?? ""}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="address" style={labelStyle}>
                Dirección
              </label>
              <input
                id="address"
                name="address"
                defaultValue={agency.address ?? ""}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="website_domain" style={labelStyle}>
                Dominio del sitio (opcional)
              </label>
              <input
                id="website_domain"
                name="website_domain"
                placeholder="ej. miagencia.com"
                defaultValue={agency.website_domain ?? ""}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="whatsapp_number" style={labelStyle}>
                WhatsApp principal
              </label>
              <input
                id="whatsapp_number"
                name="whatsapp_number"
                placeholder="+58 ..."
                defaultValue={agency.whatsapp_number ?? ""}
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem"
              }}
            >
              <div>
                <label htmlFor="primary_color" style={labelStyle}>
                  Color primario
                </label>
                <input
                  id="primary_color"
                  name="primary_color"
                  type="text"
                  defaultValue={agency.primary_color}
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="secondary_color" style={labelStyle}>
                  Color secundario
                </label>
                <input
                  id="secondary_color"
                  name="secondary_color"
                  type="text"
                  defaultValue={agency.secondary_color}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                marginTop: "0.5rem",
                alignSelf: "flex-start",
                padding: "0.6rem 1.25rem",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              Guardar cambios
            </button>
          </form>

          {/* Conexión Meta (placeholder informativo) */}
          <div
            style={{
              padding: "1.25rem",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#020617",
              color: "#94a3b8",
              fontSize: "0.9rem"
            }}
          >
            <h2
              style={{
                fontSize: "1.1rem",
                margin: 0,
                marginBottom: "0.5rem",
                color: "#e5e7eb"
              }}
            >
              Conexión con Instagram / Facebook
            </h2>
            <p style={{ marginBottom: "0.75rem" }}>
              Aquí podrás conectar la cuenta de Meta (Facebook / Instagram) de
              la agencia para programar publicaciones automáticamente.
            </p>
            <ul
              style={{
                paddingLeft: "1.25rem",
                lineHeight: 1.7,
                margin: 0
              }}
            >
              <li>
                Crea una app en el panel de desarrolladores de Meta y obtén un{" "}
                <code>APP_ID</code> y <code>APP_SECRET</code>.
              </li>
              <li>
                Configura las URLs de redirección en Meta para apuntar a tu
                dominio de Vercel.
              </li>
              <li>
                En una versión posterior, desde aquí podrás iniciar sesión con
                Meta y guardar la conexión en Supabase.
              </li>
            </ul>
            <a
              href="/api/meta/login"
              style={{
                display: "inline-block",
                marginTop: "1rem",
                padding: "0.6rem 1.25rem",
                background: "#3b82f6",
                color: "#fff",
                borderRadius: 6,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem"
              }}
            >
              Probar conexión con Meta
            </a>
          </div>
        </div>
      )}

      {hasDb && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.25rem",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#020617",
            color: "#94a3b8",
            fontSize: "0.9rem"
          }}
        >
          <h2
            style={{
              fontSize: "1.1rem",
              margin: 0,
              marginBottom: "0.5rem",
              color: "#e5e7eb"
            }}
          >
            Respaldo (exportar datos)
          </h2>
          <p style={{ marginBottom: "0.75rem" }}>
            Descarga un archivo <code>.json</code> con las agencias, propiedades,
            media y clientes actuales. Guárdalo en un lugar seguro; más adelante
            podrás usarlo como base para restaurar datos.
          </p>
          <a
            href="/api/admin/backup/export"
            style={{
              display: "inline-block",
              marginTop: "0.25rem",
              padding: "0.6rem 1.25rem",
              background: "#3b82f6",
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.9rem"
            }}
          >
            Exportar respaldo (.json)
          </a>
          <div
            style={{
              marginTop: "1rem",
              borderTop: "1px solid #1f2937",
              paddingTop: "1rem"
            }}
          >
            <p style={{ marginBottom: "0.5rem" }}>
              También puedes importar un archivo de respaldo generado por esta
              herramienta para restaurar datos (se hace un <code>upsert</code>,
              no se borran registros existentes).
            </p>
            <form
              action={importBackup}
              encType="multipart/form-data"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                alignItems: "center"
              }}
            >
              <input
                type="file"
                name="backup_file"
                accept="application/json"
                required
                style={{
                  maxWidth: "260px",
                  color: "#e5e7eb"
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "0.5rem 1.25rem",
                  background: "#0ea5e9",
                  color: "#fff",
                  borderRadius: 6,
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
              >
                Importar respaldo
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

