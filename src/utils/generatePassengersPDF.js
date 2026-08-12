import { formatDateToSpanish } from "./formatDate";

const parseJSON = (value) => {
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const registrationTypeLabels = {
  internal: "Personal interno",
  alliance: "Alianza",
  prize: "Premio",
  investor: "Inversionista",
  prospect: "Cliente prospecto",
  family_friend: "Invitado extra, familiares o amigos",
};

const getRegistrationTypeLabel = (type) => {
  return registrationTypeLabels[type] || "Sin tipo";
};

export const generatePassengersPDF = async ({
  passengers = [],
  travelSelected = {},
  ticketSearch = "",
} = {}) => {
  const html2pdf = (await import("html2pdf.js")).default;

  const element = document.createElement("div");
  const passengersToExport = passengers;

  const tripDate =
    travelSelected?.trip_date || travelSelected?.[0]?.trip_date || "";

  element.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: #1e40af; font-size: 24px; font-weight: 600; margin-bottom: 10px;">
        RH EXPERIENCE
      </h1>

      <p style="color: #666; font-size: 13px; margin-bottom: 20px;">
        Fecha de salida: ${formatDateToSpanish(tripDate)}
      </p>

      <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">
        Pasajeros (${passengersToExport.length})
      </h2>

      ${
        ticketSearch
          ? `<p style="color: #d94a93; font-size: 12px; margin-bottom: 15px;">
              <strong>Filtro:</strong> RH-${ticketSearch}
            </p>`
          : ""
      }

      ${passengersToExport
        .map((p) => {
          const allergies = parseJSON(p.allergies);
          const healthConditions = parseJSON(p.health_conditions);

          return `
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-bottom: 14px;">
              <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">
                ${p.first_name || ""} ${p.last_name || ""}
              </h3>

              <p style="margin: 4px 0; font-size: 12px;">
                <strong>Código boleto:</strong> ${p.ticket_code || "Sin código"}
              </p>

              <p style="margin: 4px 0; font-size: 12px;">
                <strong>Estado de pago:</strong> ${p.payment_status || ""}
              </p>

              <p style="margin: 4px 0; font-size: 12px;">
                <strong>Asiento:</strong> ${p.seat_id || ""}
              </p>

              <p style="margin: 4px 0; font-size: 12px;">
                <strong>Email:</strong> ${p.email || ""}
              </p>

              <p style="margin: 4px 0; font-size: 12px;">
                <strong>Celular:</strong> ${
                  p.phone_country_code ? `(+${p.phone_country_code}) ` : ""
                }${p.phone || ""}
              </p>

              <p style="margin: 4px 0; font-size: 12px;">
                <strong>Ciudad:</strong> ${p.city || "No registrada"}
              </p>

              <p style="margin: 4px 0; font-size: 12px;">
                <strong>Fecha nacimiento:</strong> ${formatDateToSpanish(
                  p.born_date,
                )}
              </p>

              <p style="margin: 4px 0; font-size: 12px;">
                <strong>Alergias:</strong> ${
                  allergies.length ? allergies.join(", ") : "Sin alergias"
                }
              </p>

              <p style="margin: 4px 0; font-size: 12px;">
                <strong>Condiciones de salud:</strong> ${
                  healthConditions.length
                    ? healthConditions.join(", ")
                    : "Sin problemas de salud"
                }
              </p>

              <p style="margin: 4px 0; font-size: 12px;">
                <strong>Fecha compra:</strong> ${formatDateToSpanish(
                  p.created_at,
                )}
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

              <p style="margin: 4px 0; font-size: 12px;">
                <strong>Tipo inscripción:</strong> ${getRegistrationTypeLabel(
                  p.registration_type,
                )}
              </p>
            </div>
          `;
        })
        .join("")}
    </div>
  `;

  const fileDate = tripDate ? formatDateToSpanish(tripDate) : "sin-fecha";

  const options = {
    margin: 1,
    filename: `lista-pasajeros-${fileDate}.pdf`,
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    },
    jsPDF: {
      unit: "cm",
      format: "a4",
      orientation: "portrait",
    },
  };

  await html2pdf().set(options).from(element).save();
};
