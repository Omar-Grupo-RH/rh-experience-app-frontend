import { useReservation } from "@/composables/useReservation";
import { defineStore } from "pinia";
import { ref, watch, computed } from "vue";

export const useReservaStore = defineStore("reserva", () => {
  const { listEvents, getSeatsByTrip } = useReservation();

  

  const step = ref(1);
  const selectedSeats = ref([]);
  const selectedTripId = ref(null);
  const date = ref(null);
  const aceptedTerms = ref(false);
  const pricePerSeat = ref(2100);
  const events = ref([]);

  const emailSendTickets = ref({
    emailSent: "",
    confirmEmail: "",
  });

  const sameEmails = computed(() => {
    return (
      emailSendTickets.value.emailSent !== "" &&
      emailSendTickets.value.emailSent === emailSendTickets.value.confirmEmail
    );
  });

  // Pasajeros (uno por asiento seleccionado)
  const passengers = ref([]);
  const normSeat = (s) => String(s);

  const next = () => {
    if (step.value < 4) step.value++;
  };
  const prev = () => {
    if (step.value > 1) step.value--;
  };

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

  // Dispara en push/splice/reorden e inicia hidratado
  watch(() => selectedSeats.value.slice(), syncPassengersToSeats, {
    immediate: true,
  });

  // Precios

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
    const total =
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
    return { discountedCount, standardCount, total, breakdownText };
  }
  const total = () => priceBreakdown().total;

  // Eventos

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

  // Mutadores
  function reset() {
    step.value = 1;
    selectedSeats.value = [];
    date.value = null;
    passengers.value = [];
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

  return {
    // state
    step,
    selectedSeats,
    selectedTripId,
    date,
    passengers,
    pricePerSeat,
    events,
    aceptedTerms,
    emailSendTickets,

    // getters
    total,
    priceBreakdown,

    // actions
    next,
    prev,
    reset,
    setDate,
    loadEvents,
    toggleSeat,
    seatsSold,
    sameEmails,
  };
});
