"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ActivateAcademicPeriodButton({ periodId }: { periodId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setIsSubmitting(true);
    try {
      await fetch(`/api/admin/academic-periods/${periodId}/activate`, { method: "POST" });
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isSubmitting}>
      Activar
    </Button>
  );
}
