import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return new Response(
      `Error devuelto por Meta: ${error}. Revisa los permisos en developers.facebook.com.`,
      { status: 400 }
    );
  }

  if (!code) {
    return new Response(
      "No se recibió ningún código de autorización desde Meta.",
      { status: 400 }
    );
  }

  // De momento solo mostramos un mensaje informativo.
  // En una versión posterior, aquí intercambiaremos el code por tokens
  // y los guardaremos en la tabla meta_connections en Supabase.

  return new Response(
    `Conexión con Meta iniciada correctamente. Código recibido: ${code}. (Pendiente implementar intercambio por tokens)`,
    { status: 200 }
  );
}

