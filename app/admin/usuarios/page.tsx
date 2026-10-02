import type { Metadata } from "next";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { ToggleUserActiveButton } from "@/components/admin/ToggleUserActiveButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/users";
import type { Role } from "@/types";

export const metadata: Metadata = { title: "Usuarios · Administración" };

const ROLE_LABEL: Record<Role, string> = {
  administrador: "Administrador",
  docente: "Profesor",
  estudiante: "Estudiante",
  padre: "Padre / Madre",
  orientador: "Orientador/a",
};

export default async function AdminUsersPage() {
  const session = await requireSession();
  const users = await listUsers(session);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-muted-foreground">{users.length} usuario(s) registrados.</p>
      </div>

      <CreateUserForm />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Nombre</th>
                  <th className="px-4 py-2 font-medium">Usuario</th>
                  <th className="px-4 py-2 font-medium">Rol</th>
                  <th className="px-4 py-2 font-medium">Estado</th>
                  <th className="px-4 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="px-4 py-2">{user.fullName}</td>
                    <td className="px-4 py-2 text-muted-foreground">{user.username}</td>
                    <td className="px-4 py-2">
                      <Badge variant="outline">{ROLE_LABEL[user.role]}</Badge>
                    </td>
                    <td className="px-4 py-2">
                      {user.isActive ? (
                        <Badge variant="secondary">Activo</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Inactivo
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <ToggleUserActiveButton userId={user.id} isActive={user.isActive} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
