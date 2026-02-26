import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem"
      }}
    >
      <Logo variant="default" showLink={true} />
      <p style={{ maxWidth: 600, textAlign: "center", opacity: 0.8 }}>
        Admin panel + public website + automated social media publishing
        powered by Supabase and Meta Graph API.
      </p>
      <Link
        href="/admin"
        style={{
          marginTop: "1rem",
          padding: "0.75rem 1.5rem",
          background: "#3b82f6",
          color: "#fff",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600
        }}
      >
        Ir al Panel Admin
      </Link>
    </main>
  );
}

