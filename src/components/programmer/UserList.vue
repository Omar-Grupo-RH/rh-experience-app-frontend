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
  3: "Front Desk",
};

const userRol = (rol) => roles[rol] || "Sin rol";
</script>

<template>
  <div class="w-full">
    <!-- Empty state -->
    <div
      v-if="!usersList.length"
      class="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
    >
      <div
        class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-experience-blue/10 text-experience-blue"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16 21v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8.5 10v-1a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75"
          />
        </svg>
      </div>

      <h3 class="text-lg font-bold text-slate-900">
        No hay usuarios registrados
      </h3>
      <p class="mt-1 max-w-sm text-sm text-slate-500">
        Cuando agregues usuarios, aparecerán listados en esta sección.
      </p>
    </div>

    <!-- Users list -->
    <ul v-else class="space-y-3">
      <li
        v-for="user in usersList"
        :key="user.id"
        class="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-experience-blue/20 hover:shadow-md sm:p-5"
      >
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <!-- User info -->
          <div class="flex min-w-0 items-center gap-4">
            <div class="min-w-0">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <p class="truncate text-base font-bold text-slate-900">
                  {{ user.full_name }}
              
                </p>

                <span
                  class="inline-flex w-fit items-center rounded-full bg-experience-blue/10 px-3 py-1 text-xs font-bold text-experience-blue ring-1 ring-experience-blue/10"
                >
                  {{ userRol(user.admin) }}
                </span>
              </div>

              <p class="mt-1 truncate text-sm font-medium text-slate-500">
                @{{ user.username }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 sm:justify-end">
            <button
              class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-experience-blue transition-all duration-200 hover:border-experience-blue/30 hover:bg-experience-blue/10 focus:outline-none focus:ring-2 focus:ring-experience-blue/20"
              type="button"
              @click="handleEdit(user)"
            >
              Editar
            </button>

            <button
              class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 transition-all duration-200 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200"
              type="button"
              @click="handleDelete(user)"
            >
              Eliminar
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
