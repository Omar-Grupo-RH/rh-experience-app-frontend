import { useAdminAPI } from "@/composables/useAdmin";
import { defineStore } from "pinia";
import Swal from "sweetalert2";
import { ref } from "vue";

export const useClientStore = defineStore("clients", () => {
  const { getAllClients } = useAdminAPI();

  const showCreateModal = ref(false);
  const showEditModal = ref(false);
  const selectedClient = ref(null);
  const isLoading = ref(false);

  const clients = ref([]);

  async function getClients() {
    isLoading.value = true;
    try {
      clients.value = await getAllClients();
    } finally {
      isLoading.value = false;
    }
  }

  // Abrir modal de edición
  function openEditModal(client) {
    selectedClient.value = { ...client };
    showEditModal.value = true;
  }

  // Eliminar cliente
  function deleteClient(client) {
    Swal.fire({
      title: `¿Eliminar a ${client.first_name}?`,
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
        Swal.fire(
          "Eliminado",
          `${client.first_name} ha sido eliminado.`,
          "success"
        );
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

  return {
    clients,
    showCreateModal,
    showEditModal,
    selectedClient,
    openEditModal,
    deleteClient,
    updateClient,
    getClients,
  };
});
