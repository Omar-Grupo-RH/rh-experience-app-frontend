<script setup>
import ModalCreateClient from "@/components/admin/Clients/ModalCreateClient.vue";
import ModalEditClient from "@/components/admin/Clients/ModalEditClient.vue";
import { useClientStore } from "@/stores/clientStore";
import { formatDateToSpanish } from "@/utils/formatDate";

const store = useClientStore();
</script>

<template>
  <div>
    <div class="space-y-5" v-if="store.clients.length > 0">
      <div class="flex justify-end">
        <button
          @click="store.showCreateModal = true"
          class="bg-experience-pink text-white px-4 py-2 rounded cursor-pointer shadow"
        >
          + Nuevo cliente
        </button>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-center p-3 font-normal">Cliente</th>
            <th class="text-center p-3 font-normal">Contacto</th>
            <th class="text-center p-3 font-normal">Tours Reservados</th>
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
            <td class="p-3">{{ client.toursBooked }}</td>
            <td class="p-3">{{ formatDateToSpanish(client.joinDate) }}</td>
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
                @click="store.deleteClient(client)"
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
        <button
          @click="showCreateModal = true"
          class="bg-experience-pink text-white px-4 py-2 rounded cursor-pointer shadow"
        >
          + Nuevo cliente
        </button>
      </div>
    </div>

    <!-- Modales -->
    <ModalCreateClient
      v-if="store.showCreateModal"
      @close="store.showCreateModal = false"
    />

    <ModalEditClient
      v-if="store.showEditModal"
      :client="store.selectedClient"
      @close="store.showEditModal = false"
      @update="store.updateClient"
    />
  </div>
</template>
