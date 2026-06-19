<script setup>
import { computed, onMounted, ref, nextTick, watch, onBeforeUnmount } from "vue";
import { Chart, registerables } from "chart.js";
import { useSurveyStore } from "@/stores/admin/surveyStore";
import { formatDateToSpanish } from "@/utils/formatDate";

Chart.register(...registerables);

const store = useSurveyStore();

const showDetail = ref(false);
const selectedDate = ref("");
const activeTab = ref("responses");

const chartRefs = ref({});
const chartInstances = new Map();

const answerLabels = {
  participant_type: "Soy parte de",
  trip_participation_date: "Fecha en la que participé en el recorrido",

  church_experience_rating:
    "Califica del 1 al 10 la experiencia por la Iglesia",
  church_favorite_part: "¿Cuál fue tu parte favorita de este tour?",
  church_guided_tour_rating: "¿Cómo calificas el tour guiado por la iglesia?",
  church_suggestion: "¿Tienes alguna sugerencia? Opcional",

  atv_experience_rating: "Experiencia en cuatrimoto",
  atv_security_rating: "Seguridad en cuatrimoto",
  atv_driving_easy: "Facilidad para manejar",
  atv_recommendation: "Recomendación cuatrimoto",

  beach_general_rating: "Beach Club general",
  beach_client_ideal: "Espacio ideal para clientes",
  beach_recreation_rating: "Áreas recreativas",
  beach_accessibility_rating: "Accesibilidad",
  beach_invite_client: "Invitaría a cliente",
  beach_visibility_suggestions: "Sugerencias Beach Club",

  boat_trip_feeling: "Sensación del viaje en lancha",
  boat_favorite_part: "Parte favorita lancha",
  boat_security_rating: "Seguridad en lancha",
  boat_recommendation: "Recomendación lancha",

  staff_before_info_rating: "Información antes del tour",
  staff_andrea_rating: "Andrea",
  staff_jaqueline_rating: "Jaqueline",
  staff_during_info_rating: "Información durante el tour",
  staff_driver_rating: "Conductor",

  eco_environmental_education: "Educación socioambiental",
  eco_passport_info: "Pasaporte RH Experience",
  eco_kit_rating: "Kit RH Experience",
  eco_impact_experience: "Dato/experiencia socioambiental",

  final_general_tour_rating: "Tour general",
  final_general_comment: "Comentario general",
  final_social_comment: "Comentario para redes",
};

const chartColors = [
  "#2c5da7", // experience blue
  "#d94a93", // experience pink
  "#feec82", // experience yellow
  "#69c2be", // experience aqua
  "#88bf73", // experience green
  "#ece7e3", // experience white/beige
];

function getChartColors(length) {
  return Array.from({ length }, (_, index) => {
    return chartColors[index % chartColors.length];
  });
}

const starQuestionKeys = ["staff_andrea_rating", "staff_jaqueline_rating"];

