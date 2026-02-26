import Link from "next/link";

/**
 * Logo 360 Realty Agency.
 * Renders the image located in /public/logo-360.png.
 * (Coloca tu archivo de logo en public/logo-360.png para verlo exactamente igual.)
 */
export function Logo({
  variant = "default",
  showLink = true
}: {
  variant?: "default" | "compact";
  showLink?: boolean;
}) {
  const isCompact = variant === "compact";

  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <img
        src="/logo-360.png"
        alt="360 Realty Agency"
        style={{
          display: "block",
          width: isCompact ? 140 : 360,
          height: "auto"
        }}
      />
    </div>
  );

  if (showLink) {
    return (
      <Link
        href="/"
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "inline-flex"
        }}
      >
        {content}
      </Link>
    );
  }

  return content;
}
