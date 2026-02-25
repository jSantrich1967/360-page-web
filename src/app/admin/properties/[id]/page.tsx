import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";
import { uploadPropertyMedia, deletePropertyMedia } from "@/actions/media.actions";
import { deleteProperty } from "@/actions/property.actions";
import { DeleteMediaButton } from "./DeleteMediaButton";
import type { Property, PropertyMedia } from "@/types";

export default async function AdminPropertyDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mediaError?: string }>;
}) {
  const { id } = await params;
  const { mediaError } = await searchParams;

  const hasDb = !!supabaseAdmin;
  let property: Property | null = null;
  let media: PropertyMedia[] = [];

  if (hasDb) {
    const res = await supabaseAdmin
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();
    property = res.data as Property | null;

    if (property) {
      const mediaRes = await supabaseAdmin
        .from("property_media")
        .select("*")
        .eq("property_id", property.id)
        .order("sort_order", { ascending: true });
      media = (mediaRes.data as PropertyMedia[] | null) ?? [];
    }
  }

  if (!hasDb || !property) {
    return (
      <div>
        <Link
          href="/admin/properties"
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
          {!hasDb ? "Supabase no configurado." : "Propiedad no encontrada."}
        </p>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/admin/properties"
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
        {property.title}
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        Código:{" "}
        <code
          style={{
            background: "#334155",
            padding: "0.2rem 0.4rem",
            borderRadius: 4
          }}
        >
          {property.code}
        </code>
        {" · "}
        {property.city}, {property.state}
        {" · "}
        <span style={{ fontWeight: 600 }}>
          {new Intl.NumberFormat("es", {
            style: "currency",
            currency: property.currency
          }).format(property.price)}
        </span>
      </p>

      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 8,
          padding: "1.5rem",
          whiteSpace: "pre-wrap",
          color: "#e2e8f0"
        }}
      >
        {property.description}
      </div>

      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap"
        }}
      >
        <Link
          href={`/admin/properties/${property.id}/edit`}
          style={{
            padding: "0.5rem 1rem",
            background: "#3b82f6",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.875rem"
          }}
        >
          Editar propiedad
        </Link>
        <form action={deleteProperty} style={{ display: "inline" }}>
          <input type="hidden" name="id" value={property.id} />
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
            Eliminar propiedad
          </button>
        </form>
      </div>

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
          Media (fotos y videos)
        </h2>

        {mediaError && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #ef4444",
              borderRadius: 8,
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              color: "#fca5a5",
              fontSize: "0.875rem"
            }}
          >
            {mediaError}
          </div>
        )}

        {media.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            Aún no hay fotos ni videos para esta propiedad.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem"
            }}
          >
            {media.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#0f172a",
                  borderRadius: 8,
                  border: "1px solid #1e293b",
                  padding: "0.5rem"
                }}
              >
                {item.media_type === "image" ? (
                  <img
                    src={item.url}
                    alt={property.title}
                    style={{
                      width: "100%",
                      borderRadius: 6,
                      display: "block",
                      objectFit: "cover",
                      maxHeight: 220
                    }}
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    style={{
                      width: "100%",
                      borderRadius: 6,
                      maxHeight: 220
                    }}
                  />
                )}
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    fontSize: "0.75rem",
                    color: "#94a3b8"
                  }}
                >
                  <span>
                    {item.media_type === "image" ? "Imagen" : "Video"}
                    {item.video_type ? ` · ${item.video_type}` : ""}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {item.is_cover && (
                      <span
                        style={{
                          padding: "0.1rem 0.4rem",
                          borderRadius: 999,
                          background: "rgba(59,130,246,0.15)",
                          color: "#3b82f6"
                        }}
                      >
                        Portada
                      </span>
                    )}
                    <DeleteMediaButton
                      action={deletePropertyMedia}
                      mediaId={item.id}
                      propertyId={property.id}
                    />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <form
          action={uploadPropertyMedia}
          encType="multipart/form-data"
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            maxWidth: 520
          }}
        >
          <input type="hidden" name="property_id" value={property.id} />

          <div>
            <label
              htmlFor="file"
              style={{
                display: "block",
                marginBottom: "0.25rem",
                color: "#94a3b8",
                fontSize: "0.875rem"
              }}
            >
              Archivo (imagen o video) *
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "0.75rem",
                marginTop: "0.25rem",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 6,
                color: "#e5e7eb",
                fontSize: "0.9rem",
                cursor: "pointer"
              }}
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
              <label
                htmlFor="media_type"
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                  color: "#94a3b8",
                  fontSize: "0.875rem"
                }}
              >
                Tipo de media *
              </label>
              <select
                id="media_type"
                name="media_type"
                required
                style={{
                  width: "100%",
                  padding: "0.4rem 0.6rem",
                  background: "#1e293b",
                  borderRadius: 6,
                  border: "1px solid #334155",
                  color: "#e5e7eb",
                  fontSize: "0.875rem"
                }}
              >
                <option value="image">Imagen</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="video_type"
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                  color: "#94a3b8",
                  fontSize: "0.875rem"
                }}
              >
                Tipo de video (opcional)
              </label>
              <select
                id="video_type"
                name="video_type"
                style={{
                  width: "100%",
                  padding: "0.4rem 0.6rem",
                  background: "#1e293b",
                  borderRadius: 6,
                  border: "1px solid #334155",
                  color: "#e5e7eb",
                  fontSize: "0.875rem"
                }}
              >
                <option value="">—</option>
                <option value="reel">Reel</option>
                <option value="tour">Tour</option>
                <option value="general">General</option>
              </select>
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
              fontSize: "0.875rem",
              cursor: "pointer"
            }}
          >
            Subir archivo
          </button>
        </form>
      </section>
    </>
  );
}