const surveySections = [
  {
    title: "Datos generales",
    questions: [
      {
        key: "participant_type",
        label: "Soy parte de...",
        type: "pie",
      },
      {
        key: "trip_participation_date",
        label: "Fecha en la que participé en el recorrido",
        type: "text",
      },
    ],
  },
  {
    title: "Parte 2: Iglesia de Dzindzantún",
    questions: [
      {
        key: "church_experience_rating",
        label: "Califica del 1 al 10 la experiencia por la Iglesia",
        type: "scale",
        min: 1,
        max: 10,
      },
      {
        key: "church_favorite_part",
        label: "¿Cuál fue tu parte favorita de este tour?",
        type: "pie",
      },
      {
        key: "church_guided_tour_rating",
        label: "¿Cómo calificas el tour guiado por la iglesia?",
        type: "pie",
      },
      {
        key: "church_suggestion",
        label: "¿Tienes alguna sugerencia? Opcional",
        type: "text",
      },
    ],
  },
  {
    title: "Parte 3: Cuatrimotos",
    questions: [
      {
        key: "atv_experience_rating",
        label: "Experiencia en cuatrimoto",
        type: "scale",
        min: 1,
        max: 10,
      },
      {
        key: "atv_security_rating",
        label: "Seguridad en cuatrimoto",
        type: "pie",
      },
      {
        key: "atv_driving_easy",
        label: "Facilidad para manejar",
        type: "pie",
      },
      {
        key: "atv_recommendation",
        label: "Recomendación cuatrimoto",
        type: "text",
      },
    ],
  },
  {
    title: "Parte 4: Beach Club",
    questions: [
      {
        key: "beach_general_rating",
        label: "Beach Club general",
        type: "scale",
        min: 1,
        max: 10,
      },
      {
        key: "beach_client_ideal",
        label: "Espacio ideal para clientes",
        type: "pie",
      },
      {
        key: "beach_recreation_rating",
        label: "Áreas recreativas",
        type: "pie",
      },
      {
        key: "beach_accessibility_rating",
        label: "Accesibilidad",
        type: "pie",
      },
      {
        key: "beach_invite_client",
        label: "Invitaría a cliente",
        type: "pie",
      },
      {
        key: "beach_visibility_suggestions",
        label: "Sugerencias Beach Club",
        type: "text",
      },
    ],
  },
  {
    title: "Parte 5: Lancha",
    questions: [
      {
        key: "boat_trip_feeling",
        label: "Sensación del viaje en lancha",
        type: "pie",
      },
      {
        key: "boat_favorite_part",
        label: "Parte favorita lancha",
        type: "pie",
      },
      {
        key: "boat_security_rating",
        label: "Seguridad en lancha",
        type: "pie",
      },
      {
        key: "boat_recommendation",
        label: "Recomendación lancha",
        type: "text",
      },
    ],
  },
  {
    title: "Parte 6: Personal",
    questions: [
      {
        key: "staff_before_info_rating",
        label: "Información antes del tour",
        type: "pie",
      },
      {
        key: "staff_andrea_rating",
        label: "Andrea",
        type: "stars",
        max: 5,
      },
      {
        key: "staff_jaqueline_rating",
        label: "Jaqueline",
        type: "stars",
        max: 5,
      },
      {
        key: "staff_during_info_rating",
        label: "Información durante el tour",
        type: "pie",
      },
      {
        key: "staff_driver_rating",
        label: "Conductor",
        type: "pie",
      },
    ],
  },
  {
    title: "Parte 7: Ecoturismo",
    questions: [
      {
        key: "eco_environmental_education",
        label: "Educación socioambiental",
        type: "pie",
      },
      {
        key: "eco_passport_info",
        label: "Pasaporte RH Experience",
        type: "pie",
      },
      {
        key: "eco_kit_rating",
        label: "Kit RH Experience",
        type: "pie",
      },
      {
        key: "eco_impact_experience",
        label: "Dato/experiencia socioambiental",
        type: "text",
      },
    ],
  },
  {
    title: "Parte final",
    questions: [
      {
        key: "final_general_tour_rating",
        label: "Tour general",
        type: "pie",
      },
      {
        key: "final_general_comment",
        label: "Comentario general",
        type: "text",
      },
      {
        key: "final_social_comment",
        label: "Comentario para redes",
        type: "text",
      },
    ],
  },
];

onMounted(async () => {
  await Promise.all([store.getResponses(), store.getStats()]);
  await nextTick();
  renderCharts();
});

onBeforeUnmount(() => {
  destroyCharts();
});

const availableDates = computed(() => {
  const responseDates = store.responses
    .map((item) => item.trip_date)
    .filter(Boolean);

  const statsDates = store.stats.map((item) => item.trip_date).filter(Boolean);

  return [...new Set([...responseDates, ...statsDates])].sort(
    (a, b) => new Date(b) - new Date(a),
  );
});

const filteredResponses = computed(() => {
  if (!selectedDate.value) return store.responses;

  return store.responses.filter((response) => {
    return response.trip_date === selectedDate.value;
  });
});

