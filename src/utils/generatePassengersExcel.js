import * as XLSX from "xlsx";
import { formatDateToSpanish } from "./formatDate";

const registrationTypeLabels = {
  internal: "Personal interno",
  alliance: "Alianza",
  prize: "Premio",
  investor: "Inversionista",
  prospect: "Cliente prospecto",
  family_friend: "Invitado extra, familiares o amigos",
};

const parseJSON = (value) => {
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const formatList = (value, fallback) => {
  const items = parseJSON(value);
  return items.length ? items.join(", ") : fallback;
};

const getTripDate = (travelSelected) => {
  return travelSelected?.trip_date || travelSelected?.[0]?.trip_date || "";
};

const getFileDate = (tripDate) => {
  const match = String(tripDate).match(/^\d{4}-\d{2}-\d{2}/);
  return match?.[0] || "sin-fecha";
};

export const generatePassengersExcel = ({
  passengers = [],
  travelSelected = {},
} = {}) => {
  const rows = passengers.map((passenger) => ({
    Nombre: passenger.first_name || "",
    Apellidos: passenger.last_name || "",
    "Código de boleto": passenger.ticket_code || "Sin código",
    "Estado de pago": passenger.payment_status || "",
    Asiento: passenger.seat_id || "",
    Email: passenger.email || "",
    Celular: `${
      passenger.phone_country_code ? `(+${passenger.phone_country_code}) ` : ""
    }${passenger.phone || ""}`,
    Ciudad: passenger.city || "No registrada",
    "Fecha de nacimiento": passenger.born_date
      ? formatDateToSpanish(passenger.born_date)
      : "",
    Alergias: formatList(passenger.allergies, "Sin alergias"),
    "Condiciones de salud": formatList(
      passenger.health_conditions,
      "Sin problemas de salud",
    ),
    "Fecha de compra": passenger.created_at
      ? formatDateToSpanish(passenger.created_at)
      : "",
    "Tipo de inscripción":
      registrationTypeLabels[passenger.registration_type] || "Sin tipo",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 20 },
    { wch: 24 },
    { wch: 20 },
    { wch: 18 },
    { wch: 10 },
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
    { wch: 30 },
    { wch: 35 },
    { wch: 20 },
    { wch: 32 },
  ];

  if (rows.length) {
    worksheet["!autofilter"] = { ref: worksheet["!ref"] };
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pasajeros");

  const tripDate = getTripDate(travelSelected);
  XLSX.writeFile(workbook, `lista-pasajeros-${getFileDate(tripDate)}.xlsx`);
};
