<script setup>
import { computed, ref, watch } from "vue";
import { formatDateToSpanish } from "@/utils/formatDate";

const props = defineProps({
  travels: {
    type: Array,
    required: true,
  },
});

const MAX_SEATS_PER_TRIP = 15;

const search = ref("");
const currentPage = ref(1);
const perPage = ref(6);

const perPageOptions = [6, 9, 12, 18];

const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isPastTravel = (travel) => {
  const today = getTodayDate();
  return String(travel.trip_date || "") < today;
};

const sortedTravels = computed(() => {
  const today = getTodayDate();

  return [...props.travels].sort((a, b) => {
    const dateA = String(a.trip_date || "");
    const dateB = String(b.trip_date || "");

    const aIsPast = dateA < today;
    const bIsPast = dateB < today;

    if (!aIsPast && bIsPast) return -1;
    if (aIsPast && !bIsPast) return 1;

    if (!aIsPast && !bIsPast) {
      return dateA.localeCompare(dateB);
    }

    return dateB.localeCompare(dateA);
  });
});

const filteredTravels = computed(() => {
  const term = search.value.trim().toLowerCase();

  if (!term) return sortedTravels.value;

  return sortedTravels.value.filter((travel) => {
    const title = travel.title?.toLowerCase() || "";
    const date = travel.trip_date?.toLowerCase() || "";
    const formattedDate = formatDateToSpanish(travel.trip_date).toLowerCase();

    return (
      title.includes(term) ||
      date.includes(term) ||
      formattedDate.includes(term)
    );
  });
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredTravels.value.length / perPage.value));
});

const paginatedTravels = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;

  return filteredTravels.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;

  let start = Math.max(1, currentPage.value - 2);
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  return pages;
});

const showingFrom = computed(() => {
  if (!filteredTravels.value.length) return 0;
  return (currentPage.value - 1) * perPage.value + 1;
});

const showingTo = computed(() => {
  return Math.min(
    currentPage.value * perPage.value,
    filteredTravels.value.length,
  );
});

const getReservedSeats = (travel) => {
  return Number.parseInt(travel.unavaible_seats || 0, 10);
};

const getAvailableSeats = (travel) => {
  const reservedSeats = getReservedSeats(travel);

  return Math.max(0, MAX_SEATS_PER_TRIP - reservedSeats);
};

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

const nextPage = () => {
  goToPage(currentPage.value + 1);
};

const prevPage = () => {
  goToPage(currentPage.value - 1);
};

const clearSearch = () => {
  search.value = "";
};

watch([search, perPage], () => {
  currentPage.value = 1;
});

watch(
  () => props.travels,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  },
  { deep: true },
);
</script>

