import { describe, it, expect } from "vitest";
import {
  DEFAULT_BUS_CAPACITY,
  BUS_CAPACITIES,
  normalizeBusCapacity,
  getBusRows,
  STAFF_SEATS,
} from "@/utils/busLayout";

describe("normalizeBusCapacity", () => {
  it("acepta las capacidades permitidas", () => {
    expect(normalizeBusCapacity(8)).toBe(8);
    expect(normalizeBusCapacity(15)).toBe(15);
  });

  it("convierte strings numéricos", () => {
    expect(normalizeBusCapacity("8")).toBe(8);
    expect(normalizeBusCapacity("15")).toBe(15);
  });

  it("usa la capacidad por defecto para valores inválidos", () => {
    expect(normalizeBusCapacity(10)).toBe(DEFAULT_BUS_CAPACITY);
    expect(normalizeBusCapacity(null)).toBe(DEFAULT_BUS_CAPACITY);
    expect(normalizeBusCapacity(undefined)).toBe(DEFAULT_BUS_CAPACITY);
    expect(normalizeBusCapacity("abc")).toBe(DEFAULT_BUS_CAPACITY);
    expect(normalizeBusCapacity(-8)).toBe(DEFAULT_BUS_CAPACITY);
  });
});

describe("getBusRows", () => {
  it("siempre incluye la fila A de staff al inicio", () => {
    for (const capacity of BUS_CAPACITIES) {
      const rows = getBusRows(capacity);
      expect(rows[0]).toEqual({ row: "A", seats: 2 });
    }
  });

  it("la suma de asientos (sin staff) coincide con la capacidad", () => {
    for (const capacity of BUS_CAPACITIES) {
      const rows = getBusRows(capacity);
      const total = rows
        .slice(1)
        .reduce((sum, { seats }) => sum + seats, 0);
      expect(total).toBe(capacity);
    }
  });

  it("capacidad desconocida usa el layout por defecto (15)", () => {
    expect(getBusRows(99)).toEqual(getBusRows(DEFAULT_BUS_CAPACITY));
  });

  it("layout de 8 asientos tiene filas B, C y D", () => {
    const rows = getBusRows(8).map((r) => r.row);
    expect(rows).toEqual(["A", "B", "C", "D"]);
  });

  it("layout de 15 asientos tiene filas B a F", () => {
    const rows = getBusRows(15).map((r) => r.row);
    expect(rows).toEqual(["A", "B", "C", "D", "E", "F"]);
  });
});

describe("STAFF_SEATS", () => {
  it("son los dos asientos de la fila A", () => {
    expect(STAFF_SEATS).toEqual(["A1", "A2"]);
  });
});
