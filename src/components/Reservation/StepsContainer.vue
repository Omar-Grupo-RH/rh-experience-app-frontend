<script setup>
import { computed } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";

const store = useReservaStore();

// Define el orden y textos de los pasos aquí
const steps = [
  {
    id: 1,
    label: "Fecha",
    svg: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
  },
  { id: 2, label: "Asientos", svg: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" },
  {
    id: 3,
    label: "Pasajeros",
    svg: "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z",
  },
  { id: 4, label: "Resumen", svg: "M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" },
  { id: 5, label: "Confirmar", svg: "M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" },
];


// Helpers de estado
const isCompleted = (s) => store.step > s.id;
const isCurrent = (s) => store.step === s.id;
</script>

<template>
  <nav aria-label="Progreso de compra" class="w-full max-w-4xl mx-auto px-4">
    <div class="relative">
      <div
        class="absolute top-7 left-16 right-16 h-0.5 bg-gray-200 rounded-full"
      ></div>

      <ol class="relative z-10 grid grid-cols-5">
        <li
          v-for="s in steps"
          :key="s.id"
          class="flex flex-col items-center text-center select-none"
        >
          <!-- Punto del paso -->
          <div
            class="size-14 rounded-full border-2 flex items-center justify-center transition-all duration-300"
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
            <svg
              v-else
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
                :d="
                  s.svg ||
                  'M6.633 10.5c0 .806-.693 1.5-1.5 1.5S3 11.306 3 10.5m0-3c0-.806.693-1.5 1.5-1.5s1.5.694 1.5 1.5m-3 0h3m10.493 3c0-.806-.693-1.5-1.5-1.5s-1.5.694-1.5 1.5m0 3c0 .806.693 1.5 1.5 1.5s1.5-.694 1.5-1.5m-3 0h3'
                "
              />
            </svg>
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
