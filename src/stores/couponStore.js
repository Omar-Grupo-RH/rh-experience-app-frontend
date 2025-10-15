import { defineStore } from "pinia";
import { ref, computed } from "vue";
import Swal from "sweetalert2";
import { useCoupon } from "@/composables/useCoupon";
export const useCouponStore = defineStore("coupons", () => {
  const { listCoupons, storeCoupon } = useCoupon();

  const coupons = ref([]);

  const hasCoupons = computed(() => coupons.value.length > 0);

  const statusCoupon = computed(() => (couponId) => {
    const coupon = coupons.value.find((c) => c.id === couponId);

    return coupon.is_active === "1" ? true : false;
  });

  const isExpiredOrUsedUp = computed(() => (couponId) => {
    const coupon = coupons.value.find((c) => c.id === couponId);
    const today = new Date().toISOString().split("T")[0];

    return coupon.expiry_date < today;
  });

  async function getCoupons() {
    try {
      const data = await listCoupons();
      coupons.value = data;
    } catch (error) {
      console.log(error);
    }
  }

  async function createCoupon(payload) {
    try {
      const { data: newCoupon } = await storeCoupon(payload);
      Swal.fire({
        title: `${newCoupon.code} agregado correctamente`,
        text: "El cupon ha sido registrado.",
        icon: "success",
        timer: 2000,
      });
      coupons.value.push(newCoupon);
    } catch (error) {
      Swal.fire({
        title: error.response.data.error,
        icon: "error",
        timer: 2000,
      });
    }
  }

  return {
    coupons,
    isExpiredOrUsedUp,
    hasCoupons,
    createCoupon,
    getCoupons,
    statusCoupon,
  };
});
