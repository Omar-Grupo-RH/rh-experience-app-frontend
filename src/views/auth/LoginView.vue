<script setup>
import { RouterLink, useRoute, useRouter } from "vue-router";
import { inject } from "vue";
import { reset } from "@formkit/vue";
import AuthAPI from "@/api/AuthAPI";
import { useAuth } from "@/composables/useAuth";

const toast = inject("toast");
const { login } = useAuth();

const route = useRoute();
const router = useRouter();

const handleSubmit = async (formData) => {
  try {
    const {
      data: { token, username, admin },
    } = await AuthAPI.login(formData);

    reset("loginForm");

    toast?.open?.({
      message: `¡Bienvenido ${username}!`,
      type: "success",
    });

    await login(token, {
      username,
      admin,
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

      <div
        class="p-5 md:p-10 w-[95%] max-w-xl rounded-2xl shadow mt-0 lg:mt-20 md:w-[80%] bg-white relative"
      >
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
            type="text"
            label="Usuario"
            name="username"
            placeholder="Ingresa tu usuario"
            validation="required"
            :validation-messages="{
              required: 'El usuario es obligatorio',
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

          <div>
            <FormKit type="submit">Iniciar sesión</FormKit>
          </div>
        </FormKit>

        <RouterLink
          :to="{ name: 'home' }"
          class="block text-sm text-gray-500 mt-10"
        >
          Regresar a la página principal
        </RouterLink>
      </div>
    </div>
  </div>
</template>