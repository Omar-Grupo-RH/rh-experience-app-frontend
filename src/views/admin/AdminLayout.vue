<script setup>
import { ref } from "vue";
import AsideMenu from "@/components/admin/Navigation/AsideMenu.vue";
import { RouterView } from "vue-router";

const isSidebarOpen = ref(false);

const openSidebar = () => {
  isSidebarOpen.value = true;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};
</script>

<template>
  <div class="min-h-dvh  lg:flex">
    <!-- Sidebar desktop fijo -->
    <AsideMenu />

    <!-- Contenedor principal -->
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Topbar mobile/tablet -->
      <header
        class="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-experience-blue px-4 py-3 shadow-lg backdrop-blur lg:hidden"
      >
        <div class="flex items-center gap-3">
          <img
            src="/logos/Recurso9.svg"
            alt="RH Experience"
            class="h-10 w-10"
          />

          <div>
            <p class="text-[10px] font-medium uppercase tracking-[0.22em] text-white/60">
              Panel
            </p>
            <p class="text-sm font-semibold text-white">
              RH Experience
            </p>
          </div>
        </div>

        <button
          @click="openSidebar"
          class="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60 active:scale-95"
          type="button"
          aria-label="Abrir menú"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5.5 w-5.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      <!-- Overlay mobile/tablet -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isSidebarOpen"
          class="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[3px] lg:hidden"
          @click="closeSidebar"
        />
      </Transition>

      <!-- Sidebar mobile/tablet -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <div
          v-if="isSidebarOpen"
          class="fixed inset-y-0 left-0 z-50 w-[86%] max-w-[340px] lg:hidden"
        >
          <AsideMenu mobile @close="closeSidebar" />
        </div>
      </Transition>

      <!-- Content -->
      <main class="min-w-0 flex-1 bg-white">
        <div>
          <div
            class="min-h-[calc(100dvh-2rem)] p-4 sm:p-6 lg:min-h-[calc(100dvh-4rem)] lg:p-0"
          >
            <RouterView />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>