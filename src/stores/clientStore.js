// src/stores/clientStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import Swal from "sweetalert2";
import { useAdminAPI } from "@/composables/useAdmin";

export const useClientStore = defineStore("clients", () => {
  const { getAllClients, destroyClient } = useAdminAPI();
  const isLoading = ref(false);
  const clients = ref([]);

  async function getClients() {
    isLoading.value = true;
    try {
      const list = await getAllClients();
      clients.value = list.map((client) => ({
        ...client,
        allergies: client.allergies ? JSON.parse(client.allergies) : [],
      }));
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteClient(clientId) {
    const prev = [...clients.value];
    const target = clients.value.find((c) => c.id === clientId);
    if (!target) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Eliminar a ${target.first_name}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!isConfirmed) return;

    clients.value = clients.value.filter((c) => c.id !== clientId);
    try {
      await destroyClient(clientId);
      Swal.fire(
        "Eliminado",
        `${target.first_name} ha sido eliminado.`,
        "success"
      );
    } catch (e) {
      console.error(e);
      clients.value = prev; // rollback
      Swal.fire("Error", "No se pudo eliminar el cliente.", "error");
    }
  }

  return {
    clients,
    deleteClient,
    getClients,
  };
});
