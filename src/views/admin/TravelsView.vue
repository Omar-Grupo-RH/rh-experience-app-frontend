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
  <div class="max-w-7xl mx-auto p-5 space-y-10">
    <div class="flex justify-between items-center">
      <div class="space-y-1">
        <h2 class="text-4xl font-semibold">Tus viajes</h2>
        <p class="text-gray-400">Administra a tus pasajeros desde aqui.</p>
      </div>
    </div>

    <div class="rounded-lg bg-white p-5">
      <TravelsTable v-if="store.hasTravels" :travels="store.travels" />
      <div v-else>
        <p class="text-center text-gray-500">No hay viajes registrados.</p>
      </div>
    </div>
  </div>
</template>
