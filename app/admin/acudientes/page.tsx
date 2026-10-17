import type { Metadata } from "next";
import { CreateGuardianLinkForm } from "@/components/admin/CreateGuardianLinkForm";
import { RemoveGuardianLinkButton } from "@/components/admin/RemoveGuardianLinkButton";
import { PanelHeader } from "@/components/panel/Panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { listGuardianLinks } from "@/lib/data/guardianStudents";
import { listUsers } from "@/lib/data/users";

export const metadata: Metadata = { title: "Acudientes · Administración" };

export default async function AdminGuardiansPage() {
  const session = await requireSession();
  const [links, guardians, students] = await Promise.all([
    listGuardianLinks(session),
    listUsers(session, "padre"),
    listUsers(session, "estudiante"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PanelHeader
        size="compact"
        eyebrow="Administración"
        title="Acudientes"
        description={<>{links.length} vínculo(s) entre acudiente y estudiante.</>}
      />

      <CreateGuardianLinkForm guardians={guardians} students={students} />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Acudiente</th>
                  <th className="px-4 py-2 font-medium">Estudiante</th>
                  <th className="px-4 py-2 font-medium">Parentesco</th>
                  <th className="px-4 py-2 font-medium">Diagnóstico</th>
                  <th className="px-4 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {links.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      Todavía no hay vínculos creados.
                    </td>
                  </tr>
                ) : (
                  links.map((link) => (
                    <tr key={link.id} className="border-b last:border-0">
                      <td className="px-4 py-2">{link.guardianFullName}</td>
                      <td className="px-4 py-2">{link.studentFullName}</td>
                      <td className="px-4 py-2 text-muted-foreground">{link.relationship}</td>
                      <td className="px-4 py-2">
                        {link.authorizedForDiagnosis ? (
                          <Badge variant="secondary">Autorizado</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            No autorizado
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <RemoveGuardianLinkButton linkId={link.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
