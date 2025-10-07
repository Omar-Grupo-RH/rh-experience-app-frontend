<script setup>
import Menu from "@/components/Navigation/Menu.vue";
import { useAuth } from "@/composables/useAuth";
const auth = useAuth();
const { user, isAuthenticated, logout } = auth;
</script>

<template>
  <main class="flex flex-col min-h-screen relative">
    <Menu />
    <section>
      <h1>Usuario: {{ user?.first_name }}</h1>
    </section>
  </main>
</template>
