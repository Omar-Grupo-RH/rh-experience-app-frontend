import { defineStore } from "pinia";
import Swal from "sweetalert2";
import { ref } from "vue";

export const useClientStore = defineStore("clients", () => {
  const showCreateModal = ref(false);
  const showEditModal = ref(false);
  const selectedClient = ref(null);

  const clients = ref([
    {
      id: "1",
      first_name: "María González",
      email: "maria.gonzalez@email.com",
      phone: "6123456789",
      toursBooked: 3,
      joinDate: "2025-09-29",
    },
    {
      id: "2",
      first_name: "Carlos Ruiz",
      email: "carlos.ruiz@email.com",
      phone: "6234567890",
      toursBooked: 5,
      joinDate: "2025-10-05",
    },
  ]);

  function getTodayForDB() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
  };
});
