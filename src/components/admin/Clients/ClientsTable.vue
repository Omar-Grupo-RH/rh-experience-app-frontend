<script setup>
import { useClientStore } from "@/stores/clientStore";
import { formatDateToSpanish } from "@/utils/formatDate";
import { onMounted } from "vue";
import { RouterLink } from "vue-router";

const store = useClientStore();

onMounted(() => {
  store.getClients();
});
</script>

<template>
  <div>
    <div class="space-y-5" v-if="store.clients.length > 0">
      <div class="flex justify-end">
        <RouterLink
          :to="{ name: 'new-client' }"
          class="bg-experience-pink text-white px-4 py-2 rounded cursor-pointer shadow"
        >
          + Nuevo cliente
        </RouterLink>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-center p-3 font-normal">Cliente</th>
            <th class="text-center p-3 font-normal">Contacto</th>
            <th class="text-center p-3 font-normal">Alergias</th>
            <th class="text-center p-3 font-normal">Fecha de registro</th>
            <th class="text-center p-3 font-normal">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="client in store.clients"
            :key="client.id"
            class="border-b border-gray-200 hover:bg-gray-50 text-center"
          >
            <td class="p-3 font-medium">{{ client.first_name }}</td>
            <td class="p-3 text-sm text-gray-600">
              <div>{{ client.email }}</div>
              <div>{{ client.phone }}</div>
            </td>
            <td class="p-3">
              <div class="flex justify-center flex-wrap gap-2">
                <span
                  v-for="(allergy, i) in client.allergies"
                  :key="i"
                  class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full"
                >
                  {{ allergy }}
                </span>

                <span
                  v-if="!client.allergies || client.allergies.length === 0"
                  class="text-gray-400 italic text-xs"
                >
                  Sin alergias
                </span>
              </div>
            </td>

            <td class="p-3">{{ formatDateToSpanish(client.created_at) }}</td>
            <td class="p-3">
              <button
                class="text-experience-blue hover:underline cursor-pointer"
                @click="store.openEditModal(client)"
              >
                Editar
              </button>
              |
              <button
                class="text-red-500 hover:underline cursor-pointer"
                @click="store.deleteClient(client.id)"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else>
      <p class="text-center text-gray-500">No hay clientes registrados.</p>
      <div class="flex justify-end mt-4">
        <RouterLink
          :to="{ name: 'new-client' }"
          class="bg-experience-pink text-white px-4 py-2 rounded cursor-pointer shadow"
        >
          + Nuevo cliente
        </RouterLink>
      </div>
    </div>
  </div>
</template>
