<script setup>
import { useReservaStore } from "@/stores/public/reservaStore";

const store = useReservaStore();

const handleSelect = (type) => {
  store.setRegistrationType(type);
};

const handleNext = () => {
  if (!store.canContinueRegistrationType) return;

  store.next();
};
</script>

<template>
  <div class="w-full max-w-5xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-2xl lg:text-4xl font-bold uppercase">
        Tipo de inscripción
      </h1>

      <p class="text-gray-500 mt-3 max-w-2xl mx-auto">
        Selecciona la opción que corresponde a tu reservación para continuar.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <button
        v-for="type in store.registrationTypes"
        :key="type.value"
        type="button"
        class="group text-left rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer"
        :class="
          store.registrationType === type.value
            ? 'border-experience-blue bg-blue-50 ring-2 ring-experience-blue/20'
            : 'border-gray-200 bg-white hover:border-experience-blue'
        "
        @click="handleSelect(type.value)"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="font-bold text-lg text-gray-900">
              {{ type.title }}
            </h3>

            <p class="text-sm text-gray-500 mt-2 leading-relaxed">
              {{ type.description }}
            </p>
          </div>

          <div
            class="h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-1"
            :class="
              store.registrationType === type.value
                ? 'border-experience-blue bg-experience-blue'
                : 'border-gray-300'
            "
          >
            <div
              v-if="store.registrationType === type.value"
              class="h-2 w-2 rounded-full bg-white"
            ></div>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-2">
          <span
            v-if="type.free"
            class="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
          >
            Sin costo
          </span>

          <span
            v-else
            class="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700"
          >
            Requiere ficha de pago
          </span>

          <span
            v-if="type.allowsExtra"
            class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
          >
            Incluye acompañante
          </span>
        </div>
      </button>
    </div>

    <div class="mt-8 flex justify-end">
      <button
        type="button"
        class="w-full md:w-auto px-6 py-3 rounded-md bg-experience-blue cursor-pointer text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
        :disabled="!store.canContinueRegistrationType"
        @click="handleNext"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>