// ¿Esta instalación tiene datos reales de estudiantes? Hoy NO: todo lo que
// hay en la base de datos (estudiantes, diagnósticos, PIAR, planeaciones,
// usuarios) es ficticio, creado por `db/seed.ts` o a mano por el equipo
// para probar.
//
// Por eso el valor por defecto es "ficticio" y la app lo dice en cada
// pantalla (components/FictionalDataBanner.tsx). Solo se apaga definiendo
// NEXT_PUBLIC_KINESIS_DATOS_REALES=1 al compilar, y eso NO debe hacerse
// antes de cumplir la lista de "Antes de cargar un solo dato real" de
// docs/PRODUCTO_Y_SOSTENIBILIDAD.md (consentimiento de las familias,
// política de tratamiento, copias de seguridad cifradas). Que el aviso sea
// lo normal y quitarlo sea la decisión deliberada es intencional: al revés,
// un olvido dejaría datos reales sin advertencia.
//
// NEXT_PUBLIC_ porque el aviso vive en componentes de cliente; Next lo
// incrusta al compilar.

export const IS_FICTIONAL_DATA = process.env.NEXT_PUBLIC_KINESIS_DATOS_REALES !== "1";
