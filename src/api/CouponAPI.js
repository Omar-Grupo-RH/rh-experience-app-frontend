import api from "@/lib/axios";

export default {
  allCoupons() {
    return api.get("/coupons");
  },
  addCoupon(payload) {
    return api.post("/coupon", payload);
  },
  deleteCoupon(id) {
    return api.post("/coupon/destroy", { id });
  },
};
