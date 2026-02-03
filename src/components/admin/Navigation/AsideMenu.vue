<script setup>
import { computed, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import Link from "./Link.vue";

const { user, adminLevel, logout } = useAuth();

const menuItems = computed(() => {
  const level = adminLevel.value;

  if (!user.value || level <= 0) return [];


  if (level === 1 && user.value.username === "omar_solis") {
    return [
      { to: "earnings", label: "Panel de control" },
      { to: "calendar", label: "Agenda de viajes" },
      { to: "travels", label: "Mis pasajeros" },
      { to: "coupons", label: "Cupones" },
      { to: "comments", label: "Comentarios" },
      { to: "users", label: "Usuarios" },
    ];
  }

  if (level === 1) {
    return [
      { to: "earnings", label: "Panel de control" },
      { to: "calendar", label: "Agenda de viajes" },
      { to: "travels", label: "Mis pasajeros" },
      { to: "coupons", label: "Cupones" },
      { to: "comments", label: "Comentarios" },
    ];
  }

  //  Admin 2 – panel de cobranza
  if (level === 2) {
    return [{ to: "cobranza", label: "Panel de control" }];
  }

  // Futuro: admin 3+ (ejemplo)
  if (level >= 3) {
    return [
      { to: "earnings", label: "Dashboard" },
      // agrega más según tu rol 3
    ];
  }

  return [];
});

// A dónde manda "Salir del dashboard"
const exitRouteName = computed(() => {
  const level = adminLevel.value;

  if (level === 1) return "home"; // o "earnings" si quieres volver al panel
  if (level === 2) return "home"; // o "cobranza-root" si quieres
  if (level >= 3) return "home";

  return "home";
});
</script>

<template>
  <aside class="lg:h-dvh sticky top-0 bg-experience-blue">
    <nav class="lg:h-full flex flex-col justify-between px-3 py-10">
      <div class="space-y-2">
        <!-- Menú según el nivel -->
        <template v-if="user && adminLevel > 0">
          <div class="mb-5 py-2 px-4">
            <h1 class="text-xl lg:text-xl text-white">
              Hola:
              <span class="font-black">{{ user.username }}</span>
            </h1>
          </div>
          <Link v-for="item in menuItems" :key="item.to" :to="item.to">
            {{ item.label }}
          </Link>
        </template>
      </div>
      <div class="space-y-2 mt-10 lg:mt-0">
        <!-- Link para salir del dashboard (visible para cualquier admin) -->
        <Link v-if="user && adminLevel > 0" :to="exitRouteName">
          Salir del panel de control
        </Link>

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
