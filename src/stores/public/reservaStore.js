import { useReservation } from "@/composables/useReservation";
import { defineStore } from "pinia";
import { ref, watch, computed, inject } from "vue";

export const useReservaStore = defineStore("reserva", () => {
  const { listEvents, getSeatsByTrip, getCouponDiscount } = useReservation();

  // --- STATE ---
  const toast = inject("toast");
  const step = ref(1);
  const selectedSeats = ref([]);
  const selectedTripId = ref(null);
  const date = ref(null);
  const aceptedTerms = ref(false);
  const pricePerSeat = ref(2100);
  const events = ref([]);

  const couponInput = ref("");
  const couponTextBtn = ref("Canjear");
  const discountPercent = ref(0);
  const discountAmount = ref(0);

  const total = ref(0);

  const emailSendTickets = ref({
    emailSent: "",
    confirmEmail: "",
  });

  // --- PASAJEROS ---
  const passengers = ref([]);
  const normSeat = (s) => String(s);

  // Sincroniza pasajeros con asientos seleccionados
  function syncPassengersToSeats() {
    const seats = selectedSeats.value.map(normSeat);
    const prev = new Map(passengers.value.map((p) => [normSeat(p.seat), p]));
    passengers.value = seats.map(
      (seat) =>
        prev.get(seat) || {
          seat,
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          born_date: "",
          allergies: [],
        }
    );
  }

  watch(() => selectedSeats.value.slice(), syncPassengersToSeats, {
    immediate: true,
  });

  // --- VALIDACIONES ---
  const allAdults = computed(() => {
    const today = new Date();
    return passengers.value.every((p) => {
      if (!p.born_date) return false;
      const birth = new Date(p.born_date);
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      const dayDiff = today.getDate() - birth.getDate();
      const realAge =
        monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      return realAge >= 18;
    });
  });

  const sameEmails = computed(() => {
    return (
      emailSendTickets.value.emailSent !== "" &&
      emailSendTickets.value.emailSent === emailSendTickets.value.confirmEmail
    );
  });

  const canContinuePassengers = computed(() => {
    return sameEmails.value && allAdults.value;
  });

  const couponEmpy = computed(() => couponInput.value !== "");

  const couponIsApply = computed(() => discountAmount.value !== 0);

  // --- PRECIOS ---
  function priceBreakdown() {
    const count = selectedSeats.value.length;
    const standardPrice = 2100;
    const discountedPrice = 1900;

    if (count === 0) {
      return {
        discountedCount: 0,
        standardCount: 0,
        total: 0,
        breakdownText: "Sin asientos seleccionados",
      };
    }

    const isEven = count % 2 === 0;
    const discountedCount = isEven ? count : count - 1;
    const standardCount = isEven ? 0 : 1;
    const baseTotal =
      discountedCount * discountedPrice + standardCount * standardPrice;

    let breakdownText = "";
    if (count === 1) {
      breakdownText = `1 x $${standardPrice.toLocaleString("es-MX")} MXN`;
    } else if (standardCount === 0) {
      breakdownText = `${discountedCount} x $${discountedPrice.toLocaleString(
        "es-MX"
      )} MXN`;
    } else {
      breakdownText = `${discountedCount} x $${discountedPrice.toLocaleString(
        "es-MX"
      )} MXN | ${standardCount} x $${standardPrice.toLocaleString(
        "es-MX"
      )} MXN`;
    }

    return { discountedCount, standardCount, total: baseTotal, breakdownText };
  }

  // 🔁 Actualiza total automáticamente cuando cambian asientos o descuento
  function updateTotal() {
    const baseTotal = priceBreakdown().total;
    const discount = baseTotal * discountPercent.value;
    total.value = baseTotal - discount;
  }

  watch([selectedSeats, discountPercent], updateTotal, {
    immediate: true,
    deep: true,
  });

  // --- CUPONES ---
  async function getCoupon(code) {
    couponTextBtn.value = "Buscando...";
    try {
      const { discount } = await getCouponDiscount(code);

      discountPercent.value = Number(discount);

      discountAmount.value = (total.value * discountPercent.value).toFixed(2);
      toast?.open?.({
        message: `Cupón aplicado del ${
          discountPercent.value * 100
        }% de descuento`,
        type: "success",
      });

      couponTextBtn.value = "Canjeado";
    } catch (e) {
      toast?.open?.({
        message: e.response?.data?.message || "Cupón inválido",
        type: "error",
      });
      couponTextBtn.value = "Canjear";
      discountPercent.value = 0;
    }
  }

  // --- EVENTOS Y ASIENTOS ---
  async function loadEvents() {
    try {
      const list = await listEvents();
      events.value = list.map((t) => ({
        id: String(t.id),
        title: t.title,
        start: t.trip_date,
        allDay: true,
      }));
    } catch (err) {
      console.error("No se pudieron cargar los eventos", err);
    }
  }

  async function seatsSold(id) {
    try {
      return await getSeatsByTrip(id);
    } catch {
      return [];
    }
  }

  // --- NAVEGACIÓN DE PASOS ---
  const next = () => step.value < 4 && step.value++;
  const prev = () => step.value > 1 && step.value--;

  // --- MUTADORES ---
  function reset() {
    step.value = 1;
    selectedSeats.value = [];
    date.value = null;
    passengers.value = [];
    discountPercent.value = 0;
    total.value = 0;
  }

  function setDate(d) {
    date.value = d;
  }

  function toggleSeat(id) {
    const seat = normSeat(id);
    const i = selectedSeats.value.indexOf(seat);
    if (i >= 0) selectedSeats.value.splice(i, 1);
    else selectedSeats.value.push(seat);
  }

  // --- RETURN ---
  return {
    // State
    step,
    selectedSeats,
    selectedTripId,
    date,
    passengers,
    pricePerSeat,
    events,
    aceptedTerms,
    emailSendTickets,
    couponInput,
    couponTextBtn,
    discountPercent,
    discountAmount,
    total,

    // Getters
    priceBreakdown,
    canContinuePassengers,
    allAdults,
    sameEmails,
    couponEmpy,
    couponIsApply,

    // Actions
    next,
    prev,
    reset,
    setDate,
    loadEvents,
    toggleSeat,
    seatsSold,
    getCoupon,
  };
});
