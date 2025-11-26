import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useEarningStore = defineStore("earnings", () => {
  const date = ref("");
  const order = ref("asc");

  const toggleOrder = () => {
    order.value = order.value === "asc" ? "desc" : "asc";
  };

  const resetDate = () => {
    date.value = "";
  };

  return {
    date,
    order,
    resetDate,
    toggleOrder,
  };
});
