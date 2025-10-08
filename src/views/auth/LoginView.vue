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
      data: { token, first_name, email, last_name, phone, admin },
    } = await AuthAPI.login(formData);
    await login(token, { first_name, email, last_name, phone, admin });


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
  <div class="h-dvh grid md:grid-cols-2">
    <div class="hidden md:block md:h-full w-full overflow-hidden relative">
      <img
        src="/images/login-image.webp"
        class="w-full h-full object-cover"
        alt="Moises lanzodose desde la tiroleza"
      />
      <img
        src="/logos/Recurso8.svg"
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        alt=""
      />
    </div>

    <div
      class="md:h-full flex justify-center items-center bg-experience-pink relative"
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

      <div class="p-5 md:p-10 rounded-2xl shadow md:w-[80%] bg-white relative">
        <h2
          class="text-xl md:text-2xl mb-5 uppercase xl:text-3xl font-semibold text-center"
        >
          Inicio de sesion
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
            label="Correo electronico"
            name="email"
            placeholder="Ingresa tu correo electronico"
            validation="required"
            :validation-messages="{
              required: 'El correo electronico es obligatorio',
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

          <FormKit type="submit">Iniciar Sesion</FormKit>
        </FormKit>
        <div>
          <p>
            Aun no tienes una cuenta? Registrate
            <RouterLink
              :to="{ name: 'register' }"
              class="underline text-experience-blue"
              >aquí.</RouterLink
            >
          </p>
          <p>
            No necesitas cuenta para disfrutar la experiencia, compra tus
            boletos
            <RouterLink
              :to="{ name: 'home' }"
              class="underline text-experience-blue"
              >aquí.</RouterLink
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
