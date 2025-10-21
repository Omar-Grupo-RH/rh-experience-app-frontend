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
    return selectedSeats.value.length * pricePerSeat.value;
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
  };
});
