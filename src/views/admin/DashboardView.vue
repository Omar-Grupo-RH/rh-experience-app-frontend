<script setup>
import { computed, onMounted } from "vue";
import { Line, Bar, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from "chart.js";

import { useDashboardStore } from "@/stores/admin/dashboardStore";
import { formatDateToSpanish } from "@/utils/formatDate";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
);

const store = useDashboardStore();

const registrationTypeLabels = {
  internal: "Personal interno",
  alliance: "Alianza",
  investor: "Inversionista",
  prospect: "Cliente prospecto",
  prize: "Premio",
  sin_tipo: "Sin tipo",
};

const chartColors = {
  blue: "#315fa8",
  blueSoft: "rgba(49, 95, 168, 0.15)",

  pink: "#d63384",
  pinkSoft: "rgba(214, 51, 132, 0.15)",

  green: "#16a34a",
  greenSoft: "rgba(22, 163, 74, 0.15)",

  amber: "#f59e0b",
  amberSoft: "rgba(245, 158, 11, 0.18)",

  red: "#ef4444",
  redSoft: "rgba(239, 68, 68, 0.18)",

  purple: "#7c3aed",
  purpleSoft: "rgba(124, 58, 237, 0.18)",

  cyan: "#06b6d4",
  slate: "#64748b",
  slateSoft: "rgba(100, 116, 139, 0.18)",
};

const doughnutColors = [
  "#315fa8",
  "#d63384",
  "#16a34a",
  "#f59e0b",
  "#7c3aed",
  "#06b6d4",
  "#ef4444",
  "#64748b",
];

const satisfactionColors = {
  "Muy bueno": "#16a34a",
  Bueno: "#315fa8",
  Regular: "#f59e0b",
  Malo: "#ef4444",
  "Muy malo": "#991b1b",
};

onMounted(async () => {
  await store.getDashboard();
});

const money = (value) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));
};

const getRegistrationLabel = (type) => {
  return registrationTypeLabels[type] || type || "Sin tipo";
};

const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 18,
        color: "#475569",
        font: {
          size: 12,
          weight: "600",
        },
      },
    },
    tooltip: {
      backgroundColor: "#0f172a",
      titleColor: "#ffffff",
      bodyColor: "#e2e8f0",
      padding: 12,
      cornerRadius: 12,
      displayColors: true,
    },
  },
};

const lineChartOptions = {
  ...baseChartOptions,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#64748b",
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(148, 163, 184, 0.18)",
      },
      ticks: {
        color: "#64748b",
      },
    },
  },
};

