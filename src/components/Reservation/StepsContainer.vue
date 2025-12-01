<script setup>
import { computed } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";

const store = useReservaStore();

// Define el orden y textos de los pasos aquí
const steps = [
  { id: 1, label: "Fecha" },
  { id: 2, label: "Asientos" },
  { id: 3, label: "Pasajeros" },
  { id: 4, label: "Confirmar" },
  { id: 5, label: "Pago" },
];

// Porcentaje de la línea activa
const progress = computed(() => {
  const idx = Math.max(1, Math.min(store.step, steps.length));
  if (steps.length <= 1) return 0;
  return ((idx - 1) / (steps.length - 1)) * 100;
});

// Helpers de estado
const isCompleted = (s) => store.step > s.id;
const isCurrent = (s) => store.step === s.id;
</script>

<template>
  <nav aria-label="Progreso de compra" class="w-full max-w-4xl mx-auto px-4">
    <div class="relative">
      <div
        class="absolute top-4  left-5 right-5 h-0.5 bg-gray-200 rounded-full"
      ></div>

      <div class="absolute top-4  left-5 right-5 h-0.5">
        <div
          class="h-full bg-experience-pink rounded-full transition-[width] duration-500"
          :style="{ width: progress + '%' }"
        ></div>
      </div>

      <ol class="relative z-10 grid grid-cols-5">
        <li
          v-for="s in steps"
          :key="s.id"
          class="flex flex-col items-center text-center select-none"
        >
          <!-- Punto del paso -->
          <div
            class="size-8  rounded-full border-2 flex items-center justify-center transition-all duration-300"
            :class="[
              isCompleted(s)
                ? 'bg-experience-pink border-experience-pink text-white scale-100'
                : isCurrent(s)
                ? 'border-experience-pink text-experience-pink scale-105 shadow-sm bg-gray-50'
                : 'border-gray-300 text-gray-400 bg-gray-50',
            ]"
            :aria-current="isCurrent(s) ? 'step' : undefined"
          >
            <svg
              v-if="isCompleted(s)"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#FFFFFF"
              class="size-5"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M4 12.6111L8.92308 17.5L20 6.5"
                  stroke="#FFFFFF"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </g>
            </svg>
            <span v-else class="font-semibold text-sm ">{{ s.id }}</span>
          </div>

          <!-- Etiqueta -->
          <span
            class="mt-2 text-[10px] font-medium transition-colors lg:text-base"
            :class="[
              isCompleted(s) || isCurrent(s)
                ? 'text-experience-pink'
                : 'text-gray-400',
            ]"
          >
            {{ s.label }}
          </span>
        </li>
      </ol>
    </div>
  </nav>
</template>
