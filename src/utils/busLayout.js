// Debe coincidir con Trip::SEAT_LAYOUTS en backend-experience/models/Trip.php
export const DEFAULT_BUS_CAPACITY = 15;
export const BUS_CAPACITIES = [8, 15];

// La fila A siempre está ocupada (staff) y no cuenta en la capacidad.
const STAFF_ROW = { row: "A", seats: 2 };

const BUS_LAYOUTS = {
  8: [
    { row: "B", seats: 2 },
    { row: "C", seats: 3 },
    { row: "D", seats: 3 },
  ],
  15: [
    { row: "B", seats: 2 },
    { row: "C", seats: 3 },
    { row: "D", seats: 3 },
    { row: "E", seats: 3 },
    { row: "F", seats: 4 },
  ],
};

export function normalizeBusCapacity(capacity) {
  const value = Number(capacity);
  return BUS_CAPACITIES.includes(value) ? value : DEFAULT_BUS_CAPACITY;
}

export function getBusRows(capacity) {
  return [STAFF_ROW, ...BUS_LAYOUTS[normalizeBusCapacity(capacity)]];
}

export const STAFF_SEATS = Array.from(
  { length: STAFF_ROW.seats },
  (_, i) => `${STAFF_ROW.row}${i + 1}`,
);
