<script setup>
import { computed } from "vue";
import CardInfo from "@/components/admin/Earning/CardInfo.vue";
import EarningsTable from "@/components/admin/Earning/EarningsTable.vue";
import ChartTabs from "@/components/admin/Graphics/IncomeChart.vue";
import { currencyFormat } from "@/utils/formatMoney";
import { useEarningStore } from "@/stores/admin/earningStore";

const store = useEarningStore();

// Definimos las gráficas que queremos en los tabs
const chartConfigs = computed(() => [
  {
    key: "daily",
    label: "Ingresos por día",
    type: "line",
    title: "Ingresos diarios (MXN)",
    labels: store.chartEarningsByDay.labels,
    values: store.chartEarningsByDay.values,
    color: "#d94a93",
    datasetLabel: "Ingresos",
    currency: "mxn",
  },
  {
    key: "summary",
    label: "Bruta vs Neta",
    type: "bar",
    title: "Ganancia bruta vs neta",
    labels: ["Bruta", "Neta", "Descuentos"],
    values: [
      store.summary.gross_cents,
      store.summary.net_cents,
      store.summary.discount_cents,
    ],
    color: "#2c5da7",
    datasetLabel: "Resumen",
    currency: "mxn",
  },
  {
    key: "orders",
    label: "Transacciones",
    type: "doughnut",
    title: "Transacciones completadas",
    labels: ["Completas", "Totales"],
    values: [
      store.summary.completed_transactions,
      store.summary.total_orders || 0,
    ],
    color: "#69c2be",
    datasetLabel: "Transacciones",
    showLegend: true,
  },
]);
</script>

<template>
  <div class="mx-auto p-5 space-y-10">
    <div class="space-y-1">
      <h2 class="text-4xl font-semibold">Resumen de ventas</h2>
      <p class="text-gray-400">Gestiona tus ingresos por ventas de boletos</p>
    </div>

    <!-- Cards -->
    <div>
      <div class="grid grid-cols-4 gap-x-5">
        <CardInfo
          title="Ganancia bruta"
          :text="currencyFormat(store.summary.gross_cents)"
          color="#2c5da7"
        >
          <img src="/svg/money.svg" class="w-5" alt="" />
        </CardInfo>
        <CardInfo
          title="Ganancia neta"
          :text="currencyFormat(store.summary.net_cents)"
          color="#69c2be"
        >
          <img src="/svg/money.svg" class="w-5" alt="" />
        </CardInfo>
        <CardInfo
          title="Transacciones completas"
          :text="store.summary.completed_transactions"
          color="#88bf73"
        >
          <img src="/svg/cart.svg" class="w-6" alt="" />
        </CardInfo>
        <CardInfo
          title="Descuentos aplicados"
          :text="currencyFormat(store.summary.discount_cents)"
          color="#d94a93"
        >
          <img src="/svg/money.svg" class="w-6" alt="" />
        </CardInfo>
      </div>

      <!-- Tabla -->
      <div class="rounded-lg shadow bg-white p-5 mt-10">
        <EarningsTable />
      </div>

      <!-- Gráficas reutilizables con tabs -->
      <div class="mt-10">
        <ChartTabs :charts="chartConfigs" defaultKey="daily" height="320px" />
      </div>
    </div>
  </div>
</template>
