<script setup>
import { computed } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import { formatDateToSpanish } from "@/utils/formatDate";

const props = defineProps({
  nextLabel: {
    type: String,
    default: "Siguiente",
  },
  disabledNext: {
    type: Boolean,
    default: false,
  },
  showAdultError: {
    type: Boolean,
    default: false,
  },
});

const store = useReservaStore();

const isNextDisabled = computed(() => {
  return props.disabledNext || store.selectedSeats.length === 0 || !store.date;
});
</script>

<template>
  <div class="rounded-lg border p-5 border-gray-200 space-y-5 w-full lg:w-auto">
    <div class="flex items-center justify-between mt-3 w-full">
      <div class="flex flex-col gap-1.5 w-full">
        <h3 class="font-bold uppercase mb-3 lg:text-xl">
          Resumen de reservación
        </h3>

        <p class="text-sm">
          Fecha seleccionada:
          <span class="font-semibold">
            {{ formatDateToSpanish(store.date) }}
          </span>
        </p>

        <p class="text-sm">
          Origen:
          <span class="font-semibold">Oficinas de Grupo RH</span>
        </p>

        <p class="text-sm">
          Asientos seleccionados:
          <span v-if="store.selectedSeats.length" class="font-semibold">
            {{ store.selectedSeats.join(", ") }}
          </span>
          <span v-else class="text-gray-400">— ninguno —</span>
        </p>
      </div>
    </div>

    <div class="mt-5 flex flex-col md:flex-row gap-3 w-full">
      <button
        type="button"
        class="px-4 py-2 rounded-md bg-gray-200 cursor-pointer w-full"
        @click="store.prev"
      >
        Regresar
      </button>

      <button
        type="button"
        class="px-4 py-2 rounded-md bg-experience-blue text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full"
        :disabled="isNextDisabled"
        @click="store.next"
      >
        {{ nextLabel }}
      </button>
    </div>

    <p
      v-if="showAdultError && !store.allAdults"
      class="text-red-600 text-sm mt-2"
    >
      Es obligatorio que los pasajeros sean mayores de edad.
    </p>
  </div>
</template>
