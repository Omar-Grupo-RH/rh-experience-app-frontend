<script setup>
import CouponsTable from "@/components/admin/Coupons/CouponsTable.vue";
</script>

<template>
  <div class="mx-auto p-5 space-y-10">
    <div class="flex justify-between items-center">
      <div class="space-y-1">
        <h2 class="text-4xl font-semibold">Gestión de Cupones</h2>
        <p class="text-gray-400">Administra los cupones de descuento aquí.</p>
      </div>
    </div>

    <div class="rounded-lg shadow bg-white p-5">
      <CouponsTable />
    </div>
  </div>
</template>
