<script setup>
import { computed } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";

const store = useReservaStore();



// Define el orden y textos de los pasos aquí
const steps = [
  {
    id: 1,
    label: "Tipo de pasajero",
    svg: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
  },
  {
    id: 2,
    label: "Inscripción",
    svg: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
  },
  {
    id: 3,
    label: "Fecha",
    svg: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
  },
  {
    id: 4,
    label: "Asientos",
    svg: "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z",
  },
  {
    id: 5,
    label: "Pasajeros",
    svg: "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z",
  },
  {
    id: 6,
    label: "Documentación",
    svg: "M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12",
  },
  {
    id: 7,
    label: "Confirmar",
    svg: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
];

// Helpers de estado
const isCompleted = (s) => store.step > s.id;
const isCurrent = (s) => store.step === s.id;

// La línea va del centro del primer círculo al centro del último
const lineInset = `${100 / (steps.length * 2)}%`;

// Cálculo dinámico para rellenar la línea azul
const progressWidth = computed(() => {
  const totalIntervals = steps.length - 1;
  const currentStep = Math.min(Math.max(store.step, 1), steps.length);
  return `${((currentStep - 1) / totalIntervals) * 100}%`;
});
</script>

<template>
  <nav
    aria-label="Progreso de compra"
    class="w-full max-w-4xl mx-auto px-2 sm:px-4 mb-8"
  >
    <div class="relative z-0">
      <div
        class="absolute top-4 sm:top-5 lg:top-6 h-1 bg-gray-200 rounded-full -z-10 transform -translate-y-1/2"
        :style="{ left: lineInset, right: lineInset }"
      >
        <div
          class="h-full bg-experience-pink rounded-full transition-all duration-500 ease-in-out"
          :style="{ width: progressWidth }"
        ></div>
      </div>

      <ol class="grid grid-cols-7 w-full">
        <li
          v-for="s in steps"
          :key="s.id"
          class="flex flex-col items-center text-center select-none"
        >
          <div
            class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300"
            :class="[
              isCompleted(s)
                ? 'bg-experience-pink border-experience-pink text-white scale-100'
                : isCurrent(s)
                  ? 'border-experience-pink text-experience-pink scale-105 shadow-md bg-gray-50'
                  : 'border-gray-300 text-gray-400 bg-gray-50',
            ]"
            :aria-current="isCurrent(s) ? 'step' : undefined"
          >
            <svg
              v-if="isCompleted(s)"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor"
              class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
            >
              <path
                d="M4 12.6111L8.92308 17.5L20 6.5"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>

            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path stroke-linecap="round" stroke-linejoin="round" :d="s.svg" />
            </svg>
          </div>

          <span
            class="mt-1.5 sm:mt-2 text-[9px] sm:text-xs lg:text-sm font-medium leading-tight transition-colors px-0.5 break-words"
            :class="
              isCompleted(s) || isCurrent(s) ? 'text-gray-900' : 'text-gray-500'
            "
          >
            {{ s.label }}
          </span>
        </li>
      </ol>
    </div>
  </nav>
</template>