const totalFilteredResponses = computed(() => {
  return filteredResponses.value.length;
});

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return "Todas las fechas";

  return formatDateToSpanish(selectedDate.value);
});

const hasFilteredResponses = computed(() => {
  return filteredResponses.value.length > 0;
});

const responsesWithAnswers = computed(() => {
  return filteredResponses.value
    .map((response) => ({
      ...response,
      normalizedAnswers: normalizeAnswers(response),
    }))
    .filter((response) => {
      return Object.keys(response.normalizedAnswers).length > 0;
    });
});

const chartsData = computed(() => {
  return surveySections.map((section) => {
    return {
      ...section,
      questions: section.questions.map((question) => {
        return buildQuestionData(question);
      }),
    };
  });
});

const totalAnsweredQuestions = computed(() => {
  return chartsData.value.reduce((total, section) => {
    return (
      total +
      section.questions.filter((question) => question.totalResponses > 0).length
    );
  }, 0);
});

const hasChartData = computed(() => {
  return totalAnsweredQuestions.value > 0;
});

const clearDateFilter = () => {
  selectedDate.value = "";
};

const setChartRef = (key, element) => {
  if (!element) return;

  chartRefs.value[key] = element;
};

const openDetail = async (response) => {
  await store.getResponse(response.id);
  showDetail.value = true;
};

const closeDetail = () => {
  showDetail.value = false;
  store.clearSelectedResponse();
};

const getAnswerLabel = (key) => {
  return answerLabels[key] || key;
};

function normalizeAnswers(response) {
  if (response?.answers && typeof response.answers === "object") {
    return response.answers;
  }

  if (response?.answers_json && typeof response.answers_json === "object") {
    return response.answers_json;
  }

  if (response?.answers_json && typeof response.answers_json === "string") {
    try {
      return JSON.parse(response.answers_json) || {};
    } catch {
      return {};
    }
  }

  return {};
}

function normalizeAnswerValue(value) {
  if (value === null || value === undefined) return "";

  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }

  return String(value).trim();
}

function isStarQuestion(key) {
  return starQuestionKeys.includes(key);
}

function getStarScore(value) {
  const normalized = normalizeAnswerValue(value).toLowerCase();

  if (!normalized) return 0;

  const numeric = Number(normalized);

  if (!Number.isNaN(numeric)) {
    if (numeric > 5) {
      return Math.min(5, numeric / 2);
    }

    return Math.min(5, numeric);
  }

  const map = {
    "muy bueno": 5,
    excelente: 5,
    bueno: 4,
    regular: 3,
    malo: 2,
    "muy malo": 1,
  };

  return map[normalized] ?? 0;
}

function getStarsArray(score) {
  const roundedScore = Math.round(Number(score || 0));

  return Array.from({ length: 5 }, (_, index) => {
    return index < roundedScore;
  });
}

function formatStarScore(score) {
  const number = Number(score || 0);

  if (!number) return "Sin calificación";

  return `${number.toFixed(1)} de 5`;
}

function getQuestionAnswers(questionKey) {
  return responsesWithAnswers.value
    .map((response) =>
      normalizeAnswerValue(response.normalizedAnswers[questionKey]),
    )
    .filter(Boolean);
}

