"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ToggleUserActiveButton({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setIsSubmitting(true);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isSubmitting}>
      {isActive ? "Desactivar" : "Activar"}
    </Button>
  );
}
