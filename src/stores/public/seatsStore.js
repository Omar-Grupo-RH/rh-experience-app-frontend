// src/stores/public/seatsStore.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useSeatsStore = defineStore("seats", () => {
  const selectedTripId = ref(null);
  const date = ref(null);
  const selectedSeats = ref([]);
  const passengers = ref([]);

  const normSeat = (s) => String(s);

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
          city: "",
        },
    );
  }

  function toggleSeat(id) {
    const seat = normSeat(id);
    const i = selectedSeats.value.indexOf(seat);
    if (i >= 0) selectedSeats.value.splice(i, 1);
    else selectedSeats.value.push(seat);
    syncPassengersToSeats();
  }

  function setDate(d) {
    date.value = d;
  }

  function resetSeats() {
    selectedSeats.value = [];
    date.value = null;
    passengers.value = [];
  }

  return {
    // state
    selectedTripId,
    date,
    selectedSeats,
    passengers,

    // actions
    toggleSeat,
    setDate,
    syncPassengersToSeats,
    resetSeats,
  };
});
