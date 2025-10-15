import CouponAPI from "@/api/CouponAPI";

export function useCoupon() {
  const listCoupons = async () => {
    const { data } = await CouponAPI.allCoupons();

    return data.data ?? [];
  };

  const storeCoupon = async (payload) => {
    const { data } = await CouponAPI.addCoupon(payload);
    return data ?? [];
  };

  return {
    listCoupons,
    storeCoupon,
  };
}
