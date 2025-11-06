<script setup>
import BusSeatSelector from "@/components/Reservation/BusSeatSelector.vue";
import { computed, onMounted, ref } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import { formatDateToSpanish } from "@/utils/formatDate";
import { currencyFormat } from "@/utils/formatMoney";

const breakdown = computed(() => store.priceBreakdown());

const store = useReservaStore();
const loading = ref(true);
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});
</script>

<template>
  <div>
    <div
      v-if="loading"
      class="w-full flex flex-col lg:flex-row justify-evenly items-center p-10 h-[500px]"
    >
      <div class="w-full lg:w-[30%] h-full bg-gray-200 animate-pulse"></div>
      <div class="w-full lg:w-[40%] h-1/2 bg-gray-200 animate-pulse"></div>
    </div>
    <div v-else>
      <div
        v-if="store.date"
        class="flex flex-col gap-3 lg:flex-row max-w-4xl mx-auto lg:gap-10"
      >
        <div class="flex-1">
          <BusSeatSelector />
        </div>
        <div class="flex justify-center lg:justify-around items-center flex-1">
          <div class="rounded-lg border p-5 border-gray-200">
            <div class="flex items-center justify-between mt-3 w-full">
              <div class="flex flex-col gap-1.5">
                <h3 class="font-bold uppercase mb-5 lg:text-xl xl:text-2xl">
                  Resumen de compra
                </h3>
                <p>
                  Fecha de RH EXPERIENCE:
                  <span class="font-semibold">
                    {{ formatDateToSpanish(store.date) }}</span
                  >
                </p>
                <p>
                  Origen:
                  <span class="font-semibold">Oficinas de Grupo RH</span>
                </p>

                <p>
                  Asientos seleccionados:
                  <span
                    class="font-semibold"
                    v-if="store.selectedSeats.length"
                    >{{ store.selectedSeats.join(", ") }}</span
                  >
                  <span v-else class="text-gray-400">— ninguno —</span>
                </p>
                <div v-if="store.selectedSeats.length">
                  <p>
                    Boletos:
                    <span class="font-semibold">{{
                      breakdown.breakdownText
                    }}</span>
                  </p>
                </div>
                <p
                  class="text-xl font-bold uppercase mt-5"
                  v-if="store.selectedSeats.length"
                >
                  Total: {{ currencyFormat(store.total) }} MXN
                </p>
              </div>
            </div>
            <div class="mt-5 flex flex-col md:flex-row gap-3 w-full">
              <button
                class="px-4 py-2 rounded-md bg-gray-200 cursor-pointer w-full"
                @click="store.prev"
              >
                Regresar
              </button>
              <button
                class="px-4 py-2 rounded-md bg-experience-pink text-white disabled:opacity-50 cursor-pointer w-full"
                :disabled="store.selectedSeats.length === 0 || !store.date"
                @click="store.next"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
