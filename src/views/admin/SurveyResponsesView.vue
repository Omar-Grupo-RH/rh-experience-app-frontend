<script setup>
import { computed, onMounted, ref } from "vue";
import { useSurveyStore } from "@/stores/admin/surveyStore";
import { formatDateToSpanish } from "@/utils/formatDate";

const store = useSurveyStore();

const showDetail = ref(false);
const selectedDate = ref("");

const answerLabels = {
  church_experience_rating: "Experiencia en Iglesia",
  church_favorite_part: "Parte favorita de la iglesia",
  church_guided_tour_rating: "Tour guiado por iglesia",
  church_suggestion: "Sugerencia iglesia",

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

onMounted(async () => {
  await Promise.all([store.getResponses(), store.getStats()]);
});

const availableDates = computed(() => {
  const dates = store.stats.map((item) => item.trip_date).filter(Boolean);

  return [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
});

const filteredResponses = computed(() => {
  if (!selectedDate.value) return store.responses;

  return store.responses.filter((response) => {
    return response.trip_date === selectedDate.value;
  });
});

const filteredStats = computed(() => {
  if (!selectedDate.value) return store.stats;

  return store.stats.filter((item) => {
    return item.trip_date === selectedDate.value;
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

const clearDateFilter = () => {
  selectedDate.value = "";
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

    <!-- Resumen -->
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

      <!-- Filtros -->
      <div class="rounded-3xl border lg:col-span-2 border-slate-200 bg-white p-5 shadow-sm">
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

    <!-- Listado -->
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
        class="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center"
      >
        <div>
          <p class="font-medium text-slate-600">
            No hay respuestas registradas.
          </p>

          <p class="mt-1 text-sm text-slate-400">
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

    <!-- Modal detalle -->
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

                <p
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
