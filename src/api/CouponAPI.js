import api from "@/lib/axios";

export default {
  allCoupons() {
    return api.get("/coupons");
  },
  addCoupon(payload) {
    return api.post("/coupon", payload);
  },
  updateCoupon(payload) {
    return api.post("/coupon/update", payload);
  },
  getCoupon(id) {
    return api.get("/coupon", { params: { id } });
  },
  deleteCoupon(id) {
    return api.post("/coupon/destroy", { id });
  },
};
