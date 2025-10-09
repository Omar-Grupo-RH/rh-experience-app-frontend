<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  client: Object,
});
const emit = defineEmits(["close", "update"]);

const form = ref({
  name: "",
  email: "",
  phone: "",
});

watch(
  () => props.client,
  (val) => {
    if (val) {
      form.value = { ...val };
    }
  },
  { immediate: true }
);

function handleSubmit() {
  emit("update", form.value);
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow p-6 w-full max-w-lg">
      <h2 class="text-xl font-bold mb-4">Editar cliente</h2>

      <FormKit
        type="form"
        submit-label="Guardar cambios"
        id="editForm"
        :actions="false"
        @submit="handleSubmit"
      >
        <FormKit
          type="text"
          label="Nombre"
          v-model="form.name"
          validation="required"
        />
        <FormKit
          type="email"
          label="Correo electrónico"
          v-model="form.email"
          validation="required|email"
        />
        <FormKit
          type="tel"
          label="Teléfono"
          v-model="form.phone"
          validation="required|matches:/^[0-9]{10}$/"
        />

        <div class="flex justify-between gap-3 mt-4">
          <button
            type="button"
            class="bg-gray-200 px-2 py-1.5 h-fit rounded-lg cursor-pointer mt-2 disabled:opacity-50"
            @click="$emit('close')"
          >
            Cancelar
          </button>
          <FormKit type="submit">Guardar</FormKit>
        </div>
      </FormKit>
    </div>
  </div>
</template>
