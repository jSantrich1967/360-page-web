"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";

function redirectWithError(message: string): never {
  redirect(`/admin/clients/new?error=${encodeURIComponent(message)}`);
}

/**
 * Server Action: create a new client.
 * Uses the first agency in the DB (for development; later use logged-in user's agency).
 */
export async function createClient(formData: FormData) {
  if (!supabaseAdmin) {
    redirectWithError("Supabase no configurado. Configura .env.local con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.");
  }

  const { data: agencies } = await supabaseAdmin
    .from("agencies")
    .select("id")
    .limit(1);
  const agencyId = (agencies as any[])?.[0]?.id;
  if (!agencyId) {
    redirectWithError("No hay ninguna agencia. Ejecuta supabase/seed_agency.sql en Supabase.");
  }

  const first_name = (formData.get("first_name") as string)?.trim() || "";
  const last_name = (formData.get("last_name") as string)?.trim() || "";
  const phone = (formData.get("phone") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim() || null;
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const source = (formData.get("source") as string)?.trim() || null;

  if (!first_name || !last_name) {
    redirectWithError("Nombre y apellido son obligatorios.");
  }
  if (!phone) {
    redirectWithError("El teléfono es obligatorio.");
  }

  const { error } = await supabaseAdmin.from("clients").insert({
    agency_id: agencyId,
    first_name,
    last_name,
    email: email || null,
    phone,
    whatsapp: whatsapp || null,
    notes: notes || null,
    source: source || null,
    is_active: true
  });

  if (error) {
    redirectWithError(error.message);
  }

  redirect("/admin/clients");
}
