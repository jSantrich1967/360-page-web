"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

function redirectWithError(message: string): never {
  redirect(`/admin/users/invite?error=${encodeURIComponent(message)}`);
}

/**
 * Server Action: create a new user invitation.
 * De momento usa la primera agencia de la base (igual que propiedades/clientes).
 */
export async function createUserInvitation(formData: FormData) {
  if (!supabaseAdmin) {
    redirectWithError(
      "Supabase no configurado. Asegúrate de tener SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local."
    );
  }

  const { data: agencies } = await supabaseAdmin
    .from("agencies")
    .select("id")
    .limit(1);
  const agencyId = agencies?.[0]?.id;
  if (!agencyId) {
    redirectWithError(
      "No hay ninguna agencia. Ejecuta supabase/seed_agency.sql en Supabase."
    );
  }

  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const role = (formData.get("role") as UserRole | null) ?? "agent";

  if (!email || !email.includes("@")) {
    redirectWithError("Debes ingresar un email válido.");
  }

  const { error } = await supabaseAdmin.from("user_invitations").insert({
    agency_id: agencyId,
    email,
    role
    // token, expires_at y demás campos usan sus defaults del schema
  });

  if (error) {
    if (error.code === "23505") {
      redirectWithError(
        "Ya existe una invitación pendiente para ese email en esta agencia."
      );
    }
    redirectWithError(error.message);
  }

  redirect("/admin/users");
}

