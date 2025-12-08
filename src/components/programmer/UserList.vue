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
</script>

<template>
  <div>
    <ul class="space-y-2">
      <li
        v-for="user in usersList"
        :key="user.id"
        class="bg-gray-50 hover:bg-gray-100 ease-in duration-300 p-3 flex justify-between items-center"
      >
        {{ user.username }}
        <div class="space-x-3 ease-in duration-300">
          <button
            class="text-xs cursor-pointer bg-blue-200 ease-in duration-300 hover:bg-blue-300 px-1.5 py-1 rounded-4xl text-blue-700"
            @click="handleEdit(user)"
          >
            editar
          </button>
          <button
            class="text-xs cursor-pointer bg-red-200 ease-in duration-300 hover:bg-red-300 px-1.5 py-1 rounded-4xl text-red-700"
            @click="handleDelete(user)"
          >
            eliminar
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
