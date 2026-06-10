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

  reserveTrip(payload) {
    const idempotencyKey = getReservationIdempotencyKey();

    return api.post("/reservation", payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
  },
};
