<script setup>
import { ref } from "vue";
import Swal from "sweetalert2";
import ModalCreateClient from "@/components/admin/Clients/ModalCreateClient.vue";
import ModalEditClient from "@/components/admin/Clients/ModalEditClient.vue";

const clients = ref([
  {
    id: "1",
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "6123456789",
    toursBooked: 3,
    joinDate: "15 Ene 2024",
  },
  {
    id: "2",
    name: "Carlos Ruiz",
    email: "carlos.ruiz@email.com",
    phone: "6234567890",
    toursBooked: 5,
    joinDate: "22 Feb 2024",
  },
]);

// Estado de modales
const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedClient = ref(null);

// Abrir modal de edición
function openEditModal(client) {
  selectedClient.value = { ...client };
  showEditModal.value = true;
}

// Eliminar cliente
function deleteClient(client) {
  Swal.fire({
    title: `¿Eliminar a ${client.name}?`,
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      clients.value = clients.value.filter((c) => c.id !== client.id);
      Swal.fire("Eliminado", `${client.name} ha sido eliminado.`, "success");
    }
  });
}

// Actualizar cliente después de editar
function updateClient(updated) {
  const index = clients.value.findIndex((c) => c.id === updated.id);
  if (index !== -1) clients.value[index] = updated;
  showEditModal.value = false;
  Swal.fire("Actualizado", `Cliente Modificado Correctamente.`, "success");
}

// Agregar nuevo cliente
function addClient(newClient) {
  clients.value.push({
    id: Date.now().toString(),
    ...newClient,
    toursBooked: 0,
    joinDate: new Date().toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  });
  showCreateModal.value = false;

  Swal.fire("Agregado", `Cliente Agregado Correctamente.`, "success");
}
</script>

<template>
  <div>
    <div class="space-y-5" v-if="clients.length > 0">
      <div class="flex justify-end">
        <button
          @click="showCreateModal = true"
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
            v-for="client in clients"
            :key="client.id"
            class="border-b border-gray-200 hover:bg-gray-50 text-center"
          >
            <td class="p-3 font-medium">{{ client.name }}</td>
            <td class="p-3 text-sm text-gray-600">
              <div>{{ client.email }}</div>
              <div>{{ client.phone }}</div>
            </td>
            <td class="p-3">{{ client.toursBooked }}</td>
            <td class="p-3">{{ client.joinDate }}</td>
            <td class="p-3">
              <button
                class="text-experience-blue hover:underline cursor-pointer"
                @click="openEditModal(client)"
              >
                Editar
              </button>
              |
              <button
                class="text-red-500 hover:underline cursor-pointer"
                @click="deleteClient(client)"
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
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @create="addClient"
    />

    <ModalEditClient
      v-if="showEditModal"
      :client="selectedClient"
      @close="showEditModal = false"
      @update="updateClient"
    />
  </div>
</template>
