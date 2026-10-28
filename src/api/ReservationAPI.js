// src/api/ReservationAPI.js
import api from "@/lib/axios";

function getReservationIdempotencyKey() {
  let key = sessionStorage.getItem("reservation_idempotency_key");

  if (!key) {
    key = crypto.randomUUID();
    sessionStorage.setItem("reservation_idempotency_key", key);
  }

  return key;
}

export function clearReservationIdempotencyKey() {
  sessionStorage.removeItem("reservation_idempotency_key");
}

export default {
  allTrips() {
    return api.get("/trips");
  },

  passengerByEmail(email) {
    return api.get("/passengerVerifyEmail", { params: { email } });
  },

  getTripById(id) {
    return api.get("/trip", { params: { id } });
  },

  getCoupon(code) {
    return api.get("/payment/coupon", { params: { code } });
  },

  reserveTrip(payload, passengerDocuments = {}) {
    const idempotencyKey = getReservationIdempotencyKey();

    const formData = new FormData();

    formData.append("payload", JSON.stringify(payload));

    payload.passengers.forEach((passenger, index) => {
      const seat = String(passenger.seat_id);
      const documents = passengerDocuments[seat];

      if (!(documents?.front instanceof File)) {
        throw new Error(`Falta el frente del INE del pasajero ${index + 1}.`);
      }

      if (!(documents?.back instanceof File)) {
        throw new Error(`Falta el reverso del INE del pasajero ${index + 1}.`);
      }

      formData.append(`ine_front_${index}`, documents.front);

      formData.append(`ine_back_${index}`, documents.back);
    });

    return api.post("/reservation", formData, {
      headers: {
        "Idempotency-Key": idempotencyKey,
        "Content-Type": undefined,
      },
      transformRequest: [(data) => data],
    });
  },

  updatePassenger(payload) {
    return api.post("/passengers/update", payload);
  },

  reschedulePassenger(payload) {
    return api.post("/passenger/reschedule", payload);
  },

  resendPassengerTickets(payload) {
    return api.post("/passenger/resend-tickets", payload);
  },

  deletePassenger(payload) {
    return api.post("/passenger/delete", payload);
  },

  updateAttendanceStatus(payload) {
    return api.post("/passenger/attendance", payload);
  },

  downloadPassengerDocuments(payload) {
    return api.post("/passenger/documents", payload, {
      responseType: "blob",
    });
  },
};
