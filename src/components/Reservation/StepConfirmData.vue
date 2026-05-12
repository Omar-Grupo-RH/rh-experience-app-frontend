<script setup>
import { computed } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import { formatDateToSpanish } from "@/utils/formatDate";
import { currencyFormat } from "@/utils/formatMoney";
const store = useReservaStore();

const breakdown = computed(() => store.priceBreakdown());
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="w-full flex flex-col lg:flex-row lg:items-start lg:gap-10">
      <div class="lg:max-w-xl lg:flex-2 mt-5 lg:mt-3">
        <ul class="space-y-5">
          <li
            v-for="(p, idx) in store.passengers"
            :key="p.seat"
            class="rounded border border-gray-200 flex"
          >
            <div
              class="flex flex-col justify-center items-center p-4 gap-2 border-gray-300 border-r-2"
            >
              <p class="lg:text-lg">
                <strong>Pasajero {{ idx + 1 }}</strong>
              </p>

              <div>
                <img
                  src="/svg/seat2.svg"
                  alt="Icono de un asiento"
                  class="w-5 xl:w-10"
                />
              </div>

              <p class="text-xs">Asiento {{ p.seat }}</p>
            </div>

            <div class="p-4">
              <p class="xl:text-lg uppercase font-semibold">
                {{ p.first_name }} {{ p.last_name }}
              </p>
              <p class="xl:text-lg">
                {{ formatDateToSpanish(p.born_date) }}
              </p>
              <p class="xl:text-lg">{{ p.phone || "—" }}</p>
              <p class="xl:text-lg">{{ p.email || "—" }}</p>
              <p class="xl:text-lg" v-if="p.allergies?.length">
                Alergias: {{ p.allergies.join(", ") }}
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div
        class="flex items-center justify-between rounded-lg border-gray-200 mt-3 border lg:flex-1 lg:sticky lg:top-8"
      >
        <div class="flex flex-col gap-1.5 w-full p-5">
          <h3 class="font-bold uppercase mb-5 lg:text-xl xl:text-2xl">
            Resumen de reservación
          </h3>
          <div>
            <div>
              <p>
                Fecha de RH EXPERIENCE:
                <span class="font-semibold">
                  {{ formatDateToSpanish(store.date) }}</span
                >
              </p>
              <p>
                Origen: <span class="font-semibold">Oficinas de Grupo RH</span>
              </p>
              <p>
                Asientos seleccionados:
                <span class="font-semibold">{{
                  store.selectedSeats.join(", ")
                }}</span>
              </p>
              
            </div>
          </div>

          <div
            class="mt-5 flex gap-2 items-center flex-col md:flex-row-reverse"
          >
            <button
              class="px-4 py-2 bg-experience-pink w-full text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              @click="store.next"
            >
              Continuar
            </button>
            <button
              class="py-2 px-4 rounded-md bg-gray-200 w-full cursor-pointer"
              @click="store.prev"
            >
              Regresar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
