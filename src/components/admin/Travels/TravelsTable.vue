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

    <!-- Desktop table -->
    <div
      v-else
      class="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block"
    >
      <table class="w-full">
        <thead class="bg-slate-50">
          <tr class="border-b border-slate-200">
            <th
              class="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Título
            </th>
            <th
              class="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Fecha de salida
            </th>
            <th
              class="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Asientos reservados
            </th>
            <th
              class="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Asientos disponibles
            </th>
            <th
              class="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Acciones
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="travel in travels"
            :key="travel.id"
            class="group transition-colors duration-200 hover:bg-slate-50/80"
          >
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-experience-blue/10 text-experience-blue"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
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

                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-slate-900">
                    {{ travel.title }}
                  </p>
                 
                </div>
              </div>
            </td>

            <td class="px-5 py-4 text-sm font-medium text-slate-700">
              {{ formatDateToSpanish(travel.trip_date) }}
            </td>

            <td class="px-5 py-4 text-center">
              <span
                class="inline-flex min-w-12 items-center justify-center rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-700 ring-1 ring-rose-100"
              >
                {{ travel.unavaible_seats }}
              </span>
            </td>

            <td class="px-5 py-4 text-center">
              <span
                class="inline-flex min-w-12 items-center justify-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100"
              >
                {{ 15 - parseInt(travel.unavaible_seats) }}
              </span>
            </td>

            <td class="px-5 py-4 text-right">
              <RouterLink
                class="inline-flex items-center justify-center rounded-full bg-experience-pink px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-experience-pink/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-experience-pink/30"
                :to="{ name: 'list-passenger', params: { id: travel.id } }"
              >
                Ver pasajeros
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <div v-if="travels.length" class="grid gap-4 md:hidden">
      <article
        v-for="travel in travels"
        :key="travel.id"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-experience-blue/10 text-experience-blue"
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
            <h3 class="truncate text-base font-bold text-slate-900">
              {{ travel.title }}
            </h3>
            <p class="mt-1 text-sm text-slate-500">
              {{ formatDateToSpanish(travel.trip_date) }}
            </p>
          </div>
        </div>

        <div class="mt-5 grid  gap-3">
          <div class="rounded-lg bg-rose-50 p-2 ring-1 ring-rose-100">
            <p class="text-xs font-semibold uppercase tracking-wide text-rose-500">
              Reservados
            </p>
            <p class="mt-1 text-xl font-black text-rose-700">
              {{ travel.unavaible_seats }}
            </p>
          </div>

          <div class="rounded-lg bg-emerald-50 p-2 ring-1 ring-emerald-100">
            <p class="text-xs font-semibold uppercase tracking-wide text-emerald-500">
              Disponibles
            </p>
            <p class="mt-1 text-xl font-black text-emerald-700">
              {{ 15 - parseInt(travel.unavaible_seats) }}
            </p>
          </div>
        </div>

        <RouterLink
          class="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-experience-pink px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-experience-pink/90 active:scale-[0.99]"
          :to="{ name: 'list-passenger', params: { id: travel.id } }"
        >
          Ver pasajeros
        </RouterLink>
      </article>
    </div>
  </div>
</template>