function countValues(values) {
  return values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function buildQuestionData(question) {
  const values = getQuestionAnswers(question.key);

  if (question.type === "stars") {
    const scores = values
      .map((value) => getStarScore(value))
      .filter((value) => value > 0);

    const average = scores.length
      ? Number(
          (
            scores.reduce((sum, value) => sum + value, 0) / scores.length
          ).toFixed(1),
        )
      : null;

    const distribution = [5, 4, 3, 2, 1].map((star) => {
      return {
        stars: star,
        total: scores.filter((score) => Math.round(score) === star).length,
      };
    });

    return {
      ...question,
      totalResponses: scores.length,
      average,
      distribution,
      textAnswers: values,
      chartLabels: [],
      chartValues: [],
    };
  }

  if (question.type === "text") {
    return {
      ...question,
      totalResponses: values.length,
      textAnswers: values,
      chartLabels: [],
      chartValues: [],
    };
  }

  if (question.type === "scale") {
    const min = question.min ?? 1;
    const max = question.max ?? 10;
    const counts = countValues(values);

    const chartLabels = [];

    for (let i = min; i <= max; i++) {
      chartLabels.push(String(i));
    }

    const chartValues = chartLabels.map((label) => Number(counts[label] || 0));

    return {
      ...question,
      totalResponses: values.length,
      chartLabels,
      chartValues,
      average: getAverage(values),
    };
  }

  const counts = countValues(values);
  const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return {
    ...question,
    totalResponses: values.length,
    chartLabels: sortedEntries.map(([label]) => label),
    chartValues: sortedEntries.map(([, total]) => total),
  };
}

function getAverage(values) {
  const numbers = values
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value));

  if (!numbers.length) return null;

  const total = numbers.reduce((sum, value) => sum + value, 0);

  return Number((total / numbers.length).toFixed(1));
}

function getQuestionChartType(question) {
  if (question.type === "scale") return "bar";

  return "pie";
}

function getChartOptions(question) {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: question.type === "scale" ? "top" : "right",
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            const label = context.label || "";
            const value = Number(context.raw || 0);
            const total = context.dataset.data.reduce(
              (sum, item) => sum + Number(item || 0),
              0,
            );

            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;

            return `${label}: ${value} respuesta${
              value === 1 ? "" : "s"
            } (${percentage}%)`;
          },
        },
      },
    },
  };

  if (question.type === "scale") {
    return {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    };
  }

  return baseOptions;
}

function destroyCharts() {
  chartInstances.forEach((chart) => chart.destroy());
  chartInstances.clear();
}

async function renderCharts() {
  destroyCharts();

  if (activeTab.value !== "charts") return;

  await nextTick();

  chartsData.value.forEach((section) => {
    section.questions.forEach((question) => {
      if (question.type === "text" || question.type === "stars") return;
      if (!question.totalResponses) return;

      const canvas = chartRefs.value[question.key];

      if (!canvas) return;

      const ctx = canvas.getContext("2d");

      const chart = new Chart(ctx, {
        type: getQuestionChartType(question),
        data: {
          labels: question.chartLabels,
          datasets: [
            {
              label: "Respuestas",
              data: question.chartValues,
              backgroundColor: getChartColors(question.chartLabels.length),
              borderColor: "#ffffff",
              borderWidth: question.type === "scale" ? 0 : 2,
              borderRadius: question.type === "scale" ? 8 : 0,
            },
          ],
        },
        options: getChartOptions(question),
      });

      chartInstances.set(question.key, chart);
    });
  });
}

watch(
  [selectedDate, activeTab, responsesWithAnswers],
  async () => {
    await renderCharts();
  },
  { deep: true },
);
</script>

