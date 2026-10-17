import type { Metadata } from "next";
import { CreateSupportCategoryForm } from "@/components/admin/CreateSupportCategoryForm";
import { ToggleSupportCategoryButton } from "@/components/admin/ToggleSupportCategoryButton";
import { PanelHeader } from "@/components/panel/Panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { listSupportCategories } from "@/lib/data/supportCategories";

export const metadata: Metadata = { title: "Categorías de apoyo · Administración" };

export default async function AdminSupportCategoriesPage() {
  const session = await requireSession();
  const categories = await listSupportCategories(session, true);

  return (
    <div className="flex flex-col gap-6">
      <PanelHeader
        size="compact"
        eyebrow="Administración"
        title="Categorías de apoyo"
        description={<>Reemplazan el listado fijo de ajustes anterior — el profesor las usa al registrar apoyos efectivos y seguimiento de cada estudiante.</>}
      />

      <CreateSupportCategoryForm />

      <div className="flex flex-col gap-2">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="flex items-start justify-between gap-3 py-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{category.name}</span>
                  {!category.isActive && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inactiva
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{category.description}</p>
                <p className="text-xs text-muted-foreground">
                  Para el estudiante: “{category.studentFriendlyText}”
                </p>
              </div>
              <ToggleSupportCategoryButton categoryId={category.id} isActive={category.isActive} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
