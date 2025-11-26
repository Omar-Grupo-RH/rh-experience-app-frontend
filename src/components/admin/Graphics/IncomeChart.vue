<script setup>
import { ref, computed } from "vue";
import { Line, Bar, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement
);

const props = defineProps({
  // Array de gráficas
  // Cada item: {
  //   key: 'daily',
  //   label: 'Ingresos por día',
  //   type: 'line' | 'bar' | 'doughnut',
  //   title: 'Texto del título',
  //   labels: [...],
  //   values: [...],
  //   color: '#hex',
  //   datasetLabel: 'Etiqueta del dataset',
  //   currency: 'mxn' | null,
  //   showLegend: true/false
  // }
  charts: {
    type: Array,
    required: true,
  },
  defaultKey: {
    type: String,
    default: null,
  },
  height: {
    type: String,
    default: "20rem",
  },
  showTabs: {
    type: Boolean,
    default: true,
  },
});

const activeKey = ref(props.defaultKey || (props.charts[0]?.key ?? null));

const activeChart = computed(() => {
  return (
    props.charts.find((c) => c.key === activeKey.value) ||
    props.charts[0] ||
    null
  );
});

const chartComponent = computed(() => {
  if (!activeChart.value) return Line;
  switch (activeChart.value.type) {
    case "bar":
      return Bar;
    case "doughnut":
      return Doughnut;
    default:
      return Line;
  }
});

const chartData = computed(() => {
  if (!activeChart.value) {
    return { labels: [], datasets: [] };
  }

  const c = activeChart.value;

  return {
    labels: c.labels || [],
    datasets: [
      {
        label: c.datasetLabel || c.title || "",
        data: c.values || [],
        borderColor: c.borderColor || c.color || "#2c5da7",
        backgroundColor: c.backgroundColor || c.color || "#2c5da7",
        tension: c.tension != null ? c.tension : c.type === "line" ? 0.3 : 0,
        fill: c.fill != null ? c.fill : c.type === "line" ? false : true,
      },
    ],
  };
});

const options = computed(() => {
  const c = activeChart.value || {};

  const isDoughnut = c.type === "doughnut";

  const yTicks =
    c.currency === "mxn"
      ? {
          callback: (value) =>
            "$" + Number(value).toLocaleString("es-MX", { maximumFractionDigits: 0 }),
        }
      : {};

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: c.showLegend !== false,
        position: "top",
      },
      title: {
        display: !!c.title,
        text: c.title,
      },
    },
    scales: isDoughnut
      ? {} // doughnut no necesita ejes
      : {
          x: {
            ticks: {
              autoSkip: true,
              maxRotation: 45,
              minRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            ticks: yTicks,
          },
        },
  };
});
</script>

<template>
  <div class="bg-white p-5 rounded-lg shadow w-full">
    <!-- Tabs -->
    <div
      v-if="showTabs && charts.length > 1"
      class="flex gap-2 border-b mb-4 text-sm"
    >
      <button
        v-for="c in charts"
        :key="c.key"
        @click="activeKey = c.key"
        class="px-3 py-1 rounded-t-md transition"
        :class="
          activeKey === c.key
            ? 'bg-gray-100 font-semibold text-gray-900'
            : 'text-gray-500 hover:text-gray-800'
        "
      >
        {{ c.label }}
      </button>
    </div>

    <!-- Chart -->
    <div :style="{ height }">
      <component
        :is="chartComponent"
        v-if="activeChart"
        :data="chartData"
        :options="options"
      />
      <p v-else class="text-center text-gray-400 text-sm mt-10">
        No hay datos para mostrar.
      </p>
    </div>
  </div>
</template>
