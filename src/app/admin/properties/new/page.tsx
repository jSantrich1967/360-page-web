import Link from "next/link";
import { createProperty } from "@/actions/property.actions";
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

const PROPERTY_TYPES = [
  "house",
  "apartment",
  "office",
  "land",
  "commercial",
  "warehouse",
  "parking",
  "other"
] as const;

const CURRENCIES = ["USD", "EUR", "ARS", "COP", "MXN", "CLP", "PEN", "BRL"] as const;

export default async function NewPropertyPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const hasDb = !!supabaseAdmin;

  if (!hasDb) {
    return (
      <div>
        <Link href="/admin/properties" style={{ color: "#94a3b8", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
          ← Volver al listado
        </Link>
        <p style={{ color: "#94a3b8" }}>
          Configura Supabase en <code>.env.local</code> para poder crear propiedades.
        </p>
      </div>
    );
  }

  return (
    <>
      <Link href="/admin/properties" style={{ color: "#94a3b8", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
        ← Volver al listado
      </Link>
      <h1 style={{ margin: "0 0 1rem", fontSize: "1.75rem" }}>
        Nueva propiedad
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
        action={createProperty}
        style={{
          maxWidth: 560,
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem"
        }}
      >
        <div>
          <label htmlFor="code" style={labelStyle}>
            Código *
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            placeholder="Ej. PROP-001"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="title" style={labelStyle}>
            Título *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Ej. Casa amplia en zona residencial"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="description" style={labelStyle}>
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Descripción de la propiedad..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="price" style={labelStyle}>
              Precio *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step={0.01}
              required
              defaultValue={0}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="currency" style={labelStyle}>
              Moneda
            </label>
            <select id="currency" name="currency" style={inputStyle}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="property_type" style={labelStyle}>
              Tipo
            </label>
            <select id="property_type" name="property_type" style={inputStyle}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" style={labelStyle}>
              Estado
            </label>
            <select id="status" name="status" style={inputStyle}>
              <option value="available">Disponible</option>
              <option value="reserved">Reservada</option>
              <option value="sold">Vendida</option>
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="state" style={labelStyle}>
              Estado / Región *
            </label>
            <input id="state" name="state" type="text" required placeholder="Ej. Miranda" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="city" style={labelStyle}>
              Ciudad *
            </label>
            <input id="city" name="city" type="text" required placeholder="Ej. Caracas" style={inputStyle} />
          </div>
        </div>
        <div>
          <label htmlFor="area" style={labelStyle}>
            Zona / Área
          </label>
          <input id="area" name="area" type="text" placeholder="Ej. Las Mercedes" style={inputStyle} />
        </div>
        <div>
          <label htmlFor="address" style={labelStyle}>
            Dirección
          </label>
          <input id="address" name="address" type="text" placeholder="Calle, número..." style={inputStyle} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="bedrooms" style={labelStyle}>
              Habitaciones
            </label>
            <input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              defaultValue={0}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="bathrooms" style={labelStyle}>
              Baños
            </label>
            <input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              defaultValue={0}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="parking" style={labelStyle}>
              Estacionamientos
            </label>
            <input
              id="parking"
              name="parking"
              type="number"
              min={0}
              defaultValue={0}
              style={inputStyle}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="built_area_m2" style={labelStyle}>
              m² construidos
            </label>
            <input id="built_area_m2" name="built_area_m2" type="number" min={0} step={0.01} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="land_area_m2" style={labelStyle}>
              m² terreno
            </label>
            <input id="land_area_m2" name="land_area_m2" type="number" min={0} step={0.01} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="floors" style={labelStyle}>
              Pisos
            </label>
            <input id="floors" name="floors" type="number" min={1} defaultValue={1} style={inputStyle} />
          </div>
        </div>
        <div>
          <label htmlFor="features" style={labelStyle}>
            Características (separadas por coma)
          </label>
          <input
            id="features"
            name="features"
            type="text"
            placeholder="piscina, jardín, seguridad 24h"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="tags" style={labelStyle}>
            Etiquetas (separadas por coma)
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            placeholder="lujo, vista al mar"
            style={inputStyle}
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
            Crear propiedad
          </button>
          <Link
            href="/admin/properties"
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
