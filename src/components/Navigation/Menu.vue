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

  if (adminLevel.value === 1 || adminLevel.value === 2) return "calendar";
  if (adminLevel.value === 3) return "cobranza";

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
  <nav
    class="sticky top-0 z-50 w-full border-b border-white/10 bg-experience-blue/95 text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl"
  >
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Contenedor principal del menú -->
      <div class="flex min-h-[72px] items-center justify-between">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <a
            href="https://rhexperience.mx/"
            class="group flex items-center p-1 transition duration-300"
            aria-label="Ir al inicio"
          >
            <img
              src="/logos/Recurso9.svg"
              class="h-11 w-11 transition duration-300 group-hover:scale-105 lg:h-14 lg:w-14"
              alt="Logo"
            />
          </a>
        </div>

        <!-- Menú desktop -->
        <div class="hidden md:flex items-center gap-3">
          <div v-if="!isAuthenticated">
            <Link
              to="login"
              class="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition-all duration-300 hover:border-white/40 hover:bg-white hover:text-experience-blue focus:outline-none focus:ring-2 focus:ring-white/60 lg:text-sm"
            >
              Iniciar Sesión
            </Link>
          </div>

          <template v-else-if="isAuthenticated">
            <div v-if="dashboardRouteName">
              <Link
                :to="dashboardRouteName"
                class="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white/90 transition-all duration-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 lg:text-sm"
              >
                Dashboard
              </Link>
            </div>

            <button
              @click="logout"
              class="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition-all duration-300 hover:border-white/40 hover:bg-white hover:text-experience-blue focus:outline-none focus:ring-2 focus:ring-white/60 lg:text-sm cursor-pointer"
            >
              Cerrar sesión
            </button>
          </template>
        </div>

        <!-- Botón menú móvil -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-sm transition-all duration-300 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60 active:scale-95"
            aria-label="Menú principal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 transition-transform duration-300"
              :class="mobileMenuOpen ? 'rotate-90' : 'rotate-0'"
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
      <Transition name="mobile-menu">
        <div v-if="mobileMenuOpen" class="md:hidden overflow-hidden pb-4">
          <div
            class="rounded-3xl border border-white/10 bg-white/[0.08] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl"
          >
            <div v-if="!isAuthenticated">
              <Link
                to="login"
                @click="closeMobileMenu"
                class="block rounded-2xl px-4 py-3.5 text-left text-base font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-white hover:text-experience-blue active:scale-[0.99]"
              >
                Iniciar sesión
              </Link>
            </div>

            <template v-else-if="isAuthenticated">
              <div v-if="dashboardRouteName">
                <Link
                  :to="dashboardRouteName"
                  @click="closeMobileMenu"
                  class="block rounded-2xl px-4 py-3.5 text-left text-base font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-white/15 active:scale-[0.99]"
                >
                  Dashboard
                </Link>
              </div>

              <button
                @click="handleLogout"
                class="mt-1 flex w-full cursor-pointer items-center rounded-2xl px-4 py-3.5 text-left text-base font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-pink-600 active:scale-[0.99]"
              >
                Cerrar sesión
              </button>
            </template>
          </div>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease,
    max-height 0.3s ease;
  max-height: 240px;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}
</style>
