import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * API route: export a JSON backup of core tables.
 * - agencies
 * - properties
 * - property_media
 * - clients
 */
export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase not configured on server." },
      { status: 500 }
    );
  }

  try {
    const [agenciesRes, propertiesRes, mediaRes, clientsRes] = await Promise.all([
      supabaseAdmin.from("agencies").select("*"),
      supabaseAdmin.from("properties").select("*"),
      supabaseAdmin.from("property_media").select("*"),
      supabaseAdmin.from("clients").select("*")
    ]);

    if (agenciesRes.error || propertiesRes.error || mediaRes.error || clientsRes.error) {
      const message =
        agenciesRes.error?.message ??
        propertiesRes.error?.message ??
        mediaRes.error?.message ??
        clientsRes.error?.message ??
        "Unknown error while reading tables.";

      return NextResponse.json({ error: message }, { status: 500 });
    }

    const payload = {
      generatedAt: new Date().toISOString(),
      agencies: agenciesRes.data ?? [],
      properties: propertiesRes.data ?? [],
      property_media: mediaRes.data ?? [],
      clients: clientsRes.data ?? []
    };

    const fileName = `backup-360-page-web-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.json`;

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected error while generating backup." },
      { status: 500 }
    );
  }
}

