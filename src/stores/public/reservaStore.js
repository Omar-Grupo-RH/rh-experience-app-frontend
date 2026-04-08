// src/stores/public/reservaStore.js
import { defineStore, storeToRefs } from "pinia";
import { ref, computed, watch, inject } from "vue";

import { useCouponsStore } from "./couponsStore";
import { useSeatsStore } from "./seatsStore";
import { useEventsStore } from "./eventsStore";

import {
  validatePassengers,
  validateEmails,
  validatePayer,
} from "@/composables/usePassengerValidation";

export const useReservaStore = defineStore("reserva", () => {
  //const coupons = useCouponsStore();
  const seats = useSeatsStore();
  const evts = useEventsStore();

  const { selectedSeats, selectedTripId, date, passengers, pricePerSeat } =
    storeToRefs(seats);

  // const { couponInput, couponTextBtn, discountPercent, couponId } =
  //   storeToRefs(coupons);

  const { events } = storeToRefs(evts);

  const toast = inject("toast");
  const step = ref(1);
  const aceptedTerms = ref(false);
  const modal = ref(false);
  //const subtotal = ref(0);

  const emailSendTickets = ref({
    emailSent: "",
    confirmEmail: "",
    nameSent: "",
  });

  const payer = ref({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    is_client: false,
    advisor_name: "",
    is_first_visit: false,
  });

  const validationErrors = ref([]);

  const _passengersValidation = validatePassengers(passengers, selectedSeats);
  const allAdults = computed(() => _passengersValidation.value.allAdults);
  const requiredFieldsFilled = computed(
    () => _passengersValidation.value.requiredFilled,
  );

  const sameEmails = validateEmails(emailSendTickets);

  const validatePayerForm = validatePayer(payer);

  // Sincroniza errores para depuración/UI
  watch(
    _passengersValidation,
    (v) => {
      validationErrors.value = v.errors.slice();
    },
    { immediate: true },
  );

  const validationState = computed(() => ({
    sameEmails: sameEmails.value,
    allAdults: allAdults.value,
    requiredFieldsFilled: requiredFieldsFilled.value,
    canContinuePassengers: false,
    lastErrors: validationErrors.value.slice(),
  }));

  const canContinuePassengers = computed(() => {
    const ok =
      sameEmails.value && allAdults.value && requiredFieldsFilled.value;
    validationState.value.canContinuePassengers = ok;
    return ok;
  });

  const canPay = computed(() => {
    return validatePayerForm.value && aceptedTerms.value;
  });

  // ---------- Precios (misma lógica / mismos nombres)
  // function priceBreakdown() {
  //   const count = selectedSeats.value.length;
  //   const standardPrice = 2100;
  //   const discountedPrice = 1900;

  //   if (count === 0) {
  //     return {
  //       discountedCount: 0,
  //       standardCount: 0,
  //       total: 0,
  //       breakdownText: "Sin asientos seleccionados",
  //     };
  //   }

  //   const isEven = count % 2 === 0;
  //   const discountedCount = isEven ? count : count - 1;
  //   const standardCount = isEven ? 0 : 1;
  //   const baseTotal =
  //     discountedCount * discountedPrice + standardCount * standardPrice;
  //   subtotal.value = baseTotal;
  //   let breakdownText = "";
  //   if (count === 1) {
  //     breakdownText = `1 x $${standardPrice.toLocaleString("es-MX")} MXN`;
  //   } else if (standardCount === 0) {
  //     breakdownText = `${discountedCount} x $${discountedPrice.toLocaleString(
  //       "es-MX",
  //     )} MXN`;
  //   } else {
  //     breakdownText = `${discountedCount} x $${discountedPrice.toLocaleString(
  //       "es-MX",
  //     )} MXN | ${standardCount} x $${standardPrice.toLocaleString(
  //       "es-MX",
  //     )} MXN`;
  //   }

  //   return { discountedCount, standardCount, total: baseTotal, breakdownText };
  // }

  // Mantén estos nombres como ref (igual que antes)
  // const discountAmount = ref(0);
  // const total = ref(0);

  // function updateTotal() {
  //   const baseTotal = priceBreakdown().total;
  //   const discount = baseTotal * discountPercent?.value;
  //   discountAmount.value = Number(discount.toFixed(2));
  //   total.value = baseTotal - discount;
  // }

  // 👇 Ahora sí: refs reales, sin warnings
  // watch([selectedSeats, discountPercent], updateTotal, {
  //   immediate: true,
  //   deep: true,
  // });

  // ---------- Cupones (fachada con mismo nombre getCoupon)
  // async function getCoupon(code) {
  //   couponTextBtn.value = "Buscando...";
  //   try {
  //     const { discountPercent: d } = await coupons.applyCoupon(code);
  //     updateTotal(); // recalc
  //     toast?.open?.({
  //       message: `Cupón aplicado del ${d * 100}% de descuento`,
  //       type: "success",
  //     });
  //   } catch (e) {
  //     toast?.open?.({
  //       message: e?.response?.data?.message || "Cupón inválido",
  //       type: "error",
  //     });
  //     coupons.resetCoupons();
  //     updateTotal();
  //   }
  // }

  // ---------- Eventos (fachada con mismos nombres)
  async function loadEvents() {
    try {
      await evts.loadEvents();
    } catch (err) {
      console.error("No se pudieron cargar los eventos", err);
    }
  }

  async function seatsSold(id) {
    return await evts.seatsSold(id);
  }

  // ---------- Navegación y reset (misma API)
  const next = () => step.value < 5 && step.value++;
  const prev = () => step.value > 1 && step.value--;

  function reset() {
    step.value = 1;
    seats.resetSeats();
    coupons.resetCoupons();
    discountAmount.value = 0;
    total.value = 0;
  }

  // ---------- Auxiliares (mismo API)
  // const couponEmpy = computed(() => couponInput.value !== "");
  // const couponIsApply = computed(() => discountAmount.value !== 0);

  // ---------- Exposición (MISMO contrato público)
  return {
    // State
    step,
    selectedSeats,
    selectedTripId,
    date,
    passengers,
    //pricePerSeat,
    events,
    aceptedTerms,
    emailSendTickets,
    //couponInput,
    //couponTextBtn,
    //discountPercent,
    //discountAmount,
    //total,
    //couponId,
    modal,
    //subtotal,
    payer,

    // Getters
    //priceBreakdown,
    canContinuePassengers,
    canPay,
    allAdults,
    sameEmails,
    //couponEmpy,
    //couponIsApply,
    validationErrors,

    // Actions
    next,
    prev,
    reset,
    setDate: seats.setDate,
    loadEvents,
    toggleSeat: seats.toggleSeat,
    seatsSold,
    //getCoupon,
  };
});
