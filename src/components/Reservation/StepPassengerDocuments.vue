<script setup>
import { computed } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import PassengerIdentity from "./PassengerIdentity.vue";
import PassengerWaiver from "./PassengerWaiver.vue";

const store = useReservaStore();
const passengers = computed(() => store.passengers);
const allComplete = computed(() => store.canContinueDocuments);
</script>

<template>
  <section class="mx-auto max-w-5xl space-y-6 px-4 py-6">
    <div>
      <p class="text-sm font-semibold uppercase text-experience-blue">
        Paso 6 · Documentación obligatoria
      </p>

      <h2 class="mt-2 text-3xl font-bold text-experience-blue">
        Identificación y carta responsiva
      </h2>

      <p class="mt-2 text-slate-500">
        Cada pasajero debe proporcionar su INE, leer las condiciones y firmar
        individualmente su carta responsiva.
      </p>
    </div>

    <div
      v-if="!passengers.length"
      class="rounded-xl border border-dashed p-6 text-center"
    >
      Regresa al paso anterior para agregar pasajeros.
    </div>

    <div
      v-for="(passenger, index) in passengers"
      :key="String(passenger.seat)"
      class="space-y-4"
    >
      <PassengerIdentity :passenger="passenger" :index="index" />

      <PassengerWaiver :passenger="passenger" :index="index" />
    </div>

    <div class="rounded-xl bg-slate-50 p-5">
      <p class="font-bold text-slate-800">Estado de documentación</p>

      <p
        class="mt-2 text-sm"
        :class="allComplete ? 'text-green-700' : 'text-amber-700'"
      >
        {{
          allComplete
            ? "Todos los INE y responsivas están completos."
            : `Falta completar la documentación de
               ${store.pendingDocumentsCount}
               pasajero(s).`
        }}
      </p>
    </div>

    <div class="flex flex-col gap-3 md:flex-row">
      <button
        type="button"
        class="w-full rounded-md bg-gray-200 px-4 py-3"
        @click="store.prev"
      >
        Regresar
      </button>

      <button
        type="button"
        class="w-full rounded-md bg-experience-blue px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!allComplete"
        @click="store.next"
      >
        Siguiente
      </button>
    </div>
  </section>
</template>
