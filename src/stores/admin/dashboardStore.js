import { defineStore } from "pinia";
import { computed, ref } from "vue";
import DashboardAPI from "@/api/DashboardAPI";

export const useDashboardStore = defineStore("dashboard", () => {
  const loading = ref(false);

  const days = ref(30);

  const nextExperience = ref(null);
  const summary = ref({});
  const signupsTrend = ref([]);
  const revenueTrend = ref([]);
  const registrationTypeDistribution = ref([]);
  const satisfaction = ref({});
  const recentReservations = ref([]);
  const recentSurveyResponses = ref([]);

  const hasNextExperience = computed(() => Boolean(nextExperience.value));

  async function getDashboard(params = {}) {
    try {
      loading.value = true;

      const { data } = await DashboardAPI.getDashboard({
        days: days.value,
        ...params,
      });

      const dashboard = data.data ?? {};

      nextExperience.value = dashboard.next_experience ?? null;
      summary.value = dashboard.summary ?? {};
      signupsTrend.value = dashboard.signups_trend ?? [];
      revenueTrend.value = dashboard.revenue_trend ?? [];
      registrationTypeDistribution.value =
        dashboard.registration_type_distribution ?? [];
      satisfaction.value = dashboard.satisfaction ?? {};
      recentReservations.value = dashboard.recent_reservations ?? [];
      recentSurveyResponses.value = dashboard.recent_survey_responses ?? [];
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function setDays(value) {
    days.value = Number(value);
    await getDashboard();
  }

  return {
    loading,
    days,

    nextExperience,
    summary,
    signupsTrend,
    revenueTrend,
    registrationTypeDistribution,
    satisfaction,
    recentReservations,
    recentSurveyResponses,

    hasNextExperience,

    getDashboard,
    setDays,
  };
});
