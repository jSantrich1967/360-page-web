import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Property } from "@/types";

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
  padding: "0.6rem 0.8rem",
  background: "#0f172a",
  color: "#94a3b8",
  fontSize: "0.8rem",
  fontWeight: 600,
  whiteSpace: "nowrap"
};

const tdStyle: React.CSSProperties = {
  padding: "0.6rem 0.8rem",
  borderTop: "1px solid #334155",
  color: "#e2e8f0",
  fontSize: "0.9rem"
};

const statusStyle = (status: string): React.CSSProperties => ({
  padding: "0.25rem 0.5rem",
  borderRadius: 4,
  fontSize: "0.8125rem",
  ...(status === "available"
    ? { background: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }
    : status === "reserved"
      ? { background: "rgba(234, 179, 8, 0.2)", color: "#eab308" }
      : { background: "rgba(148, 163, 184, 0.2)", color: "#94a3b8" })
});

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

export default async function AdminPropertiesPage({
  searchParams
}: {
  searchParams: Promise<{
    city?: string;
    area?: string;
    minPrice?: string;
    maxPrice?: string;
    minBedrooms?: string;
  }>;
}) {
  const { city, area, minPrice, maxPrice, minBedrooms } = await searchParams;

  const hasDb = !!supabaseAdmin;
  let properties: Property[] = [];
  let error = false;

  if (hasDb) {
    let query = supabaseAdmin
      .from("properties")
      .select("id, code, slug, title, status, city, area, price, currency, bedrooms")
      .order("created_at", { ascending: false })
      .limit(50);

    if (city && city.trim().length > 0) {
      query = query.ilike("city", `%${city.trim()}%`);
    }
    if (area && area.trim().length > 0) {
      query = query.ilike("area", `%${area.trim()}%`);
    }
    if (minPrice && !Number.isNaN(Number(minPrice))) {
      query = query.gte("price", Number(minPrice));
    }
    if (maxPrice && !Number.isNaN(Number(maxPrice))) {
      query = query.lte("price", Number(maxPrice));
    }
    if (minBedrooms && !Number.isNaN(Number(minBedrooms))) {
      query = query.gte("bedrooms", Number(minBedrooms));
    }

    const res = await query;
    if (res.error) error = true;
    else properties = (res.data ?? []) as Property[];
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1
            style={{
              margin: "0 0 0.5rem",
              fontSize: "clamp(1.4rem, 3vw, 1.75rem)"
            }}
          >
            Propiedades
          </h1>
          <p style={{ color: "#94a3b8", margin: 0 }}>
            {hasDb && !error
              ? `Listado de propiedades (${properties.length} mostradas).`
              : "Aquí verás el listado de propiedades de tu agencia. Configura Supabase y ejecuta las migraciones para ver datos reales."}
          </p>
        </div>
        {hasDb && !error && (
          <Link
            href="/admin/properties/new"
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
            Nueva propiedad
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
              htmlFor="city"
              style={{
                display: "block",
                marginBottom: "0.25rem",
                color: "#94a3b8",
                fontSize: "0.8rem"
              }}
            >
              Ciudad
            </label>
            <input
              id="city"
              name="city"
              defaultValue={city ?? ""}
              placeholder="Ej. Caracas"
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
              htmlFor="area"
              style={{
                display: "block",
                marginBottom: "0.25rem",
                color: "#94a3b8",
                fontSize: "0.8rem"
              }}
            >
              Zona / Área
            </label>
            <input
              id="area"
              name="area"
              defaultValue={area ?? ""}
              placeholder="Ej. Las Mercedes"
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
              htmlFor="minPrice"
              style={{
                display: "block",
                marginBottom: "0.25rem",
                color: "#94a3b8",
                fontSize: "0.8rem"
              }}
            >
              Precio mínimo
            </label>
            <input
              id="minPrice"
              name="minPrice"
              type="number"
              min={0}
              defaultValue={minPrice ?? ""}
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
              htmlFor="maxPrice"
              style={{
                display: "block",
                marginBottom: "0.25rem",
                color: "#94a3b8",
                fontSize: "0.8rem"
              }}
            >
              Precio máximo
            </label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              min={0}
              defaultValue={maxPrice ?? ""}
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
              htmlFor="minBedrooms"
              style={{
                display: "block",
                marginBottom: "0.25rem",
                color: "#94a3b8",
                fontSize: "0.8rem"
              }}
            >
              Mín. habitaciones
            </label>
            <input
              id="minBedrooms"
              name="minBedrooms"
              type="number"
              min={0}
              defaultValue={minBedrooms ?? ""}
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
              href="/admin/properties"
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
          Error al cargar propiedades. ¿Ejecutaste las migraciones SQL en Supabase?
        </div>
      )}

      {hasDb && !error && (
        <>
          {properties.length === 0 ? (
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
              Aún no hay propiedades. Próximamente podrás crearlas desde aquí.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Código</th>
                    <th style={thStyle}>Título</th>
                    <th style={thStyle}>Ciudad</th>
                    <th style={thStyle}>Precio</th>
                    <th style={thStyle}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p.id}>
                      <td style={tdStyle}>
                        <code style={{ background: "#334155", padding: "0.2rem 0.4rem", borderRadius: 4 }}>
                          {p.code}
                        </code>
                      </td>
                      <td style={tdStyle}>
                        <Link
                          href={`/admin/properties/${p.id}`}
                          style={{ color: "#3b82f6", textDecoration: "none" }}
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td style={tdStyle}>{p.city}</td>
                      <td style={tdStyle}>{formatPrice(p.price, p.currency)}</td>
                      <td style={tdStyle}>
                        <span style={statusStyle(p.status)}>{p.status}</span>
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
