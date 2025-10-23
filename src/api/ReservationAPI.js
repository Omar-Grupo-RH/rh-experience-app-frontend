import api from "@/lib/axios";

export default {
  allTrips() {
    return api.get("/trips");
  },

  getTripById(id) {
    return api.get("/trip", { params: { id } });
  },

  getCoupon(code) {
    return api.get("/payment/coupon", { params: { code } });
  },
};
