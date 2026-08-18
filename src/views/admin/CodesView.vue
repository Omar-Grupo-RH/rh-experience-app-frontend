<script setup>
import { inject, onMounted } from "vue";
import Swal from "sweetalert2";
import { useCodeStore } from "@/stores/admin/codeStore";
import CodesTable from "@/components/admin/Codes/CodesTable.vue";
import CodeModal from "@/components/admin/Codes/CodeModal.vue";

const toast = inject("toast");
const store = useCodeStore();

onMounted(async () => {
  await store.getCodes();
});

const handleSubmit = async (formData) => {
  try {
    await store.saveCode(formData);

    toast?.open?.({
      message: store.isEditing
        ? "Código actualizado correctamente."
        : "Código creado correctamente.",
      type: "success",
    });

    store.closeModal();
  } catch (error) {
    toast?.open?.({
      message:
        error?.response?.data?.message ||
        "Ocurrió un error al guardar el código.",
      type: "error",
    });
  }
};

const confirmDelete = async (code) => {
  const result = await Swal.fire({
    title: "¿Eliminar código?",
    text: `Esta acción eliminará el código ${code.code}.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#e11d48",
    cancelButtonColor: "#64748b",
  });

  if (!result.isConfirmed) return;

  try {
    await store.removeCode(code.id);

    toast?.open?.({
      message: "Código eliminado correctamente.",
      type: "success",
    });
  } catch (error) {
    toast?.open?.({
      message:
        error?.response?.data?.message ||
        "Ocurrió un error al eliminar el código.",
      type: "error",
    });
  }
};

const handleFilterChange = async (event) => {
  await store.setTypeFilter(event.target.value);
};
</script>

<template>
  <div class="mx-auto space-y-8 lg:p-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-1">
        
        <h2 class="text-4xl font-semibold">
          Gestión de códigos
        </h2>

        <p class="text-sm text-gray-400 sm:text-base">
          Administra códigos para departamentos, alianzas y descuentos.
        </p>
      </div>

      <button
        type="button"
        class="bg-experience-blue text-white px-4 py-2 rounded cursor-pointer shadow"
        @click="store.openCreateModal"
      >
        + Nuevo código
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-semibold text-slate-500">
          Total de códigos
        </p>

        <p class="mt-2 text-3xl font-black text-slate-900">
          {{ store.totalCodes }}
        </p>
      </div>

      <div
        class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2"
      >
        <label class="text-sm font-bold text-slate-700">
          Filtrar por tipo
        </label>

        <div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            :value="store.filters.type"
            class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
            @change="handleFilterChange"
          >
            <option value="">Todos</option>

            <option
              v-for="type in store.codeTypes"
              :key="type.value"
              :value="type.value"
            >
              {{ type.label }}
            </option>
          </select>

         
        </div>
      </div>
    </div>

    <div >
      <div
        v-if="store.loading"
        class="flex min-h-[260px] items-center justify-center"
      >
        <div class="flex flex-col items-center gap-3 text-slate-500">
          <div
            class="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-experience-blue"
          />
          <p class="text-sm font-medium">Cargando códigos...</p>
        </div>
      </div>

      <CodesTable
        v-else
        :codes="store.codes"
        :get-type-label="store.getTypeLabel"
        @edit-code="store.openEditModal"
        @delete-code="confirmDelete"
      />
    </div>

    <CodeModal
      :show="store.showModal"
      :code="store.codeToEdit"
      :loading="store.saving"
      :code-types="store.codeTypes"
      @close="store.closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>