import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

// Always fetch fresh data when visiting admin pages (no cache)
export const dynamic = "force-dynamic";

// Shared styles for the admin panel (dark theme)
const sidebarStyle: React.CSSProperties = {
  width: 240,
  minHeight: "100vh",
  background: "#0f172a",
  borderRight: "1px solid #1e293b",
  padding: "1.5rem 0"
};

const navLinkStyle: React.CSSProperties = {
  display: "block",
  padding: "0.75rem 1.5rem",
  color: "#94a3b8",
  textDecoration: "none",
  fontSize: "0.95rem"
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={{ padding: "0 1.5rem 1.5rem", borderBottom: "1px solid #1e293b" }}>
          <Link
            href="/admin"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.4rem",
              color: "#f1f5f9",
              textDecoration: "none"
            }}
          >
            <Logo variant="compact" showLink={false} />
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Panel Admin</span>
          </Link>
        </div>
        <nav style={{ marginTop: "1rem" }}>
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
          <Link href="/" style={{ ...navLinkStyle, marginTop: "1rem" }}>
            ← Volver al sitio
          </Link>
        </nav>
      </aside>
      {/* Main content area */}
      <main
        style={{
          flex: 1,
          background: "#0f172a",
          color: "#e5e7eb",
          padding: "2rem",
          overflow: "auto"
        }}
      >
        {children}
      </main>
    </div>
  );
}
