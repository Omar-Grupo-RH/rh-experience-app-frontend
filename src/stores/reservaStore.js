import { defineStore } from "pinia";
import { ref } from "vue";

export const useReservaStore = defineStore("reserva", () => {
  const step = ref(1);
  const selectedSeats = ref([]);
  const date = ref(null);
  const form = ref({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const pricePerSeat = ref(100);

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
    form.value = { first_name: "", last_name: "", email: "", phone: "" };
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
    toggleSeat,
    total,
  };
});
