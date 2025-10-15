import CouponAPI from "@/api/CouponAPI";

export function useCoupon() {
  const listCoupons = async () => {
    const { data } = await CouponAPI.allCoupons();

    return data.data ?? [];
  };
  const showCoupon = async (payload) => {
    const { data } = await CouponAPI.getCoupon(payload);
    return data ?? [];
  };
  const storeCoupon = async (payload) => {
    const { data } = await CouponAPI.addCoupon(payload);
    return data ?? [];
  };
  const modifyCoupon = async (payload) => {
    const { data } = await CouponAPI.updateCoupon(payload);
    return data ?? [];
  };
  const destroyCoupon = async (payload) => {
    const { data } = await CouponAPI.deleteCoupon(payload);
    return data ?? [];
  };

  return {
    listCoupons,
    storeCoupon,
    destroyCoupon,
    showCoupon,
    modifyCoupon,
  };
}
