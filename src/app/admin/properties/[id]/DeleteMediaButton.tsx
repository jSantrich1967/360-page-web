"use client";

import { useTransition } from "react";

type Props = {
  action: (formData: FormData) => void;
  mediaId: string;
  propertyId: string;
  label?: string;
};

/**
 * Delete media button with confirmation. Uses the server action after user confirms.
 */
export function DeleteMediaButton({
  action,
  mediaId,
  propertyId,
  label = "Eliminar"
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirm("¿Eliminar esta foto o video? Esta acción no se puede deshacer.")) return;
    const formData = new FormData();
    formData.set("media_id", mediaId);
    formData.set("property_id", propertyId);
    startTransition(() => {
      action(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "inline" }}>
      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: "0.25rem 0.5rem",
          background: "rgba(239, 68, 68, 0.2)",
          color: "#fca5a5",
          border: "1px solid #ef4444",
          borderRadius: 4,
          cursor: isPending ? "wait" : "pointer",
          fontSize: "0.75rem",
          opacity: isPending ? 0.7 : 1
        }}
      >
        {isPending ? "Eliminando…" : label}
      </button>
    </form>
  );
}
