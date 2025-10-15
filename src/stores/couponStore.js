import { defineStore } from "pinia";
import { ref, computed } from "vue";
import Swal from "sweetalert2";
import { useCoupon } from "@/composables/useCoupon";
export const useCouponStore = defineStore("coupons", () => {
  const { listCoupons } = useCoupon();

  const coupons = ref([]);

  const hasCoupons = computed(() => coupons.value.length > 0);
  const statusCoupon = computed(() => (couponId) => {
    const coupon = coupons.value.find((c) => c.id === couponId);
    return coupon ? coupon.is_active : false;
  });

  async function getCoupons() {
    try {
      const data = await listCoupons();
      coupons.value = data;
    } catch (error) {
      console.log(error);
    }
  }

  return {
    coupons,
    hasCoupons,
    getCoupons,
    statusCoupon,
  };
});
