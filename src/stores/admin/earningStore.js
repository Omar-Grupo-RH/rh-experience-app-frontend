// src/stores/admin/earningStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useEarning } from "@/composables/useEarning";
import {
  formatDateToSpanish,
  formatDateToSpanishShort,
} from "@/utils/formatDate";

export const useEarningStore = defineStore("earnings", () => {
  const date = ref("");
  const order = ref("asc");
  const buyers = ref([]);
  const summary = ref({
    gross_cents: 0,
    net_cents: 0,
    discount_cents: 0,
    total_orders: 0,
    completed_transactions: 0,
  });
  const loading = ref(false);

  const { listEarnings } = useEarning();

  const fetchEarnings = async () => {
    loading.value = true;
    try {
      const normalizedOrder = order.value.toUpperCase();
      const res = await listEarnings(date.value || undefined, normalizedOrder);

      buyers.value = res.buyers || [];
      summary.value = res.summary || {
        gross_cents: 0,
        net_cents: 0,
        discount_cents: 0,
        total_orders: 0,
        completed_transactions: 0,
      };
    } catch (error) {
      console.error("Error cargando earnings", error);
      buyers.value = [];
      summary.value = {
        gross_cents: 0,
        net_cents: 0,
        discount_cents: 0,
        total_orders: 0,
        completed_transactions: 0,
      };
    } finally {
      loading.value = false;
    }
  };

  const toggleOrder = async () => {
    order.value = order.value === "asc" ? "desc" : "asc";
    await fetchEarnings();
  };

  const resetDate = async () => {
    date.value = "";
    await fetchEarnings();
  };

  const chartEarningsByDay = computed(() => {
    const map = {};

    buyers.value.forEach((order) => {
      const date = formatDateToSpanishShort(order.created_at.split(" ")[0]); 

      if (!map[date]) map[date] = 0;
      map[date] += order.total_cents; 
    });

    return {
      labels: Object.keys(map),
      values: Object.values(map),
    };
  });

  return {
    date,
    order,
    buyers,
    summary,
    loading,
    fetchEarnings,
    toggleOrder,
    resetDate,
    chartEarningsByDay,
  };
});
