<script setup>
import { useAuth } from "@/composables/useAuth";
import Link from "./Link.vue";
import { ref, computed } from "vue";

const auth = useAuth();
const { user, isAuthenticated, logout, adminLevel } = auth;

// Estado para controlar el menú móvil
const mobileMenuOpen = ref(false);

const dashboardRouteName = computed(() => {
  if (!user.value || adminLevel.value <= 0) return null;

  if (adminLevel.value === 1) return "earnings";
  if (adminLevel.value === 2) return "cobranza";

  // futuros roles
  if (adminLevel.value >= 3) return "home";

  return null;
});

// Función para cerrar sesión
const handleLogout = () => {
  logout();
  mobileMenuOpen.value = false;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};
</script>

<template>
  <nav class="w-full bg-experience-blue text-white shadow-lg">
    <div class="container mx-auto px-4">
      <!-- Contenedor principal del menú -->
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <a href="/" class="flex items-center flex-col gap-2">
            <img
              src="/logos/Recurso9.svg"
              class="w-9 h-9 lg:size-16"
              alt="Logo"
            />
          </a>
        </div>

        <!-- Menú desktop -->
        <div class="hidden md:flex items-center space-x-1">
          <div v-if="!isAuthenticated" class="ml-4">
            <Link
              to="login"
              class="text-sm lg:text-base hover:underline uppercase transition-colors duration-200 px-4 py-2 rounded-md font-medium"
            >
              Iniciar Sesión
            </Link>
          </div>

          <template v-else-if="isAuthenticated">
            <div
              v-if="dashboardRouteName"
              class="hover:bg-pink-700 transition-colors duration-200 rounded-md"
            >
              <Link
                :to="dashboardRouteName"
                class="block px-4 py-2  uppercase"
              >
                Dashboard
              </Link>
            </div>

            <button
              @click="logout"
              class="hover:bg-pink-700 transition-colors duration-200 px-4 py-2 rounded-md text-lg tracking-widest text-center flex items-center cursor-pointer uppercase"
            >
             
              Cerrar sesión
            </button>
          </template>
        </div>

        <!-- Botón menú móvil -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="text-white hover:bg-pink-700 focus:outline-none focus:ring-2 cursor-pointer focus:ring-white p-2 rounded-md transition-colors duration-200"
            aria-label="Menú principal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                v-if="!mobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Menú móvil -->
      <div v-if="mobileMenuOpen" class="md:hidden py-2">
        <div v-if="!isAuthenticated" class="px-4 py-2">
          <Link
            to="login"
            @click="closeMobileMenu"
            class="block text-left px-4 py-3 font-bold text-lg uppercase cursor-pointer hover:bg-pink-600 "
          >
            Iniciar sesión
          </Link>
        </div>

        <template v-else-if="isAuthenticated">
          <div
            v-if="dashboardRouteName"
            class="hover:bg-pink-600 transition-colors duration-200"
          >
            <Link
              :to="dashboardRouteName"
              @click="closeMobileMenu"
              class="block text-left px-4 py-3 font-bold text-lg uppercase cursor-pointer"
            >
              Dashboard
            </Link>
          </div>

          <button
            @click="handleLogout"
            class="w-full text-left hover:bg-pink-600 transition-colors duration-200 px-4 py-3 font-bold text-lg uppercase flex items-center cursor-pointer"
          >
            Cerrar sesión
          </button>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Transición suave para el menú móvil */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
