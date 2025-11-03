<script setup>
import { useAuth } from "@/composables/useAuth";
import Link from "./Link.vue";

const auth = useAuth();
const { user, isAuthenticated, logout } = auth;
</script>

<template>
  <nav
    class="w-full bg-experience-pink text-white flex justify-between items-center h-16"
  >
    <div class="ml-16">
      <Link to="home">
        <img src="/logos/Recurso9.svg" class="w-9" alt="" />
      </Link>
    </div>

    <ul class="flex flex-col md:flex-row ">
      
      <li
        v-if="!isAuthenticated"
        class="cursor-pointer h-16 px-5 flex justify-center items-center bg-experience-blue"
      >
        <Link to="login">Iniciar sesión</Link>
      </li>

      <template v-else-if="isAuthenticated">
        <li
          v-if="isAuthenticated && user?.admin"
          class="cursor-pointer  h-16 px-5 flex justify-center items-center hover:bg-experience-blue transition-colors ease-in-out duration-300"
        >
          <Link to="dashboard">Dashboard</Link>
        </li>

        <li
          @click="logout"
          class="cursor-pointer text-lg  h-16 px-5 flex justify-center items-center hover:bg-experience-blue transition-colors ease-in-out duration-300"
        >
          Cerrar sesión
        </li>
      </template>
    </ul>
  </nav>
</template>
