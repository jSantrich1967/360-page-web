import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

// Always fetch fresh data when visiting admin pages (no cache)
export const dynamic = "force-dynamic";

const navLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.6rem 0.9rem",
  color: "#94a3b8",
  textDecoration: "none",
  fontSize: "0.9rem",
  borderRadius: 999
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e5e7eb",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Top bar (funciona bien en desktop y móvil) */}
      <header
        style={{
          borderBottom: "1px solid #1e293b",
          padding: "0.75rem 1rem"
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap"
          }}
        >
          <Link
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#f1f5f9",
              textDecoration: "none"
            }}
          >
            <Logo variant="compact" showLink={false} />
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Panel Admin</span>
          </Link>

          <nav
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.35rem"
            }}
          >
            <Link href="/admin" style={navLinkStyle}>
              Dashboard
            </Link>
            <Link href="/admin/properties" style={navLinkStyle}>
              Propiedades
            </Link>
            <Link href="/admin/clients" style={navLinkStyle}>
              Clientes
            </Link>
            <Link href="/admin/users" style={navLinkStyle}>
              Usuarios
            </Link>
            <Link href="/admin/settings" style={navLinkStyle}>
              Configuración
            </Link>
            <Link
              href="/"
              style={{
                ...navLinkStyle,
                marginLeft: "0.25rem",
                background: "#111827",
                color: "#e5e7eb"
              }}
            >
              ← Sitio público
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content area */}
      <main
        style={{
          flex: 1,
          padding: "1.5rem 1.25rem",
          background: "#020617"
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto"
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
