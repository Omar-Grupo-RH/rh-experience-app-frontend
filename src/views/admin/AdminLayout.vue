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
  <div class="min-h-dvh bg-slate-100">
    <!-- Topbar -->
    <header
      class="sticky top-0 z-30 flex items-center justify-end border-b border-slate-200 bg-experience-blue px-4 py-3 backdrop-blur"
    >
      <button
        @click="openSidebar"
        class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
        type="button"
        aria-label="Abrir menú"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
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

    <!-- Overlay -->
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
        class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px]"
        @click="closeSidebar"
      />
    </Transition>

    <!-- Sidebar -->
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
        class="fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] sm:max-w-[340px]"
      >
        <AsideMenu mobile @close="closeSidebar" />
      </div>
    </Transition>

    <!-- Content -->
    <main class="min-w-0">
      <div class="p-4 sm:p-6 lg:p-8">
        <div
          class="rounded-3xl bg-white p-4  ring-1 ring-slate-200 sm:p-6 lg:p-8"
        >
          <RouterView />
        </div>
      </div>
    </main>
  </div>
</template>