import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useUser } from "@/composables/useUser";
import Swal from "sweetalert2";
export const useUserStore = defineStore("users", () => {
  const { listUsers, addUser, deleteUser } = useUser();

  const users = ref([]);
  const loading = ref(false);
  const showEditModal = ref(false);
  const showCreateModal = ref(false);
  const selectedUser = ref(null);
  const formNewUser = ref({
    username: "",
    admin: "",
    password: "",
  });

  const hasUsers = computed(() => users.value.length > 0);

  async function getUsers() {
    try {
      loading.value = true;
      const { data } = await listUsers();
      users.value = data;
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
  }

  const handleEditUser = (user) => {
    selectedUser.value = { ...user };
    showEditModal.value = true;
  };

  const openCreateModal = () => {
    formNewUser.value = {
      username: "",
      password: "",
    };
    showCreateModal.value = true;
  };

  const closeEditModal = () => {
    showEditModal.value = false;
    selectedUser.value = null;
  };

  const closeCreateModal = () => {
    showCreateModal.value = false;
  };

  const handleCreateUser = async (payload) => {
    try {
      const { data } = await addUser(payload);
      users.value.push(data);
      Swal.fire({
        title: `${data.username} agregado correctamente`,
        text: "El usuario ha sido registrado.",
        icon: "success",
        timer: 1500,
      });
      showCreateModal.value = false;
    } catch (error) {
      const { message } = error.response.data;
      Swal.fire({ title: message, icon: "error", timer: 2000 });
    }
  };

  const handleDeleteUser = async (user) => {
    const prevUsers = [...users.value];
    const result = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: `Se eliminará el usuario ${user.username}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e53e3e",
    });

    if (result.isConfirmed) {
      try {
        await deleteUser({ id: user.id });
        Swal.fire({
          title: "Eliminado",
          text: `${user.username} eliminado correctamente`,
          icon: "success",
          timer: 2000,
        });
        users.value = users.value.filter((u) => u.id !== user.id);
      } catch (error) {
        console.error(error);
        users.value = prevUsers;
        Swal.fire("Error", "No se pudo eliminar el usuario", "error");
      }
    }
  };

  return {
    users,
    hasUsers,
    getUsers,
    loading,
    showEditModal,
    selectedUser,
    handleEditUser,
    closeEditModal,
    handleDeleteUser,
    showCreateModal,
    openCreateModal,
    closeCreateModal,
    formNewUser,
    handleCreateUser,
  };
});
