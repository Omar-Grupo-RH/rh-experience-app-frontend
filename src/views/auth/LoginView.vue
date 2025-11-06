<script setup>
import { RouterLink, useRoute } from "vue-router";
import { inject } from "vue";
import { reset } from "@formkit/vue";
import AuthAPI from "@/api/AuthAPI";
import { useAuth } from "@/composables/useAuth";

const toast = inject("toast");
const { login } = useAuth(); // <- usamos el composable

const handleSubmit = async (formData) => {
  try {
    const {
      data: { token, first_name, last_name, admin },
    } = await AuthAPI.login(formData);
    await login(token, {
      first_name,
      last_name,
      admin,
    });

    reset("loginForm");
    toast?.open?.({
      message: `¡Bienvenido! ${first_name} ${last_name}`,
      type: "success",
    });
  } catch (error) {
    toast?.open?.({
      message: error?.response?.data?.message || "Error al iniciar sesión",
      type: "error",
    });
  }
};
</script>

<template>
  <div class="h-dvh">
    
    <div
      class="h-full flex justify-center items-center lg:items-start bg-experience-pink relative"
    >
      <div
        class="w-full h-full absolute inset-0 overflow-hidden pointer-events-none"
      >
        <img
          src="/images/textura2.svg"
          alt="Textura de experience"
          class="w-full h-full object-cover opacity-50 pointer-events-none"
        />
      </div>

      <div class="p-5 md:p-10 w-[95%] max-w-xl rounded-2xl shadow  mt-0 lg:mt-20 md:w-[80%] bg-white relative">
        <h2
          class="text-xl md:text-2xl mb-5 uppercase xl:text-3xl font-semibold text-center"
        >
          Inicio de sesión
        </h2>
        <FormKit
          id="loginForm"
          type="form"
          submit-label="Iniciar sesion"
          incomplete-message="No se pudo enviar, revisa los mensajes"
          @submit="handleSubmit"
          :actions="false"
        >
          <FormKit
            type="email"
            label="Correo electrónico"
            name="email"
            placeholder="Ingresa tu correo electronico"
            validation="required"
            :validation-messages="{
              required: 'El correo electrónico es obligatorio',
            }"
          />
          <FormKit
            type="password"
            label="Contraseña"
            name="password"
            placeholder="Ingresa tu contraseña"
            validation="required"
            :validation-messages="{
              required: 'La contraseña es obligatoria',
            }"
          />

          <FormKit type="submit">Iniciar sesión</FormKit>
        </FormKit>
      </div>
    </div>
  </div>
</template>
