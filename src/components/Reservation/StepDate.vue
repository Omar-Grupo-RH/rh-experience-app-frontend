<script setup>
import Calendar from "@/components/Reservation/Calendar.vue";
</script>

<template>
  <div class="w-full max-w-5xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-2xl lg:text-4xl font-bold uppercase">
        Fecha de reservación
      </h1>

      <p class="text-gray-500 mt-3 max-w-2xl mx-auto">
        Selecciona la fecha de tu reservación para continuar.
      </p>
    </div>

    <Calendar />
  </div>
</template>
