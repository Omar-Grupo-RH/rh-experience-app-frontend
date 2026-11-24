import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSeatsStore } from "@/stores/public/seatsStore";

describe("seatsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("inicia vacío", () => {
    const store = useSeatsStore();

    expect(store.selectedSeats).toEqual([]);
    expect(store.passengers).toEqual([]);
    expect(store.selectedTripId).toBeNull();
    expect(store.date).toBeNull();
  });

  it("toggleSeat agrega el asiento y crea su pasajero vacío", () => {
    const store = useSeatsStore();

    store.toggleSeat("B1");

    expect(store.selectedSeats).toEqual(["B1"]);
    expect(store.passengers).toHaveLength(1);
    expect(store.passengers[0]).toMatchObject({
      seat: "B1",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      born_date: "",
      city: "",
      allergies: [],
      health_conditions: [],
    });
  });

  it("toggleSeat sobre un asiento ya elegido lo quita junto con su pasajero", () => {
    const store = useSeatsStore();

    store.toggleSeat("B1");
    store.toggleSeat("B1");

    expect(store.selectedSeats).toEqual([]);
    expect(store.passengers).toEqual([]);
  });

  it("conserva los datos capturados al agregar más asientos", () => {
    const store = useSeatsStore();

    store.toggleSeat("B1");
    store.passengers[0].first_name = "Ana";
    store.passengers[0].email = "ana@example.com";

    store.toggleSeat("B2");

    expect(store.passengers).toHaveLength(2);
    const b1 = store.passengers.find((p) => p.seat === "B1");
    expect(b1.first_name).toBe("Ana");
    expect(b1.email).toBe("ana@example.com");
  });

  it("al quitar un asiento solo elimina al pasajero de ese asiento", () => {
    const store = useSeatsStore();

    store.toggleSeat("B1");
    store.toggleSeat("B2");
    store.passengers.find((p) => p.seat === "B2").first_name = "Luis";

    store.toggleSeat("B1");

    expect(store.selectedSeats).toEqual(["B2"]);
    expect(store.passengers).toHaveLength(1);
    expect(store.passengers[0].first_name).toBe("Luis");
  });

  it("setDate asigna la fecha", () => {
    const store = useSeatsStore();

    store.setDate("2026-12-01");

    expect(store.date).toBe("2026-12-01");
  });

  it("resetSeats limpia todo el estado", () => {
    const store = useSeatsStore();

    store.toggleSeat("B1");
    store.setDate("2026-12-01");
    store.selectedTripId = 5;

    store.resetSeats();

    expect(store.selectedSeats).toEqual([]);
    expect(store.passengers).toEqual([]);
    expect(store.selectedTripId).toBeNull();
    expect(store.date).toBeNull();
  });
});
