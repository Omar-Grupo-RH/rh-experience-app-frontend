import { describe, it, expect } from "vitest";
import {
  formatDateToSpanish,
  formatDateToSpanishShort,
} from "@/utils/formatDate";

describe("formatDateToSpanish", () => {
  it("formatea una fecha ISO en español largo", () => {
    expect(formatDateToSpanish("2026-01-05")).toBe("5 de enero de 2026");
    expect(formatDateToSpanish("2025-12-31")).toBe("31 de diciembre de 2025");
  });

  it("devuelve cadena vacía sin fecha", () => {
    expect(formatDateToSpanish("")).toBe("");
    expect(formatDateToSpanish(null)).toBe("");
    expect(formatDateToSpanish(undefined)).toBe("");
  });

  it("no se desfasa un día por zona horaria", () => {
    // El sufijo T00:00:00 fija la fecha en hora local
    expect(formatDateToSpanish("2026-06-01")).toContain("1 de junio");
  });
});

describe("formatDateToSpanishShort", () => {
  it("formatea una fecha ISO en español corto", () => {
    expect(formatDateToSpanishShort("2026-01-05")).toBe("5 ene 2026");
  });

  it("devuelve cadena vacía sin fecha", () => {
    expect(formatDateToSpanishShort("")).toBe("");
    expect(formatDateToSpanishShort(null)).toBe("");
  });
});
