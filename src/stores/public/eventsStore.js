
import { defineStore } from "pinia";
import { ref } from "vue";
import { useReservation } from "@/composables/useReservation";

export const useEventsStore = defineStore("events", () => {
  const { listEvents, getSeatsByTrip } = useReservation();
  const events = ref([]);

  async function loadEvents() {
    const list = await listEvents();
    events.value = list.map((t) => ({
      id: String(t.id),
      title: t.title,
      start: t.trip_date,
      allDay: true,
    }));
  }

  async function seatsSold(tripId) {
    try {
      return await getSeatsByTrip(tripId);
    } catch {
      return [];
    }
  }

  function resetEvents() {
    events.value = [];
  }

  return {
    events,
    loadEvents,
    seatsSold,
    resetEvents,
  };
});
