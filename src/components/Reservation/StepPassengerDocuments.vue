<script setup>
import { computed } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import PassengerIdentity from "./PassengerIdentity.vue";

const store = useReservaStore();

const passengers = computed(() => store.passengers);
const allDocumentsSelected = computed(() => store.canContinueDocuments);
</script>

<template>
  <section class="mx-auto max-w-5xl space-y-6 px-4 py-6">
    <div>
      <h2 class="text-3xl font-bold text-experience-blue">
        Documentación de pasajeros
      </h2>

      <p class="mt-2 text-slate-500">
        Cada pasajero deberá proporcionar el frente y reverso de su
        identificación oficial.
      </p>
    </div>

    <div
      v-if="!passengers.length"
      class="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500"
    >
      No hay pasajeros registrados. Regresa al paso anterior para agregarlos.
    </div>

    <PassengerIdentity
      v-for="(passenger, index) in passengers"
      :key="passenger.seat"
      :passenger="passenger"
      :index="index"
    />

    <div class="rounded-xl bg-slate-50 p-5">
      <p class="font-semibold text-slate-800">Estado de documentación</p>

      <p
        class="mt-2 text-sm"
        :class="allDocumentsSelected ? 'text-green-700' : 'text-amber-700'"
      >
        {{
          allDocumentsSelected
            ? "Todas las identificaciones están cargadas."
            : `Faltan identificaciones de ${store.pendingDocumentsCount} pasajero${
                store.pendingDocumentsCount === 1 ? "" : "s"
              }.`
        }}
      </p>
    </div>

    <div class="flex w-full flex-col gap-3 md:flex-row">
      <button
        type="button"
        class="w-full cursor-pointer rounded-md bg-gray-200 px-4 py-2"
        @click="store.prev"
      >
        Regresar
      </button>

      <button
        type="button"
        class="w-full cursor-pointer rounded-md bg-experience-blue px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!allDocumentsSelected"
        @click="store.next"
      >
        Siguiente
      </button>
    </div>
  </section>
</template>
