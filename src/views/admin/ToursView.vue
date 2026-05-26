<script setup>
import CalendarAdmin from "@/components/admin/Calendar/CalendarAdmin.vue";
</script>

<template>
  <div class="mx-auto lg:p-5 space-y-10 ">
    <div class="flex justify-between items-center">
      <div class="space-y-1">
        <h2 class="text-4xl font-semibold">Gestión de viajes</h2>
        <p class="text-gray-400 text-sm">Administra los RH Experience en este calendario.</p>
      </div>
    </div>

    <div class="w-full h-[600px] lg:h-[750px] ">
      <CalendarAdmin />
    </div>
  </div>
</template>
