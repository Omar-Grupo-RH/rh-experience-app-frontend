import { ref, inject } from "vue";
import { reset } from "@formkit/vue";
import AdminAPI from "@/api/AdminAPI";

export function useRegisterClient() {
  const toast = inject("toast");
  const isLoading = ref(false);
  const errors = ref([]);

  async function registerClient(formData, formId = "registerForm") {
    isLoading.value = true;
    errors.value = [];

    try {
      // Llamada al backend (a través de ClientsAPI)
      const { data } = await AdminAPI.addClient(formData);

      toast?.open({
        message: data.message || "Cliente registrado correctamente",
        type: "success",
      });

      reset(formId);

      return data.data;
    } catch (error) {
      const { response } = error;
      errors.value = response?.data?.errors || ["Error desconocido"];
      errors.value.forEach((msg) =>
        toast?.open({ message: msg, type: "error" })
      );
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    registerClient,
    isLoading,
    errors,
  };
}
