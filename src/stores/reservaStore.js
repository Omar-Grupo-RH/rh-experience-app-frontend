import { useReservation } from "@/composables/useReservation";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useReservaStore = defineStore("reserva", () => {
  const { listEvents, getSeatsByTrip } = useReservation();

  const step = ref(1);
  const selectedSeats = ref([]);
  const selectedTripId = ref(null);
  const date = ref(null);
  const form = ref({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    allergies: [],
    born_date: "",
  });
  const events = ref([]);

  const pricePerSeat = ref(2100);
  const counterDescountSeat = ref(0);
  const counterNormalSeat = ref(0);

  function next() {
    if (step.value < 3) step.value++;
  }
  function prev() {
    if (step.value > 1) step.value--;
  }
  function reset() {
    step.value = 1;
    selectedSeats.value = [];
    date.value = null;
    if (!localStorage.getItem("AUTH_USER")) {
      form.value = { first_name: "", last_name: "", email: "", phone: "" };
    }
  }

  function setDate(d) {
    date.value = d;
  }
  function toggleSeat(id) {
    const i = selectedSeats.value.indexOf(id);
    if (i >= 0) selectedSeats.value.splice(i, 1);
    else selectedSeats.value.push(id);
  }

  function total() {
    return priceBreakdown().total;
  }

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
      breakdownText =
        `${discountedCount} x $${discountedPrice.toLocaleString(
          "es-MX"
        )} MXN | ` +
        `${standardCount} x $${standardPrice.toLocaleString("es-MX")} MXN`;
    }

    return {
      discountedCount,
      standardCount,
      total,
      breakdownText,
    };
  }

  async function loadEvents() {
    try {
      const list = await listEvents();
      events.value = list.map((t) => ({
        id: String(t.id),
        title: t.title,
        start: t.trip_date,
        allDay: true,
      }));
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los eventos", "error");
    }
  }

  async function seatsSold(id) {
    try {
      return await getSeatsByTrip(id);
    } catch (e) {
      console.log(e);
    }
  }

  return {
    step,
    selectedSeats,
    date,
    form,
    pricePerSeat,
    next,
    prev,
    reset,
    setDate,
    loadEvents,
    toggleSeat,
    total,
    events,
    seatsSold,
    selectedTripId,
    priceBreakdown,
  };
});
