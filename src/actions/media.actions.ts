"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { MediaType, VideoType } from "@/types";

// Bucket name used for property media in Supabase Storage
const BUCKET_NAME = "property-media";

function redirectWithError(propertyId: string, message: string): never {
  const url =
    propertyId && propertyId.length > 0
      ? `/admin/properties/${propertyId}?mediaError=${encodeURIComponent(message)}`
      : `/admin/properties?mediaError=${encodeURIComponent(message)}`;
  redirect(url);
}

/**
 * Server Action: upload a single media file (image or video) for a property.
 * - Uploads the file to Supabase Storage bucket "property-media"
 * - Inserts a row into the property_media table
 */
export async function uploadPropertyMedia(formData: FormData) {
  if (!supabaseAdmin) {
    redirectWithError("", "Supabase no está configurado.");
  }

  const propertyId = (formData.get("property_id") as string | null)?.trim() ?? "";
  const file = formData.get("file") as File | null;
  const mediaType = formData.get("media_type") as MediaType | null;
  const videoType = (formData.get("video_type") as VideoType | null) ?? null;

  if (!propertyId) {
    redirectWithError("", "Falta el ID de la propiedad.");
  }
  if (!file || file.size === 0) {
    redirectWithError(propertyId, "Debes seleccionar un archivo.");
  }
  if (!mediaType) {
    redirectWithError(propertyId, "Debes indicar si es imagen o video.");
  }

  // Get property to know its agency_id (needed for storage path and DB row)
  const { data: property, error: propertyError } = await supabaseAdmin
    .from("properties")
    .select("id, agency_id")
    .eq("id", propertyId)
    .single();

  if (propertyError || !property) {
    redirectWithError(propertyId, "Propiedad no encontrada.");
  }

  const extension = file.name.includes(".")
    ? file.name.split(".").pop() || "bin"
    : "bin";

  const folder = mediaType === "video" ? "videos" : "images";
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;

  const filePath = `${property.agency_id}/properties/${property.id}/${folder}/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined
    });

  if (uploadError) {
    redirectWithError(
      propertyId,
      `Error subiendo el archivo: ${uploadError.message}`
    );
  }

  // Get public URL for displaying in the admin
  const { data: publicData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  const publicUrl = publicData.publicUrl;

  // Insert metadata row into property_media table
  const { error: dbError } = await supabaseAdmin.from("property_media").insert({
    property_id: property.id,
    agency_id: property.agency_id,
    media_type: mediaType,
    video_type: mediaType === "video" ? videoType : null,
    url: publicUrl,
    storage_path: filePath,
    thumbnail_url: null,
    watermarked_url: null,
    is_cover: false,
    sort_order: 0,
    width: null,
    height: null,
    duration_sec: null,
    size_bytes: file.size,
    mime_type: file.type || null,
    metadata: {}
  });

  if (dbError) {
    redirectWithError(
      propertyId,
      `Error guardando en la base de datos: ${dbError.message}`
    );
  }

  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/admin/properties");
  revalidatePath("/admin");
  // Añadimos un indicador en la query para mostrar un mensaje de éxito en la página
  redirect(`/admin/properties/${propertyId}?mediaSuccess=1`);
}

/**
 * Server Action: delete a single media item (image or video) for a property.
 * - Removes the file from Supabase Storage
 * - Deletes the row from property_media table
 */
export async function deletePropertyMedia(formData: FormData) {
  if (!supabaseAdmin) {
    redirectWithError("", "Supabase no está configurado.");
  }

  const mediaId = (formData.get("media_id") as string | null)?.trim() ?? "";
  const propertyId = (formData.get("property_id") as string | null)?.trim() ?? "";

  if (!mediaId) {
    redirectWithError(propertyId, "Falta el ID del media.");
  }

  // Get the media row to obtain storage_path and property_id for redirect
  const { data: mediaRow, error: fetchError } = await supabaseAdmin
    .from("property_media")
    .select("id, property_id, storage_path")
    .eq("id", mediaId)
    .single();

  if (fetchError || !mediaRow) {
    redirectWithError(propertyId, "Media no encontrado.");
  }

  const propId = mediaRow.property_id as string;
  const storagePath = mediaRow.storage_path as string;

  // Delete file from Storage (ignore errors if file already missing)
  await supabaseAdmin.storage.from(BUCKET_NAME).remove([storagePath]);

  // Delete row from property_media
  const { error: dbError } = await supabaseAdmin
    .from("property_media")
    .delete()
    .eq("id", mediaId);

  if (dbError) {
    redirectWithError(propId, `Error al eliminar: ${dbError.message}`);
  }

  revalidatePath(`/admin/properties/${propId}`);
  revalidatePath("/admin/properties");
  revalidatePath("/admin");
  redirect(`/admin/properties/${propId}`);
}

