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
  return fullName.split(" ")[0] ?? fullName;
}
