<script setup>
import ClientsTable from "@/components/admin/Clients/ClientsTable.vue";
</script>

<template>
  <div class="max-w-7xl mx-auto p-5 space-y-10">
    <div class="flex justify-between items-center">
      <div class="space-y-1">
        <h2 class="text-4xl font-semibold">Gestión de Clientes</h2>
        <p class="text-gray-400">
          Administra tu base de clientes: agregar, editar o eliminar registros
        </p>
      </div>
    </div>

    <div class="rounded-lg shadow bg-white p-5">
      <ClientsTable />
    </div>
  </div>
</template>
