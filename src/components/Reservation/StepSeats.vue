<script setup>
import BusSeatSelector from "@/components/Reservation/BusSeatSelector.vue";
import ResumeCard from "@/components/Reservation/ResumeCard.vue";
import { onMounted, ref } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import { formatDateToSpanish } from "@/utils/formatDate";

const store = useReservaStore();

const loading = ref(true);

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});
</script>

<template>
  <div class="w-full">
    <!-- Skeleton Loader -->
    <div v-if="loading" class="w-full">
      <div class="flex flex-col gap-6 lg:flex-row max-w-4xl mx-auto lg:gap-10">
        <!-- Skeleton selector de asientos -->
        <div class="flex-1 rounded-xl border border-gray-200 p-5">
          <div class="animate-pulse">
            <!-- Título -->
            <div class="h-6 w-48 bg-gray-200 rounded mb-6"></div>

            <!-- Indicadores -->
            <div class="flex gap-4 mb-8">
              <div class="h-4 w-24 bg-gray-200 rounded"></div>
              <div class="h-4 w-24 bg-gray-200 rounded"></div>
              <div class="h-4 w-24 bg-gray-200 rounded"></div>
            </div>

            <!-- Simulación del bus/asientos -->
            <div class="rounded-xl bg-gray-100 p-5">
              <div class="h-5 w-32 bg-gray-200 rounded mx-auto mb-6"></div>

              <div class="grid grid-cols-4 gap-3 max-w-xs mx-auto">
                <div
                  v-for="seat in 24"
                  :key="seat"
                  class="h-9 rounded-md bg-gray-200"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Skeleton resumen de compra -->
        <div class="flex-1 flex justify-center lg:justify-around items-center">
          <div class="w-full rounded-lg border p-5 border-gray-200">
            <div class="animate-pulse">
              <!-- Título -->
              <div class="h-7 w-56 bg-gray-200 rounded mb-8"></div>

              <!-- Líneas de información -->
              <div class="space-y-5">
                <div>
                  <div class="h-4 w-40 bg-gray-200 rounded mb-2"></div>
                  <div class="h-5 w-52 bg-gray-200 rounded"></div>
                </div>

                <div>
                  <div class="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                  <div class="h-5 w-48 bg-gray-200 rounded"></div>
                </div>

                <div>
                  <div class="h-4 w-44 bg-gray-200 rounded mb-2"></div>
                  <div class="h-5 w-36 bg-gray-200 rounded"></div>
                </div>
              </div>

              <!-- Botones -->
              <div class="mt-8 flex flex-col md:flex-row gap-3 w-full">
                <div class="h-10 w-full bg-gray-200 rounded-md"></div>
                <div class="h-10 w-full bg-gray-300 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido real -->
    <div v-else>
      <div class="w-full max-w-5xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-2xl lg:text-4xl font-bold uppercase">
            Selección de asientos
          </h1>

          <p class="text-gray-500 mt-3 max-w-2xl mx-auto">
            Selecciona los asientos que deseas para tu reservación.
          </p>
        </div>
        <div
          v-if="store.date"
          class="flex flex-col gap-3 lg:flex-row max-w-4xl mx-auto lg:gap-10"
        >
          <div class="flex-1">
            <BusSeatSelector />
          </div>

          <div
            class="flex justify-center lg:justify-around items-center flex-1"
          >
            <ResumeCard />
          </div>
        </div>

        <!-- Opcional: cuando no haya fecha -->
        <div v-else class="max-w-4xl mx-auto text-center py-10 text-gray-500">
          Selecciona una fecha para continuar con tu reservación.
        </div>
      </div>
    </div>
  </div>
</template>
