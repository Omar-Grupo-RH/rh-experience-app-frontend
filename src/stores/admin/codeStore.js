// src/stores/admin/codeStore.js
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useCodes } from "@/composables/useCodes";

export const useCodeStore = defineStore("codes", () => {
  const { listCodes, showCode, storeCode, modifyCode, destroyCode } =
    useCodes();

  const codes = ref([]);
  const selectedCode = ref(null);

  const loading = ref(false);
  const saving = ref(false);

  const showModal = ref(false);
  const codeToEdit = ref(null);

  const filters = ref({
    type: "",
  });

  const codeTypes = [
    {
      label: "Departamento",
      value: "department",
    },
    {
      label: "Alianza",
      value: "alliance",
    },
    {
      label: "Premio",
      value: "discount",
    },
  ];

  const hasCodes = computed(() => codes.value.length > 0);

  const selectedTypeLabel = computed(() => {
    if (!filters.value.type) return "Todos los códigos";

    return getTypeLabel(filters.value.type);
  });

  const isEditing = computed(() => Boolean(codeToEdit.value?.id));

  const totalCodes = computed(() => codes.value.length);

  function getTypeLabel(type) {
    const item = codeTypes.find((codeType) => codeType.value === type);
    return item?.label || "Sin tipo";
  }

  function cleanParams(params = {}) {
    const clean = { ...params };

    Object.keys(clean).forEach((key) => {
      if (
        clean[key] === "" ||
        clean[key] === null ||
        clean[key] === undefined
      ) {
        delete clean[key];
      }
    });

    return clean;
  }

  async function getCodes(params = {}) {
    try {
      loading.value = true;

      const finalParams = cleanParams({
        ...filters.value,
        ...params,
      });

      codes.value = await listCodes(finalParams);
    } catch (error) {
      console.error("Error al obtener códigos:", error);
      codes.value = [];
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function getCodeById(id) {
    if (!id) return null;

    try {
      loading.value = true;

      selectedCode.value = await showCode(id);

      return selectedCode.value;
    } catch (error) {
      console.error("Error al obtener código:", error);
      selectedCode.value = null;
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function openCreateModal() {
    codeToEdit.value = null;
    showModal.value = true;
  }

  function openEditModal(code) {
    codeToEdit.value = { ...code };
    showModal.value = true;
  }

  function closeModal() {
    showModal.value = false;
    codeToEdit.value = null;
  }

  function normalizePayload(payload) {
    return {
      ...payload,
      id: payload.id ?? null,
      type: payload.type ?? "",
      name: payload.name?.trim() ?? "",
      code: payload.code?.toUpperCase()?.trim() ?? "",
    };
  }

  async function createCode(payload) {
    try {
      saving.value = true;

      const response = await storeCode(normalizePayload(payload));

      await getCodes();

      return response;
    } catch (error) {
      console.error("Error al crear código:", error);
      throw error;
    } finally {
      saving.value = false;
    }
  }

  async function updateCode(payload) {
    try {
      saving.value = true;

      const response = await modifyCode(normalizePayload(payload));
      await getCodes();
      return response;
    } catch (error) {
      console.error("Error al actualizar código:", error);
      throw error;
    } finally {
      saving.value = false;
    }
  }

  async function saveCode(payload) {
    const normalizedPayload = normalizePayload(payload);

    if (normalizedPayload.id) {
      return await updateCode(normalizedPayload);
    }

    return await createCode(normalizedPayload);
  }

  async function removeCode(id) {
    if (!id) return;

    try {
      loading.value = true;

      const response = await destroyCode(id);

      codes.value = codes.value.filter(
        (code) => Number(code.id) !== Number(id),
      );

      return response;
    } catch (error) {
      console.error("Error al eliminar código:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function setTypeFilter(type) {
    filters.value.type = type;
    await getCodes();
  }

  function clearFilters() {
    filters.value.type = "";
  }

  return {
    codes,
    selectedCode,
    loading,
    saving,

    showModal,
    codeToEdit,

    filters,
    codeTypes,

    hasCodes,
    selectedTypeLabel,
    isEditing,
    totalCodes,

    getTypeLabel,
    getCodes,
    getCodeById,

    openCreateModal,
    openEditModal,
    closeModal,

    createCode,
    updateCode,
    saveCode,
    removeCode,

    setTypeFilter,
    clearFilters,
  };
});
