"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RemoveGuardianLinkButton({ linkId }: { linkId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    if (!confirm("¿Quitar este vínculo entre acudiente y estudiante?")) return;

    setIsSubmitting(true);
    try {
      await fetch(`/api/admin/guardian-students/${linkId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isSubmitting}>
      Quitar
    </Button>
  );
}