const barChartOptions = {
  ...baseChartOptions,
  plugins: {
    ...baseChartOptions.plugins,
    tooltip: {
      ...baseChartOptions.plugins.tooltip,
      callbacks: {
        label: (context) => {
          const value = context.raw || 0;
          return ` ${context.dataset.label}: ${money(value)}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#64748b",
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(148, 163, 184, 0.18)",
      },
      ticks: {
        color: "#64748b",
        callback: (value) => money(value),
      },
    },
  },
};

const doughnutChartOptions = {
  ...baseChartOptions,
  cutout: "62%",
};

const signupsChartData = computed(() => ({
  labels: store.signupsTrend.map((item) => formatDateToSpanish(item.date)),
  datasets: [
    {
      label: "Pasajeros inscritos",
      data: store.signupsTrend.map((item) => item.passengers),
      borderColor: chartColors.blue,
      backgroundColor: chartColors.blueSoft,
      pointBackgroundColor: chartColors.blue,
      pointBorderColor: "#ffffff",
      pointHoverBackgroundColor: "#ffffff",
      pointHoverBorderColor: chartColors.blue,
      borderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.35,
      fill: true,
    },
    {
      label: "Clientes prospecto",
      data: store.signupsTrend.map((item) => item.prospects),
      borderColor: chartColors.pink,
      backgroundColor: chartColors.pinkSoft,
      pointBackgroundColor: chartColors.pink,
      pointBorderColor: "#ffffff",
      pointHoverBackgroundColor: "#ffffff",
      pointHoverBorderColor: chartColors.pink,
      borderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.35,
      fill: true,
    },
  ],
}));

const revenueChartData = computed(() => ({
  labels: store.revenueTrend.map((item) => formatDateToSpanish(item.date)),
  datasets: [
    {
      label: "Ingresos estimados",
      data: store.revenueTrend.map((item) => item.estimated_revenue),
      backgroundColor: chartColors.greenSoft,
      borderColor: chartColors.green,
      borderWidth: 2,
      borderRadius: 10,
      hoverBackgroundColor: chartColors.green,
    },
  ],
}));

const distributionChartData = computed(() => ({
  labels: store.registrationTypeDistribution.map((item) =>
    getRegistrationLabel(item.registration_type),
  ),
  datasets: [
    {
      label: "Registros",
      data: store.registrationTypeDistribution.map((item) => item.total),
      backgroundColor: store.registrationTypeDistribution.map(
        (_, index) => doughnutColors[index % doughnutColors.length],
      ),
      borderColor: "#ffffff",
      borderWidth: 3,
      hoverOffset: 8,
    },
  ],
}));

const satisfactionChartData = computed(() => {
  const distribution = store.satisfaction?.distribution ?? {};
  const labels = Object.keys(distribution);

  return {
    labels,
    datasets: [
      {
        label: "Respuestas",
        data: Object.values(distribution),
        backgroundColor: labels.map(
          (label) => satisfactionColors[label] || chartColors.slate,
        ),
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };
});

const hasSignupsData = computed(() => store.signupsTrend.length > 0);
const hasRevenueData = computed(() => store.revenueTrend.length > 0);
const hasDistributionData = computed(
  () => store.registrationTypeDistribution.length > 0,
);
const hasSatisfactionData = computed(
  () => Number(store.satisfaction?.rated_responses || 0) > 0,
);
</script>

<template>
  <div class="mx-auto space-y-8 p-5">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Dashboard
        </h1>

        <p class="mt-2 text-sm text-slate-500">
          Resumen general de reservas, ingresos estimados y satisfacción.
        </p>
      </div>

      <div class="w-full sm:w-56">
        <label class="text-sm font-semibold text-slate-600">
          Periodo
        </label>

        <select
          :value="store.days"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
          @change="store.setDays($event.target.value)"
        >
          <option :value="7">Últimos 7 días</option>
          <option :value="30">Últimos 30 días</option>
          <option :value="90">Últimos 90 días</option>
          <option :value="365">Último año</option>
        </select>
      </div>
    </div>

    <div
      v-if="store.loading"
      class="flex min-h-[420px] items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"
    >
      <p class="text-slate-500">Cargando dashboard...</p>
    </div>

    <template v-else>
      <!-- KPIs -->
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-slate-500">
              Ingresos estimados
            </p>

            <span
              class="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-green-100"
            >
              Prospectos
            </span>
          </div>

          <p class="mt-2 text-3xl font-semibold text-slate-900">
            {{ money(store.summary.estimated_revenue) }}
          </p>

          <p class="mt-1 text-xs text-slate-400">
            Prospectos x {{ money(store.summary.prospect_price || 800) }}
          </p>
        </div>

        <div
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-slate-500">
              Pasajeros inscritos
            </p>

            <span
              class="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100"
            >
              Total
            </span>
          </div>

          <p class="mt-2 text-3xl font-semibold text-slate-900">
            {{ store.summary.total_passengers || 0 }}
          </p>

          <p class="mt-1 text-xs text-slate-400">
            En el periodo seleccionado
          </p>
        </div>

        <div
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-slate-500">
              Reservaciones
            </p>

            <span
              class="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 ring-1 ring-purple-100"
            >
              Tickets
            </span>
          </div>

          <p class="mt-2 text-3xl font-semibold text-slate-900">
            {{ store.summary.total_reservations || 0 }}
          </p>

          <p class="mt-1 text-xs text-slate-400">
            Tickets generados
          </p>
        </div>

        <div
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-slate-500">
              Satisfacción
            </p>

            <span
              class="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-100"
            >
              Encuestas
            </span>
          </div>

          <p class="mt-2 text-3xl font-semibold text-slate-900">
            {{ store.satisfaction.satisfaction_percentage || 0 }}%
          </p>

          <p class="mt-1 text-xs text-slate-400">
            Promedio: {{ store.satisfaction.average_score || 0 }}/5
          </p>
        </div>
      </div>

      <!-- Próximo Experience -->
      <section
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div v-if="store.hasNextExperience">
          <div
            class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p
                class="text-sm font-semibold uppercase tracking-wide text-experience-blue"
              >
                Próximo RH Experience
              </p>

              <h2 class="mt-2 text-2xl font-semibold text-slate-900">
                {{ store.nextExperience.title }}
              </h2>

              <p class="mt-1 text-sm text-slate-500">
                {{ formatDateToSpanish(store.nextExperience.trip_date) }}
              </p>
            </div>

            <div class="grid gap-3 sm:grid-cols-4">
              <div class="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                <p class="text-xs font-semibold uppercase text-blue-500">
                  Inscritos
                </p>

                <p class="mt-1 text-xl font-semibold text-blue-900">
                  {{ store.nextExperience.registered_passengers }}
                </p>
              </div>

              <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <p class="text-xs font-semibold uppercase text-slate-400">
                  Disponibles
                </p>

                <p class="mt-1 text-xl font-semibold text-slate-900">
                  {{ store.nextExperience.available_seats }}
                </p>
              </div>

              <div class="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
                <p class="text-xs font-semibold uppercase text-amber-500">
                  Ocupación
                </p>

                <p class="mt-1 text-xl font-semibold text-amber-900">
                  {{ store.nextExperience.occupancy_percentage }}%
                </p>
              </div>

              <div class="rounded-2xl bg-green-50 p-4 ring-1 ring-green-100">
                <p class="text-xs font-semibold uppercase text-green-500">
                  Ingreso estimado
                </p>

                <p class="mt-1 text-xl font-semibold text-green-900">
                  {{ money(store.nextExperience.estimated_revenue) }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-experience-blue"
              :style="{
                width: `${Math.min(
                  store.nextExperience.occupancy_percentage || 0,
                  100,
                )}%`,
              }"
            />
          </div>
        </div>

        <div
          v-else
          class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"
        >
          <p class="font-medium text-slate-600">
            No hay próximos RH Experience registrados.
          </p>
        </div>
      </section>

      <!-- Gráficas principales -->
      <div class="grid gap-4 xl:grid-cols-2">
        <section
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">
              Inscripciones por día
            </h3>

            <span
              class="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
            >
              Tendencia
            </span>
          </div>

          <div
            v-if="hasSignupsData"
            class="mt-5 h-[320px]"
          >
            <Line
              :data="signupsChartData"
              :options="lineChartOptions"
            />
          </div>

          <div
            v-else
            class="mt-5 flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50"
          >
            <p class="text-sm text-slate-500">
              No hay datos para graficar.
            </p>
          </div>
        </section>

        <section
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">
              Ingresos estimados por día
            </h3>

            <span
              class="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"
            >
              MXN
            </span>
          </div>

          <div
            v-if="hasRevenueData"
            class="mt-5 h-[320px]"
          >
            <Bar
              :data="revenueChartData"
              :options="barChartOptions"
            />
          </div>

          <div
            v-else
            class="mt-5 flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50"
          >
            <p class="text-sm text-slate-500">
              No hay ingresos estimados.
            </p>
          </div>
        </section>
      </div>

      <!-- Gráficas secundarias -->
      <div class="grid gap-4 xl:grid-cols-2">
        <section
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">
              Tipos de inscripción
            </h3>

            <span
              class="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-pink-700"
            >
              Segmentación
            </span>
          </div>

          <div
            v-if="hasDistributionData"
            class="mt-5 h-[320px]"
          >
            <Doughnut
              :data="distributionChartData"
              :options="doughnutChartOptions"
            />
          </div>

          <div
            v-else
            class="mt-5 flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50"
          >
            <p class="text-sm text-slate-500">
              No hay tipos de inscripción.
            </p>
          </div>
        </section>

        <section
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">
              Satisfacción general
            </h3>

            <span
              class="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"
            >
              Encuestas
            </span>
          </div>

          <div
            v-if="hasSatisfactionData"
            class="mt-5 h-[320px]"
          >
            <Doughnut
              :data="satisfactionChartData"
              :options="doughnutChartOptions"
            />
          </div>

          <div
            v-else
            class="mt-5 flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50"
          >
            <p class="text-sm text-slate-500">
              Todavía no hay encuestas.
            </p>
          </div>
        </section>
      </div>

      <!-- Listas rápidas -->
      <div class="grid gap-4 xl:grid-cols-2">
        <section
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 class="text-lg font-semibold text-slate-900">
            Reservaciones recientes
          </h3>

          <div class="mt-4 grid gap-3">
            <div
              v-for="item in store.recentReservations"
              :key="item.id"
              class="rounded-2xl bg-slate-50 p-4"
            >
              <div
                class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p class="font-semibold text-slate-900">
                    {{ item.first_name }} {{ item.last_name }}
                  </p>

                  <p class="text-sm text-slate-500">
                    {{ item.email }}
                  </p>

                  <p class="mt-1 text-sm font-medium text-slate-700">
                    {{ item.trip_title }} ·
                    {{ formatDateToSpanish(item.trip_date) }}
                  </p>
                </div>

                <span
                  class="w-fit rounded-full bg-experience-blue/10 px-3 py-1 text-xs font-semibold text-experience-blue"
                >
                  {{ getRegistrationLabel(item.registration_type) }}
                </span>
              </div>
            </div>

            <p
              v-if="!store.recentReservations.length"
              class="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500"
            >
              No hay reservaciones recientes.
            </p>
          </div>
        </section>

        <section
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 class="text-lg font-semibold text-slate-900">
            Encuestas recientes
          </h3>

          <div class="mt-4 grid gap-3">
            <div
              v-for="item in store.recentSurveyResponses"
              :key="item.id"
              class="rounded-2xl bg-slate-50 p-4"
            >
              <p class="font-semibold text-slate-900">
                {{ item.passenger_name }}
              </p>

              <p class="text-sm text-slate-500">
                {{ item.email }}
              </p>

              <p class="mt-1 text-sm font-medium text-slate-700">
                {{ item.trip_title }} ·
                {{ formatDateToSpanish(item.trip_date) }}
              </p>
            </div>

            <p
              v-if="!store.recentSurveyResponses.length"
              class="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500"
            >
              No hay encuestas recientes.
            </p>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>