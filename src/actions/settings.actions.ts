"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Agency } from "@/types";

function redirectWithError(message: string): never {
  redirect(`/admin/settings?error=${encodeURIComponent(message)}`);
}

export async function updateAgencySettings(formData: FormData) {
  if (!supabaseAdmin) {
    redirectWithError(
      "Supabase no configurado. Revisa SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const id = (formData.get("id") as string | null)?.trim() ?? "";
  if (!id) {
    redirectWithError("No se encontró el ID de la agencia.");
  }

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const phone = (formData.get("phone") as string | null)?.trim() ?? "";
  const address = (formData.get("address") as string | null)?.trim() ?? "";
  const website_domain =
    (formData.get("website_domain") as string | null)?.trim() ?? "";
  const whatsapp_number =
    (formData.get("whatsapp_number") as string | null)?.trim() ?? "";
  const instagram_handle =
    (formData.get("instagram_handle") as string | null)?.trim() ?? "";
  const facebook_page_name =
    (formData.get("facebook_page_name") as string | null)?.trim() ?? "";
  const primary_color =
    (formData.get("primary_color") as string | null)?.trim() ?? "#1a1a2e";
  const secondary_color =
    (formData.get("secondary_color") as string | null)?.trim() ?? "#e94560";

  if (!name) {
    redirectWithError("El nombre de la agencia es obligatorio.");
  }
  if (!email || !email.includes("@")) {
    redirectWithError("Debes ingresar un email válido para la agencia.");
  }

  const { error } = await supabaseAdmin
    .from("agencies")
    .update({
      name,
      email,
      phone: phone || null,
      address: address || null,
      website_domain: website_domain || null,
      whatsapp_number: whatsapp_number || null,
      instagram_handle: instagram_handle || null,
      facebook_page_name: facebook_page_name || null,
      primary_color,
      secondary_color
    })
    .eq("id", id);

  if (error) {
    redirectWithError(error.message);
  }

  redirect("/admin/settings");
}

