import { defineStore } from "pinia";
import { ref } from "vue";
import { useReservation } from "@/composables/useReservation";

export const useEventsStore = defineStore("events", () => {
  const { listEvents, getSeatsByTrip } = useReservation();

  const events = ref([]);

  const MAX_SEATS_PER_TRIP = 15;

  function normalizeTripSeats(trip) {
    const totalSeats = Number(
      trip?.total_seats ?? trip?.total_seat ?? MAX_SEATS_PER_TRIP,
    );

    const reservedSeats = Number(
      trip?.unavaible_seats ?? trip?.passengers_count ?? 0,
    );

    const availableSeats = Number(
      trip?.avaible_seats ?? Math.max(0, totalSeats - reservedSeats),
    );

    return {
      totalSeats,
      reservedSeats,
      availableSeats,
    };
  }

  async function loadEvents() {
    const list = await listEvents();

    events.value = list.map((trip) => {
      const { totalSeats, reservedSeats, availableSeats } =
        normalizeTripSeats(trip);

      return {
        id: String(trip.id),
        title: trip.title,
        start: trip.trip_date,
        allDay: true,

        total_seats: totalSeats,
        total_seat: totalSeats,
        unavaible_seats: reservedSeats,
        passengers_count: reservedSeats,
        avaible_seats: availableSeats,
      };
    });
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
