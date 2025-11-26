export function formatDateToSpanish(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr + "T00:00:00"); // asegurar zona horaria correcta

  const options = { day: "numeric", month: "long", year: "numeric" };
  return date.toLocaleDateString("es-ES", options);
}

export function formatDateToSpanishShort(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr + "T00:00:00"); // asegurar zona horaria correcta

  const options = { day: "numeric", month: "short", year: "numeric" };
  return date.toLocaleDateString("es-ES", options);
}
