<script setup>
import { useTravelStore } from "@/stores/admin/travelStore";
import { onMounted } from "vue";
import TravelsTable from "@/components/admin/Travels/TravelsTable.vue";

const store = useTravelStore();

onMounted(async () => {
  await store.getTravels();
});
</script>

<template>
  <div class="mx-auto lg:p-5 space-y-10">
    <div class="flex justify-between items-center">
      <div class="space-y-1">
        <h2 class="text-4xl font-semibold">Tus pasajeros</h2>
        <p class="text-gray-400">Administra a tus pasajeros desde aqui.</p>
      </div>
    </div>

    <div class="lg:p-5">
      <TravelsTable v-if="store.hasTravels" :travels="store.travels" />
      <div
        v-else
        class="flex min-h-[260px] flex-col items-center justify-center border-slate-300 bg-slate-50 px-6 py-10 text-center"
      >
        <h3 class="text-lg font-bold text-slate-900">
          No hay viajes registrados
        </h3>
        <RouterLink
          :to="{ name: 'calendar' }"
          class="mt-1 max-w-lg text-sm text-slate-500 underline transition hover:text-slate-700"
        >
          Agenda un RH EXPERIENCE para que los pasajeros puedan registrarse.
        </RouterLink>
      </div>
    </div>
  </div>
</template>