<template>
  <div class="w-full space-y-6">
    <!-- Empty state principal -->
    <div
      v-if="!travels.length"
      class="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
    >
      <div
        class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-experience-blue/10 text-experience-blue"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8 2v3M16 2v3M3.5 9.5h17M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
          />
        </svg>
      </div>

      <h3 class="text-lg font-bold text-slate-900">
        No hay viajes registrados
      </h3>

      <p class="mt-1 max-w-sm text-sm text-slate-500">
        Cuando existan viajes disponibles, aparecerán listados en esta sección.
      </p>
    </div>

    <template v-else>
      <!-- Toolbar -->
      <div
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div
          class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div class="w-full lg:max-w-md">
            <label class="text-sm font-bold text-slate-700">
              Buscar RH Experience
            </label>

            <div class="relative mt-2">
              <input
                v-model="search"
                type="text"
                placeholder="Buscar fecha"
                class="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm font-medium text-slate-700 outline-none transition focus:border-experience-blue focus:bg-white focus:ring-2 focus:ring-experience-blue/20"
              />

              <button
                v-if="search"
                type="button"
                class="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 transition hover:bg-slate-300"
                @click="clearSearch"
              >
                ✕
              </button>
            </div>
          </div>

          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:justify-end"
          >
            <div>
              <label class="text-sm font-bold text-slate-700"> Mostrar </label>

              <select
                v-model.number="perPage"
                class="mt-2 w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20 sm:w-36"
              >
                <option
                  v-for="option in perPageOptions"
                  :key="option"
                  :value="option"
                >
                  {{ option }} viajes
                </option>
              </select>
            </div>

            <div
              class="rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500 ring-1 ring-slate-200"
            >
              {{ filteredTravels.length }}
              {{ filteredTravels.length === 1 ? "viaje" : "viajes" }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state por búsqueda -->
      <div
        v-if="!filteredTravels.length"
        class="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
      >
        <div
          class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 21-5.197-5.197M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            />
          </svg>
        </div>

        <h3 class="text-lg font-bold text-slate-900">
          No se encontraron viajes
        </h3>

        <p class="mt-1 max-w-sm text-sm text-slate-500">
          Intenta buscar con otra fecha o limpia el filtro actual.
        </p>

        <button
          type="button"
          class="mt-4 rounded-xl bg-experience-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-experience-blue/90"
          @click="clearSearch"
        >
          Limpiar búsqueda
        </button>
      </div>

      <template v-else>
        <!-- Cards -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="travel in paginatedTravels"
            :key="travel.id"
            class="group overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-experience-blue/20 hover:shadow-xl"
            :class="
              isPastTravel(travel)
                ? 'border-slate-200 opacity-70 grayscale-[0.15]'
                : 'border-slate-200'
            "
          >
            <!-- Header -->
            <div
              class="border-b border-slate-100 p-5"
              :class="isPastTravel(travel) ? 'bg-slate-100' : 'bg-slate-50/70'"
            >
              <div class="flex items-center justify-between gap-4">
                <div
                  class="flex size-10 lg:size-12 shrink-0 items-center justify-center rounded-2xl ring-1"
                  :class="
                    isPastTravel(travel)
                      ? 'bg-slate-200 text-slate-500 ring-slate-200'
                      : 'bg-experience-blue/10 text-experience-blue ring-experience-blue/10'
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="size-5 lg:size-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.8"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8 2v3M16 2v3M3.5 9.5h17M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                    />
                  </svg>
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3
                      class="line-clamp-2 text-base font-black text-slate-900"
                    >
                      {{ travel.title }}
                    </h3>

                    <span
                      v-if="isPastTravel(travel)"
                      class="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600"
                    >
                      Finalizado
                    </span>

                    <span
                      v-else
                      class="rounded-full bg-experience-pink/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-experience-pink ring-1 ring-experience-pink"
                    >
                      Próximo
                    </span>
                  </div>

                  <p class="mt-1 text-sm font-medium text-slate-500">
                    {{ formatDateToSpanish(travel.trip_date) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Body -->
            <div class="space-y-4 p-5">
              <div class="grid md:grid-cols-2 gap-3">
                <div
                  class="rounded-lg flex gap-3 items-center lg:flex-col-reverse lg:items-start lg:gap-1 bg-rose-50 p-2 md:p-4 ring-1 ring-rose-500"
                >
                  <p class="text-2xl font-black text-rose-700">
                    {{ getReservedSeats(travel) }}
                  </p>
                  <p
                    class="text-[11px] font-bold uppercase tracking-wide text-rose-500"
                  >
                    Reservados
                  </p>
                </div>

                <div
                  class="rounded-lg flex gap-3 items-center lg:flex-col-reverse lg:items-start lg:gap-1 bg-experience-aqua/20 p-2 md:p-4 ring-1 ring-experience-aqua"
                >
                  <p class="text-2xl font-black text-emerald-700">
                    {{ getAvailableSeats(travel) }}
                  </p>
                  <p
                    class="text-[11px] font-bold uppercase tracking-wide text-emerald-500"
                  >
                    Disponibles
                  </p>
                </div>
              </div>

              <RouterLink
                class="inline-flex w-full items-center justify-center rounded-xl bg-experience-blue px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-experience-blue/90 hover:shadow-md"
                :to="{ name: 'list-passenger', params: { id: travel.id } }"
              >
                Ver lista de pasajeros
              </RouterLink>
            </div>
          </article>
        </div>

        <!-- Pagination -->
        <div
          class="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-sm font-medium text-slate-500">
            Mostrando
            <span class="font-bold text-slate-900">{{ showingFrom }}</span>
            -
            <span class="font-bold text-slate-900">{{ showingTo }}</span>
            de
            <span class="font-bold text-slate-900">
              {{ filteredTravels.length }}
            </span>
            viajes
          </p>

          <div class="flex items-center justify-center gap-2">
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentPage === 1"
              @click="prevPage"
            >
              Anterior
            </button>

            <button
              v-for="page in visiblePages"
              :key="page"
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black transition"
              :class="
                page === currentPage
                  ? 'bg-experience-blue text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              "
              @click="goToPage(page)"
            >
              {{ page }}
            </button>

            <button
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              Siguiente
            </button>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
