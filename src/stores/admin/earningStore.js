// src/stores/admin/earningStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { useEarning } from "@/composables/useEarning";

export const useEarningStore = defineStore("earnings", () => {
  const date = ref("");
  const order = ref("asc");
  const rows = ref([]);
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

      rows.value = res.rows || [];
      summary.value = res.summary || {
        gross_cents: 0,
        net_cents: 0,
        discount_cents: 0,
        total_orders: 0,
        completed_transactions: 0,
      };
    } catch (error) {
      console.error("Error cargando earnings", error);
      rows.value = [];
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

  return {
    date,
    order,
    rows,
    summary,
    loading,
    fetchEarnings,
    toggleOrder,
    resetDate,
  };
});
