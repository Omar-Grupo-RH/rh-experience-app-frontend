// composables/useRegisterClient.js
import { ref, inject } from "vue";
import { reset } from "@formkit/vue";
import AuthAPI from "@/api/AuthAPI";

export function useRegisterClient() {
  const toast = inject("toast"); 
  const isLoading = ref(false);
  const errors = ref([]);

  async function registerClient(formData, formId = "registerForm") {
    isLoading.value = true;
    errors.value = [];

    try {
      // Llamada al backend
      const { data } = await AuthAPI.register(formData);

      // Feedback
      toast?.open({
        message: data.message || "Cliente registrado correctamente",
        type: "success",
      });

      // Reset del formulario FormKit
      reset(formId);

      return data.data; // Devuelve el usuario creado
    } catch (error) {
      const { response } = error;
      errors.value = response?.data?.errors || ["Error desconocido"];

      errors.value.forEach((msg) => {
        toast?.open({ message: msg, type: "error" });
      });

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
