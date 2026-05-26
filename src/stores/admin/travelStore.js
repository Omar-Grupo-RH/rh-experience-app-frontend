import { useTravel } from "@/composables/useTravel";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useTravelStore = defineStore(
  "travels",
  () => {
    const { listTravels, passengersByTravel } = useTravel();

    const travels = ref([]);
    const passengersByTravelArray = ref([]);
    const travelSelected = ref({});

    const hasTravels = computed(() => travels.value.length > 0);

    const hasPassengersByTravel = computed(
      () => passengersByTravelArray.value.length > 0,
    );

    const quantityPassengers = computed(
      () => passengersByTravelArray.value.length,
    );

    function getTodayDate() {
      const today = new Date();

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    function sortTravelsByUpcomingFirst(list = []) {
      const today = getTodayDate();

      return [...list].sort((a, b) => {
        const dateA = a.trip_date;
        const dateB = b.trip_date;

        const aIsPast = dateA < today;
        const bIsPast = dateB < today;

        // Si A es futuro y B pasado, A va primero
        if (!aIsPast && bIsPast) return -1;

        // Si A es pasado y B futuro, B va primero
        if (aIsPast && !bIsPast) return 1;

        // Si ambos son próximos/futuros, ordenar ascendente
        // Ej: 2026-05-20, 2026-05-21, 2026-05-22
        if (!aIsPast && !bIsPast) {
          return dateA.localeCompare(dateB);
        }

        // Si ambos son pasados, ordenar descendente
        // Ej: ayer, antier, fechas más viejas al final
        return dateB.localeCompare(dateA);
      });
    }

    async function getTravels() {
      try {
        const data = await listTravels();

        travels.value = sortTravelsByUpcomingFirst(data);
      } catch (error) {
        console.log(error);
      }
    }

    async function getPassengersByTravel(id) {
      if (!id) {
        return;
      }

      passengersByTravelArray.value = [];
      travelSelected.value = {};

      try {
        const data = await passengersByTravel(id);

        passengersByTravelArray.value = data;
        travelSelected.value = travels.value.filter((t) => t.id == id);
      } catch (error) {
        console.log(error);
      }
    }

    return {
      travels,
      hasTravels,
      getTravels,
      getPassengersByTravel,
      passengersByTravelArray,
      hasPassengersByTravel,
      quantityPassengers,
      travelSelected,
      sortTravelsByUpcomingFirst,
    };
  },
  {
    persist: true,
  },
);
