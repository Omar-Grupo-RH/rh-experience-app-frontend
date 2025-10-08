<script setup>
import { useAuth } from "@/composables/useAuth";
import Link from "./Link.vue";

const auth = useAuth();
const { user, isAuthenticated, logout } = auth;
</script>

<template>
  <aside class="h-dvh sticky top-0 bg-experience-pink p-5">
    <nav class="h-full flex flex-col justify-between gap-5">
      <div>
        <Link to="dashboard">Dashboard</Link>
        <Link to="dashboard">Clientes</Link>
        <Link to="dashboard">Tours</Link>
        <Link to="coupons">Cupones</Link>
      </div>

      <div>
        <Link to="home">Regresar</Link>
      </div>
    </nav>
  </aside>
</template>
