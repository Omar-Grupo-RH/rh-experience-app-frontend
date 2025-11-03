import { useTravel } from "@/composables/useTravel";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useTravelStore = defineStore("travels", () => {
  const { listTravels, passengersByTravel } = useTravel();

  const travels = ref([]);
  const passengersByTravelArray = ref([]);
  const travelSelected = ref({});

  const hasTravels = computed(() => travels.value.length > 0);
  
  const hasPassengersByTravel = computed(
    () => passengersByTravelArray.value.length > 0
  );

  const quantityPassengers = computed(
    () => passengersByTravelArray.value.length
  );
  async function getTravels() {
    try {
      const data = await listTravels();
      travels.value = data;
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
  };
});
