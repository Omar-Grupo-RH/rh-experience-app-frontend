<script setup>
import { formatDateToSpanish } from "@/utils/formatDate";

defineProps({
  travels: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="w-full">
    <!-- Empty state -->
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

    <!-- Cards -->
    <div
      v-else
      class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
    >
      <article
        v-for="travel in travels"
        :key="travel.id"
        class="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300  hover:border-experience-blue/20 hover:shadow-lg"
      >
        <!-- Header -->
        <div class="border-b border-slate-100 bg-slate-50/70 p-5">
          <div class="flex items-start gap-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-experience-blue/10 text-experience-blue ring-1 ring-experience-blue/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
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
              <h3 class="line-clamp-2 text-base font-black text-slate-900">
                {{ travel.title }}
              </h3>

              <p class="mt-1 text-sm font-medium text-slate-500">
                {{ formatDateToSpanish(travel.trip_date) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="space-y-4 p-5">
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-100">
              <p
                class="text-[11px] font-bold uppercase tracking-wide text-rose-500"
              >
                Reservados
              </p>

              <p class="mt-2 text-2xl font-black text-rose-700">
                {{ travel.unavaible_seats }}
              </p>
            </div>

            <div class="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              <p
                class="text-[11px] font-bold uppercase tracking-wide text-emerald-500"
              >
                Disponibles
              </p>

              <p class="mt-2 text-2xl font-black text-emerald-700">
                {{ 15 - parseInt(travel.unavaible_seats) }}
              </p>
            </div>
          </div>

          <RouterLink
            class="inline-flex w-full items-center justify-center rounded-lg bg-experience-blue px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-experience-blue/90 hover:shadow-md "
            :to="{ name: 'list-passenger', params: { id: travel.id } }"
          >
            Ver pasajeros
          </RouterLink>
        </div>
      </article>
    </div>
  </div>
</template>