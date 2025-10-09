<script setup>
import { ref } from "vue";
import { useRegisterClient } from "@/composables/useRegisterClient";
import { useClientStore } from "@/stores/clientStore";
const store = useClientStore();
const emit = defineEmits(["close", "create"]);
const { registerClient, isLoading } = useRegisterClient();

const form = ref({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
});

async function handleSubmit() {
  try {
    const newClient = await registerClient(form.value, "registerForm");

    store.clients.push(newClient); // Actualiza el store solo con el resultado real
    store.showCreateModal = false; // Cierra el modal
  } catch (error) {
    console.error("Error al crear cliente:", error);
  }
}
</script>

<template>
  <div
    class="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
  >
    <div class="bg-white rounded-lg shadow p-6 w-full max-w-lg">
      <h2 class="text-xl font-bold mb-4">Crear nuevo cliente</h2>

      <FormKit
        type="form"
        submit-label="Crear cuenta"
        id="registerForm"
        :actions="false"
        incomplete-message="No se pudo enviar, revisa las notificaciones"
        @submit="handleSubmit"
      >
        <FormKit
          type="text"
          label="Nombre(s)"
          name="first_name"
          v-model="form.first_name"
          placeholder="John"
          validation="required|length:3"
          :validation-messages="{
            required: 'El nombre es obligatorio',
          }"
        />
        <FormKit
          type="text"
          label="Apellido(s)"
          name="last_name"
          v-model="form.last_name"
          placeholder="Doe"
          validation="required|length:3"
          :validation-messages="{
            required: 'El apellido es obligatorio',
          }"
        />
        <FormKit
          type="email"
          label="Correo electrónico"
          name="email"
          v-model="form.email"
          placeholder="Ingresa tu correo electronico"
          validation="required|email"
          :validation-messages="{
            required: 'El correo electronico es obligatorio',
            email: 'Email no valido',
          }"
        />
        <FormKit
          type="tel"
          label="Teléfono"
          name="phone"
          v-model="form.phone"
          placeholder="Ingresa tu numero telefonico"
          validation="required|matches:/^[0-9]{10}$/"
          :validation-messages="{
            required: 'El numero telefonico es obligatorio',
            matches: 'El numero telefonico debe tener 10 digitos solamente.',
          }"
        />
        <FormKit
          type="password"
          label="Contraseña"
          name="password"
          v-model="form.password"
          placeholder="Ingresa tu contraseña - Min 8 caracteres"
          validation="required|length:8"
          :validation-messages="{
            required: 'La contraseña es obligatoria',
            length: 'La contraseña debe contener al menos 8 caracteres',
          }"
        />

        <div class="flex justify-between gap-3 mt-4">
          <button
            type="button"
            class="bg-gray-200 px-2 py-1.5 h-fit rounded-lg cursor-pointer mt-2 disabled:opacity-50"
            @click="$emit('close')"
          >
            Cancelar
          </button>
          <FormKit type="submit">Guardar Cliente</FormKit>
        </div>
      </FormKit>
    </div>
  </div>
</template>
