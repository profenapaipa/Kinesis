// Fecha de hoy en Colombia para los encabezados: "Viernes, 16 de octubre".
export function formatToday(): string {
  const text = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Bogota",
  }).format(new Date());
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function firstName(fullName: string): string {
  // Los estudiantes de la demostración se llaman «Estudiante 8A-03»: la primera
  // palabra sola ("Estudiante") no los identifica.
  if (/^Estudiante\s/.test(fullName)) return fullName;
  return fullName.split(" ")[0] ?? fullName;
}
