import { NextRequest } from "next/server";

const META_AUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth";

export async function GET(_req: NextRequest) {
  const appId = process.env.META_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!appId) {
    return new Response(
      "META_APP_ID no está configurado en el entorno (.env.local).",
      { status: 500 }
    );
  }

  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/meta/callback`;

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "instagram_basic",
      "instagram_content_publish"
    ].join(","),
    state: "agency-meta-connect" // en producción deberíamos usar un state aleatorio y verificarlo
  });

  const url = `${META_AUTH_URL}?${params.toString()}`;

  return Response.redirect(url);
}

