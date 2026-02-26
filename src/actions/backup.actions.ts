"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";

type BackupPayload = {
  agencies?: any[];
  properties?: any[];
  property_media?: any[];
  clients?: any[];
};

export async function importBackup(formData: FormData) {
  if (!supabaseAdmin) {
    redirect(
      "/admin/settings?error=" +
        encodeURIComponent("Supabase no está configurado en el servidor.")
    );
  }

  const file = formData.get("backup_file") as File | null;
  if (!file || file.size === 0) {
    redirect(
      "/admin/settings?error=" +
        encodeURIComponent("Debes seleccionar un archivo de respaldo (.json).")
    );
  }

  let payload: BackupPayload;
  try {
    const text = await file.text();
    payload = JSON.parse(text);
  } catch {
    redirect(
      "/admin/settings?error=" +
        encodeURIComponent("El archivo de respaldo no es un JSON válido.")
    );
  }

  const {
    agencies = [],
    properties = [],
    property_media = [],
    clients = []
  } = payload!;

  const errors: string[] = [];

  if (agencies.length > 0) {
    const { error } = await supabaseAdmin
      .from("agencies")
      .upsert(agencies, { onConflict: "id" });
    if (error) errors.push("Agencias: " + error.message);
  }

  if (properties.length > 0) {
    const { error } = await supabaseAdmin
      .from("properties")
      .upsert(properties, { onConflict: "id" });
    if (error) errors.push("Propiedades: " + error.message);
  }

  if (property_media.length > 0) {
    const { error } = await supabaseAdmin
      .from("property_media")
      .upsert(property_media, { onConflict: "id" });
    if (error) errors.push("Media: " + error.message);
  }

  if (clients.length > 0) {
    const { error } = await supabaseAdmin
      .from("clients")
      .upsert(clients, { onConflict: "id" });
    if (error) errors.push("Clientes: " + error.message);
  }

  if (errors.length > 0) {
    redirect(
      "/admin/settings?error=" +
        encodeURIComponent(errors.join(" | "))
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  revalidatePath("/admin/clients");
  redirect(
    "/admin/settings?backupMsg=" +
      encodeURIComponent("Respaldo importado correctamente.")
  );
}

