import { describe, it, expect } from "vitest";
import { ref } from "vue";
import {
  isValidDateStr,
  getAgeFromISO,
  EMAIL_RE,
  validatePassengers,
} from "@/composables/usePassengerValidation";

// Construye una fecha ISO restando años a la fecha actual
function isoYearsAgo(years, extraDays = 0) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() - extraDays);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function buildPassenger(overrides = {}) {
  return {
    seat: "B1",
    first_name: "Ana",
    last_name: "López",
    email: "ana@example.com",
    phone: "9991234567",
    born_date: isoYearsAgo(30),
    city: "Mérida",
    ...overrides,
  };
}

describe("isValidDateStr", () => {
  it("acepta fechas ISO válidas", () => {
    expect(isValidDateStr("2000-05-20")).toBe(true);
  });

  it("rechaza valores inválidos", () => {
    expect(isValidDateStr("")).toBe(false);
    expect(isValidDateStr("   ")).toBe(false);
    expect(isValidDateStr("no-fecha")).toBe(false);
    expect(isValidDateStr(null)).toBe(false);
    expect(isValidDateStr(20000520)).toBe(false);
  });
});

describe("getAgeFromISO", () => {
  it("calcula la edad correcta", () => {
    expect(getAgeFromISO(isoYearsAgo(30))).toBe(30);
    expect(getAgeFromISO(isoYearsAgo(18))).toBe(18);
  });

  it("quien cumple 18 mañana sigue siendo menor", () => {
    // nació hace 18 años menos un día => aún tiene 17
    expect(getAgeFromISO(isoYearsAgo(18, -1))).toBe(17);
  });

  it("devuelve -1 para fechas inválidas", () => {
    expect(getAgeFromISO("invalida")).toBe(-1);
    expect(getAgeFromISO("")).toBe(-1);
  });
});

describe("EMAIL_RE", () => {
  it("valida formatos básicos de email", () => {
    expect(EMAIL_RE.test("ana@example.com")).toBe(true);
    expect(EMAIL_RE.test("a.b+c@sub.dominio.mx")).toBe(true);
    expect(EMAIL_RE.test("sin-arroba")).toBe(false);
    expect(EMAIL_RE.test("a@b")).toBe(false);
    expect(EMAIL_RE.test("con espacios@x.com")).toBe(false);
  });
});

describe("validatePassengers", () => {
  it("falla sin asientos seleccionados", () => {
    const result = validatePassengers(ref([]), ref([]));
    expect(result.value.ok).toBe(false);
    expect(result.value.errors).toContain("No hay asientos seleccionados.");
  });

  it("falla si pasajeros y asientos no coinciden", () => {
    const result = validatePassengers(
      ref([buildPassenger()]),
      ref(["B1", "B2"]),
    );
    expect(result.value.ok).toBe(false);
    expect(result.value.errors[0]).toMatch(/Desfase/);
  });

  it("acepta pasajeros adultos con datos completos", () => {
    const passengers = ref([
      buildPassenger({ seat: "B1" }),
      buildPassenger({ seat: "B2", email: "otro@example.com" }),
    ]);
    const result = validatePassengers(passengers, ref(["B1", "B2"]));

    expect(result.value.ok).toBe(true);
    expect(result.value.errors).toEqual([]);
    expect(result.value.allAdults).toBe(true);
    expect(result.value.requiredFilled).toBe(true);
  });

  it("rechaza menores de edad", () => {
    const passengers = ref([
      buildPassenger({ born_date: isoYearsAgo(17) }),
    ]);
    const result = validatePassengers(passengers, ref(["B1"]));

    expect(result.value.ok).toBe(false);
    expect(result.value.allAdults).toBe(false);
    expect(result.value.errors.some((e) => e.includes("menor de edad"))).toBe(
      true,
    );
  });

  it("rechaza campos obligatorios vacíos", () => {
    const passengers = ref([buildPassenger({ city: "" })]);
    const result = validatePassengers(passengers, ref(["B1"]));

    expect(result.value.ok).toBe(false);
    expect(result.value.requiredFilled).toBe(false);
    expect(result.value.errors.some((e) => e.includes('"city" vacío'))).toBe(
      true,
    );
  });

  it("rechaza email con formato inválido", () => {
    const passengers = ref([buildPassenger({ email: "mal-formato" })]);
    const result = validatePassengers(passengers, ref(["B1"]));

    expect(result.value.ok).toBe(false);
    expect(
      result.value.errors.some((e) => e.includes("email con formato inválido")),
    ).toBe(true);
  });

  it("es reactivo: corregir los datos vuelve válido el resultado", () => {
    const passengers = ref([buildPassenger({ first_name: "" })]);
    const result = validatePassengers(passengers, ref(["B1"]));

    expect(result.value.ok).toBe(false);

    passengers.value = [buildPassenger()];
    expect(result.value.ok).toBe(true);
  });
});
