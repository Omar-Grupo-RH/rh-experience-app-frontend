import CouponAPI from "@/api/CouponAPI";

export function useCoupon() {
  const listCoupons = async () => {
    const { data } = await CouponAPI.allCoupons();

    return data.data ?? [];
  };

  return {
    listCoupons,
  };
}