<template>
  <div class="mx-auto space-y-8 p-5">
    <div
      class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <h2 class="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Respuestas de encuestas
        </h2>

        <p class="mt-2 text-sm text-slate-500">
          Consulta la retroalimentación de los asistentes por RH Experience.
        </p>
      </div>
    </div>

    <div class="flex w-fit rounded-2xl bg-slate-100 p-1 ring-1 ring-slate-200">
      <button
        type="button"
        class="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition"
        :class="
          activeTab === 'responses'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        "
        @click="activeTab = 'responses'"
      >
        Respuestas
      </button>

      <button
        type="button"
        class="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition"
        :class="
          activeTab === 'charts'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        "
        @click="activeTab = 'charts'"
      >
        Gráficas
      </button>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-slate-500">Total respuestas</p>

        <p class="mt-2 text-3xl font-semibold text-slate-900">
          {{ totalFilteredResponses }}
        </p>

        <p class="mt-1 text-xs text-slate-400">
          {{
            selectedDate
              ? "Según la fecha seleccionada"
              : "Todas las respuestas"
          }}
        </p>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"
      >
        <div
          class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div class="w-full lg:max-w-sm">
            <label class="text-sm font-semibold text-slate-700">
              Filtrar por fecha del RH Experience
            </label>

            <select
              v-model="selectedDate"
              class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
            >
              <option value="">Todas las fechas</option>

              <option v-for="date in availableDates" :key="date" :value="date">
                {{ formatDateToSpanish(date) }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span
              class="w-fit rounded-full bg-experience-blue/10 px-4 py-2 text-sm font-semibold text-experience-blue ring-1 ring-experience-blue/10"
            >
              {{ selectedDateLabel }}
            </span>

            <button
              v-if="selectedDate"
              type="button"
              class="w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              @click="clearDateFilter"
            >
              Limpiar filtro
            </button>
          </div>
        </div>
      </div>
    </div>

    <section v-if="activeTab === 'responses'">
      <div
        class="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5"
      >
        <div
          v-if="store.loading"
          class="flex min-h-[260px] items-center justify-center"
        >
          <p class="text-slate-500">Cargando respuestas...</p>
        </div>

        <div
          v-else-if="!hasFilteredResponses"
          class="flex min-h-[260px] items-center justify-center rounded-2xl bg-slate-50 text-center"
        >
          <div>
            <p class="font-semibold text-slate-900">
              No hay respuestas registradas.
            </p>

            <p class="mt-1 text-sm text-slate-500">
              Prueba seleccionando otra fecha o limpiando el filtro.
            </p>
          </div>
        </div>

        <div v-else class="grid gap-4">
          <article
            v-for="response in filteredResponses"
            :key="response.id"
            class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-experience-blue/30 hover:shadow-md"
          >
            <div
              class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <h3 class="text-xl font-semibold text-slate-900">
                  {{ response.passenger_name || "Sin nombre" }}
                </h3>

                <p class="text-sm text-slate-500">
                  {{ response.email }}
                </p>

                <p class="mt-2 text-sm font-medium text-slate-700">
                  {{ response.trip_title || "RH Experience" }}
                  ·
                  {{ formatDateToSpanish(response.trip_date) }}
                </p>
              </div>

              <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span
                  class="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600"
                >
                  {{ response.created_at }}
                </span>

                <button
                  type="button"
                  class="rounded-xl bg-experience-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-experience-blue/90"
                  @click="openDetail(response)"
                >
                  Ver respuestas
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section v-if="activeTab === 'charts'" class="space-y-6">
      <div
        v-if="store.loading"
        class="flex min-h-[260px] items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"
      >
        <p class="text-slate-500">Cargando gráficas...</p>
      </div>

      <div
        v-else-if="!hasChartData"
        class="flex min-h-[260px] items-center justify-center rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"
      >
        <div>
          <p class="font-semibold text-slate-900">
            No hay datos suficientes para graficar.
          </p>
        </div>
      </div>

      <template v-else>
        <section
          v-for="section in chartsData"
          :key="section.title"
          class="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"
        >
          <div
            class="bg-experience-pink px-5 py-4 text-lg font-black text-white"
          >
            {{ section.title }}
          </div>

          <div class="grid gap-5 p-5">
            <article
              v-for="question in section.questions"
              :key="question.key"
              class="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div
                class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <h3 class="text-lg font-semibold text-slate-900">
                    {{ question.label }}
                  </h3>

                  <p class="mt-1 text-sm text-slate-500">
                    {{ question.totalResponses }}
                    {{
                      question.totalResponses === 1
                        ? "respuesta"
                        : "respuestas"
                    }}
                    <span v-if="question.average">
                      · Promedio: {{ question.average }}
                    </span>
                  </p>
                </div>
              </div>

              <div
                v-if="!question.totalResponses"
                class="rounded-2xl bg-slate-50 p-6 text-center text-sm font-medium text-slate-500"
              >
                Sin respuestas para esta pregunta.
              </div>

              <div v-else-if="question.type === 'stars'" class="space-y-5">
                <div class="rounded-2xl bg-slate-50 p-5 text-center">
                  <p class="text-sm font-semibold text-slate-500">
                    Promedio general
                  </p>

                  <div class="mt-3 flex items-center justify-center gap-1">
                    <span
                      v-for="(filled, index) in getStarsArray(
                        question.average,
                      )"
                      :key="`${question.key}-avg-${index}`"
                      class="text-4xl"
                      :class="filled ? 'text-yellow-400' : 'text-slate-300'"
                    >
                      ★
                    </span>
                  </div>

                  <p class="mt-2 text-lg font-black text-slate-900">
                    {{ formatStarScore(question.average) }}
                  </p>
                </div>

                <div class="space-y-3">
                  <div
                    v-for="item in question.distribution"
                    :key="`${question.key}-${item.stars}`"
                    class="flex items-center gap-3"
                  >
                    <div class="flex w-32 items-center gap-0.5">
                      <span
                        v-for="(filled, index) in getStarsArray(item.stars)"
                        :key="`${question.key}-${item.stars}-${index}`"
                        class="text-base"
                        :class="filled ? 'text-yellow-400' : 'text-slate-300'"
                      >
                        ★
                      </span>
                    </div>

                    <div
                      class="h-3 flex-1 overflow-hidden rounded-full bg-slate-100"
                    >
                      <div
                        class="h-full rounded-full bg-yellow-400"
                        :style="{
                          width:
                            question.totalResponses > 0
                              ? `${(item.total / question.totalResponses) * 100}%`
                              : '0%',
                        }"
                      ></div>
                    </div>

                    <p class="w-20 text-right text-sm font-semibold text-slate-600">
                      {{ item.total }}
                      {{ item.total === 1 ? "resp." : "resps." }}
                    </p>
                  </div>
                </div>
              </div>

              <div v-else-if="question.type === 'text'" class="space-y-3">
                <div
                  v-for="(answer, index) in question.textAnswers"
                  :key="`${question.key}-${index}`"
                  class="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  {{ answer }}
                </div>
              </div>

              <div v-else class="h-[320px]">
                <canvas :ref="(el) => setChartRef(question.key, el)"></canvas>
              </div>
            </article>
          </div>
        </section>
      </template>
    </section>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showDetail"
          class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          @click.self="closeDetail"
        >
          <div
            class="max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <div
              class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5"
            >
              <div>
                <h3 class="text-2xl font-semibold text-slate-900">
                  Detalle de encuesta
                </h3>

                <p class="text-sm text-slate-500">
                  {{ store.selectedResponse?.passenger_name }}
                  ·
                  {{ store.selectedResponse?.email }}
                </p>
              </div>

              <button
                type="button"
                class="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                @click="closeDetail"
              >
                Cerrar
              </button>
            </div>

            <div
              v-if="store.loadingDetail"
              class="p-8 text-center text-slate-500"
            >
              Cargando detalle...
            </div>

            <div v-else class="grid gap-4 p-5">
              <div
                v-for="(value, key) in store.selectedResponse?.answers"
                :key="key"
                class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
              >
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  {{ getAnswerLabel(key) }}
                </p>

                <div
                  v-if="isStarQuestion(key)"
                  class="mt-2 flex items-center gap-2"
                >
                  <div class="flex items-center gap-0.5">
                    <span
                      v-for="(filled, index) in getStarsArray(
                        getStarScore(value),
                      )"
                      :key="`${key}-${index}`"
                      class="text-2xl"
                      :class="filled ? 'text-yellow-400' : 'text-slate-300'"
                    >
                      ★
                    </span>
                  </div>

                  <span class="text-sm font-semibold text-slate-700">
                    {{ value || "Sin respuesta" }}
                  </span>
                </div>

                <p
                  v-else
                  class="mt-2 whitespace-pre-line text-sm font-medium text-slate-800"
                >
                  {{ value || "Sin respuesta" }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>