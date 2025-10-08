<script setup>
import { RouterLink } from "vue-router";
import CalendarAdmin from "@/components/admin/Calendar/CalendarAdmin.vue";
</script>

<template>
  <div class="max-w-7xl mx-auto p-5 space-y-10">
    <div class="flex justify-between items-center">
      <div class="space-y-1">
        <h2 class="text-4xl font-semibold">Gestión de Fechas</h2>
        <p class="text-gray-400">Administra tus tours y eventos desde aquí.</p>
      </div>
    </div>

    <div class="rounded-lg shadow bg-white p-5">
      <CalendarAdmin />
    </div>
  </div>
</template>
