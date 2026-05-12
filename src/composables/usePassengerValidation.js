
import { computed } from "vue";


export function isValidDateStr(s) {
  if (typeof s !== "string" || !s.trim()) return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}

export function getAgeFromISO(iso) {
  if (!isValidDateStr(iso)) return -1;
  const b = new Date(iso + "T00:00:00");
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida arreglo de pasajeros
 * - required: first_name, last_name, email, phone, born_date
 * - email válido
 * - born_date válido y >= 18 años
 */
export function validatePassengers(passengersRef, selectedSeatsRef) {
  return computed(() => {
    const passengers = passengersRef.value || [];
    const required = ["first_name", "last_name", "email", "phone", "born_date", "city"];
    const errors = [];

    // Asientos seleccionados
    if (!selectedSeatsRef || (selectedSeatsRef.value || []).length === 0) {
      errors.push("No hay asientos seleccionados.");
      return { ok: false, errors, allAdults: false, requiredFilled: false };
    }

    // Cantidad consistente
    if (passengers.length !== selectedSeatsRef.value.length) {
      errors.push(
        `Desfase: pasajeros (${passengers.length}) != asientos (${selectedSeatsRef.value.length}).`
      );
      return { ok: false, errors, allAdults: false, requiredFilled: false };
    }

    let allAdults = true;
    let requiredFilled = true;

    passengers.forEach((p, i) => {
      required.forEach((k) => {
        const v = p[k] ?? "";
        const ok = typeof v === "string" ? v.trim().length > 0 : Boolean(v);
        if (!ok) {
          errors.push(`Pasajero ${i + 1} (${p.seat}): "${k}" vacío.`);
          requiredFilled = false;
        }
      });

      if (
        p.email &&
        typeof p.email === "string" &&
        !EMAIL_RE.test(p.email.trim())
      ) {
        errors.push(
          `Pasajero ${i + 1} (${p.seat}): email con formato inválido.`
        );
        requiredFilled = false;
      }

      if (!p.born_date || !isValidDateStr(p.born_date)) {
        errors.push(
          `Pasajero ${i + 1} (${p.seat}): born_date vacío/ inválido.`
        );
        requiredFilled = false;
        allAdults = false;
      } else {
        const age = getAgeFromISO(p.born_date);
        if (age < 18) {
          errors.push(
            `Pasajero ${i + 1} (${p.seat}): es menor de edad (${age}).`
          );
          allAdults = false;
        }
      }
    });

    const ok = errors.length === 0 && allAdults && requiredFilled;
    return { ok, errors, allAdults, requiredFilled };
  });
}


