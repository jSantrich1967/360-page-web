"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { CreatePropertyInput, CurrencyType, PropertyStatus, PropertyType } from "@/types";

/**
 * Generates a URL-friendly slug from code (unique per agency in DB).
 */
function slugFromCode(code: string): string {
  const base = code
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `prop-${Date.now()}`;
}

/**
 * Server Action: create a new property.
 * Uses the first agency in the DB if no auth yet (for development).
 */
function redirectWithError(message: string): never {
  redirect(`/admin/properties/new?error=${encodeURIComponent(message)}`);
}

export async function createProperty(formData: FormData) {
  if (!supabaseAdmin) {
    redirectWithError("Supabase no configurado. Añade SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local");
  }

  // Get first agency (multi-tenant: later we'll use the logged-in user's agency_id)
  const { data: agencies } = await supabaseAdmin
    .from("agencies")
    .select("id")
    .limit(1);
  const agencyId = agencies?.[0]?.id;
  if (!agencyId) {
    redirectWithError("No hay ninguna agencia. Crea una agencia en Supabase (tabla agencies) y vuelve a intentar.");
  }

  const code = (formData.get("code") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";
  const price = Number(formData.get("price"));
  const currency = (formData.get("currency") as CurrencyType) || "USD";
  const property_type = (formData.get("property_type") as PropertyType) || "house";
  const status = (formData.get("status") as PropertyStatus) || "available";
  const state = (formData.get("state") as string)?.trim() || "";
  const city = (formData.get("city") as string)?.trim() || "";
  const bedrooms = Number(formData.get("bedrooms")) || 0;
  const bathrooms = Number(formData.get("bathrooms")) || 0;
  const parking = Number(formData.get("parking")) || 0;

  if (!code || !title) {
    redirectWithError("Código y título son obligatorios.");
  }
  if (isNaN(price) || price < 0) {
    redirectWithError("Precio debe ser un número mayor o igual a 0.");
  }

  const slug = slugFromCode(code);
  const featuresStr = (formData.get("features") as string)?.trim() || "";
  const tagsStr = (formData.get("tags") as string)?.trim() || "";
  const features = featuresStr ? featuresStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const tags = tagsStr ? tagsStr.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const input: CreatePropertyInput = {
    code,
    title,
    description,
    price,
    currency,
    property_type,
    status,
    state,
    city,
    bedrooms,
    bathrooms,
    parking,
    features,
    tags
  };

  // Optional fields
  const area = (formData.get("area") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const built_area_m2 = formData.get("built_area_m2") ? Number(formData.get("built_area_m2")) : undefined;
  const land_area_m2 = formData.get("land_area_m2") ? Number(formData.get("land_area_m2")) : undefined;
  const floors = formData.get("floors") ? Number(formData.get("floors")) : undefined;
  if (area) input.area = area;
  if (address) input.address = address;
  if (built_area_m2 != null && !isNaN(built_area_m2)) input.built_area_m2 = built_area_m2;
  if (land_area_m2 != null && !isNaN(land_area_m2)) input.land_area_m2 = land_area_m2;
  if (floors != null && !isNaN(floors)) input.floors = floors;

  const { error } = await supabaseAdmin.from("properties").insert({
    agency_id: agencyId,
    code: input.code,
    slug,
    title: input.title,
    description: input.description,
    price: input.price,
    currency: input.currency,
    property_type: input.property_type,
    status: input.status,
    country: "Venezuela",
    state: input.state,
    city: input.city,
    area: input.area ?? null,
    address: input.address ?? null,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    parking: input.parking,
    built_area_m2: input.built_area_m2 ?? null,
    land_area_m2: input.land_area_m2 ?? null,
    floors: input.floors ?? 1,
    features: input.features,
    tags: input.tags
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "Ya existe una propiedad con ese código en esta agencia."
        : error.message;
    redirectWithError(message);
  }

  revalidatePath("/admin/properties");
  revalidatePath("/admin");
  redirect("/admin/properties");
}

function redirectEditWithError(id: string, message: string): never {
  redirect(`/admin/properties/${id}/edit?error=${encodeURIComponent(message)}`);
}

/**
 * Server Action: update an existing property.
 */
export async function updateProperty(formData: FormData) {
  if (!supabaseAdmin) {
    redirect("/admin/properties");
  }

  const id = (formData.get("id") as string)?.trim();
  if (!id) {
    redirect("/admin/properties");
  }

  const code = (formData.get("code") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";
  const price = Number(formData.get("price"));
  const currency = (formData.get("currency") as CurrencyType) || "USD";
  const property_type = (formData.get("property_type") as PropertyType) || "house";
  const status = (formData.get("status") as PropertyStatus) || "available";
  const state = (formData.get("state") as string)?.trim() || "";
  const city = (formData.get("city") as string)?.trim() || "";
  const bedrooms = Number(formData.get("bedrooms")) || 0;
  const bathrooms = Number(formData.get("bathrooms")) || 0;
  const parking = Number(formData.get("parking")) || 0;

  if (!code || !title) {
    redirectEditWithError(id, "Código y título son obligatorios.");
  }
  if (isNaN(price) || price < 0) {
    redirectEditWithError(id, "Precio debe ser un número mayor o igual a 0.");
  }

  const slug = slugFromCode(code);
  const featuresStr = (formData.get("features") as string)?.trim() || "";
  const tagsStr = (formData.get("tags") as string)?.trim() || "";
  const features = featuresStr ? featuresStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const tags = tagsStr ? tagsStr.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const area = (formData.get("area") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const built_area_m2 = formData.get("built_area_m2") ? Number(formData.get("built_area_m2")) : null;
  const land_area_m2 = formData.get("land_area_m2") ? Number(formData.get("land_area_m2")) : null;
  const floors = formData.get("floors") ? Number(formData.get("floors")) : 1;

  const { error } = await supabaseAdmin
    .from("properties")
    .update({
      code,
      slug,
      title,
      description,
      price,
      currency,
      property_type,
      status,
      state,
      city,
      area,
      address,
      bedrooms,
      bathrooms,
      parking,
      built_area_m2,
      land_area_m2,
      floors,
      features,
      tags,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      redirectEditWithError(id, "Ya existe otra propiedad con ese código en esta agencia.");
    }
    redirectEditWithError(id, error.message);
  }

  revalidatePath(`/admin/properties/${id}`);
  revalidatePath("/admin/properties");
  revalidatePath("/admin");
  redirect(`/admin/properties/${id}`);
}
