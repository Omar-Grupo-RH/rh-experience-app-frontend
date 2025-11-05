<script setup>
import Calendar from "@/components/Reservation/Calendar.vue";
import BusSeatSelector from "@/components/Reservation/BusSeatSelector.vue";
import { computed } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import { formatDateToSpanish } from "@/utils/formatDate";
import { currencyFormat } from "@/utils/formatMoney";


const breakdown = computed(() => store.priceBreakdown());

const store = useReservaStore();

</script>

<template>
  <div class="flex flex-col xl:flex-row justify-between xl:gap-5">
    <div class="xl:w-[70%]">
      <p class="xl:text-lg font-medium mb-5">Selecciona tu fecha</p>
      <div class="h-auto">
        <Calendar />
      </div>
    </div>

    <div v-if="store.date" class="xl:w-[25%]">
      <p class="xl:text-lg font-medium mb-5 text-center">
        Selecciona tus asientos
      </p>
      <BusSeatSelector />

      <div class="flex items-center justify-between mt-3">
        <div class="flex flex-col gap-1.5">
          <p class="text-sm">
            Fecha escogida:
            <strong>{{ formatDateToSpanish(store.date) }}</strong>
          </p>
          <p class="text-sm">
            Asientos seleccionados:
            <strong v-if="store.selectedSeats.length">{{
              store.selectedSeats.join(", ")
            }}</strong>
            <span v-else class="text-gray-400">— ninguno —</span>
          </p>
          <div v-if="store.selectedSeats.length">
            <p class="text-gray-500 text-sm">
              {{ breakdown.breakdownText }}
            </p>
          </div>
          <p class="text-lg font-semibold" v-if="store.selectedSeats.length">
            Total: {{ currencyFormat(store.total) }} MXN
          </p>
        </div>
      </div>
      <div class="lg:flex lg:justify-end">
        <button
          class="px-4 py-2 rounded-md bg-experience-pink text-white disabled:opacity-50 cursor-pointer mt-5 w-full lg:w-fit"
          :disabled="store.selectedSeats.length === 0 || !store.date"
          @click="store.next"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>
