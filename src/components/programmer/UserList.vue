<script setup>

defineProps({
  usersList: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["edit-user", "delete-user"]);

const handleEdit = (user) => {
  emit("edit-user", user);
};

const handleDelete = (user) => {
  emit("delete-user", user);
};

const roles = {
  1: "Super administrador",
  2: "Administrador",
};

const userRol = (rol) => roles[rol] || "Sin rol";
</script>

<template>
  <div>
    <ul class="space-y-2">
      <li
        v-for="user in usersList"
        :key="user.id"
        class="border-[0.5px] rounded-sm hover:bg-gray-50 ease-in duration-300 p-3 py-5 flex justify-between items-center"
      >
        <div >
          <div class="flex items-center gap-3">
            <p>
              {{ user.full_name }}
            </p>
            <span class="text-xs text-white bg-experience-blue px-2 py-1 rounded-2xl">{{ userRol(user.admin) }}</span>
          </div>
             <span class="text-sm text-gray-500">@{{ user.username }}</span>
        </div>
     
        <div class="space-x-3 ease-in duration-300">
            <button
              class="text-sm cursor-pointer text-blue-600"
              @click="handleEdit(user)"
            >
              Editar
            </button>
            <button
              class="text-sm cursor-pointer  text-red-600 hover:underline"
              @click="handleDelete(user)"
            >
              Eliminar
            </button>
          </div>
      </li>
    </ul>
  </div>
</template>
