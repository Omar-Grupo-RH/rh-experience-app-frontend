// src/stores/public/couponsStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { useReservation } from "@/composables/useReservation";

export const useCouponsStore = defineStore("coupons", () => {
  const { getCouponDiscount } = useReservation();

  // Estado de cupones
  const couponInput = ref("");
  const couponTextBtn = ref("Canjear");
  const discountPercent = ref(0);
  const couponId = ref(null);

  // Acción: validar/aplicar cupón (no muestra toasts; eso que lo haga quien llame)
  async function applyCoupon(code) {
    couponTextBtn.value = "Buscando...";
    const { discount, id } = await getCouponDiscount(code);
    discountPercent.value = Number(discount) || 0;
    couponId.value = id;
    couponTextBtn.value = "Canjeado";
    return { discountPercent: discountPercent.value, couponId: couponId.value };
  }

  // Reset de cupones
  function resetCoupons() {
    couponInput.value = "";
    couponTextBtn.value = "Canjear";
    discountPercent.value = 0;
    couponId.value = null;
  }

  return {
    // state
    couponInput,
    couponTextBtn,
    discountPercent,
    couponId,
    // actions
    applyCoupon,
    resetCoupons,
  };
});
