import { defineStore } from "pinia";
import { computed, ref } from "vue";
import SurveyAPI from "@/api/SurveyAPI";

export const useSurveyStore = defineStore("survey-admin", () => {
  const responses = ref([]);
  const selectedResponse = ref(null);
  const stats = ref([]);
  const deliveries = ref([]);

  const loading = ref(false);
  const loadingDetail = ref(false);
  const loadingDeliveries = ref(false);

  const filters = ref({
    trip_id: "",
  });

  const hasResponses = computed(() => responses.value.length > 0);

  async function getResponses(params = {}) {
    try {
      loading.value = true;

      const cleanParams = {
        ...filters.value,
        ...params,
      };

      Object.keys(cleanParams).forEach((key) => {
        if (!cleanParams[key]) delete cleanParams[key];
      });

      const { data } = await SurveyAPI.allResponses(cleanParams);

      responses.value = data.data ?? [];
    } catch (error) {
      console.error("Error cargando respuestas:", error);
      responses.value = [];
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function getResponse(id) {
    if (!id) return null;

    try {
      loadingDetail.value = true;

      const { data } = await SurveyAPI.getResponse(id);

      selectedResponse.value = data.data ?? null;

      return selectedResponse.value;
    } catch (error) {
      console.error("Error cargando detalle de respuesta:", error);
      selectedResponse.value = null;
      throw error;
    } finally {
      loadingDetail.value = false;
    }
  }

  async function getStats(params = {}) {
    try {
      const cleanParams = {
        ...filters.value,
        ...params,
      };

      Object.keys(cleanParams).forEach((key) => {
        if (!cleanParams[key]) delete cleanParams[key];
      });

      const { data } = await SurveyAPI.getStats(cleanParams);

      stats.value = data.data ?? [];
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
      stats.value = [];
      throw error;
    }
  }

  async function getDeliveries(params = {}) {
    try {
      loadingDeliveries.value = true;
      const { data } = await SurveyAPI.getDeliveries(params);
      deliveries.value = data.data ?? [];
    } catch (error) {
      console.error("Error cargando envíos de encuestas:", error);
      deliveries.value = [];
      throw error;
    } finally {
      loadingDeliveries.value = false;
    }
  }

  async function setTripFilter(tripId) {
    filters.value.trip_id = tripId;
    await Promise.all([getResponses(), getStats()]);
  }

  function clearSelectedResponse() {
    selectedResponse.value = null;
  }

  return {
    responses,
    selectedResponse,
    stats,
    deliveries,
    loading,
    loadingDetail,
    loadingDeliveries,
    filters,

    hasResponses,

    getResponses,
    getResponse,
    getStats,
    getDeliveries,
    setTripFilter,
    clearSelectedResponse,
  };
});
