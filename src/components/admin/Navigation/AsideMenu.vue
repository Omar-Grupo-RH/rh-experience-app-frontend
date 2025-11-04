<script setup>
import { useAuth } from "@/composables/useAuth";
import Link from "./Link.vue";

const auth = useAuth();
const { user, isAuthenticated, logout } = auth;
</script>

<template>
  <aside class="lg:h-dvh sticky top-0 bg-experience-blue">
    <nav class="lg:h-full flex flex-col justify-between px-3 py-10">
      <div class="space-y-2">
        <Link to="dashboard">Dashboard</Link>
        <Link to="earnings">Ingresos</Link>
        <Link to="calendar">Agenda de viajes</Link>
        <Link to="travels">Mis Viajes</Link>
        <Link to="coupons">Cupones</Link>
        <Link to="comments">Comentarios</Link>
      </div>
      <div class="space-y-2">
        <Link to="home">Salir del dashboard</Link>
        <button
          @click="logout"
          class="block w-full py-2 px-4 text-left rounded cursor-pointer lg:text-xl text-white hover:bg-experience-white/20"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  </aside>
</template>
