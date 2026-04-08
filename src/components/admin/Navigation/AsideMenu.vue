<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const props = defineProps({
  mobile: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const route = useRoute();
const router = useRouter();
const { user, adminLevel, logout } = useAuth();

const roleLabel = computed(() => {
  switch (Number(adminLevel.value)) {
    case 1:
      return "Super administrador";
    case 2:
      return "Administrador";
    case 3:
      return "Cobranza";
    case 4:
      return "Usuario";
    default:
      return "Sin acceso";
  }
});

const menuItems = computed(() => {
  const level = Number(adminLevel.value);

  if (!user.value || level <= 0) return [];

  if (level === 1) {
    return [
      { to: { name: "calendar" }, label: "Agenda de viajes", icon: "calendar" },
      { to: { name: "travels" }, label: "Mis pasajeros", icon: "users" },
      { to: { name: "comments" }, label: "Comentarios", icon: "comments" },
      { to: { name: "users" }, label: "Usuarios", icon: "users" },
    ];
  }

  if (level === 2) {
    return [
      { to: { name: "calendar" }, label: "Agenda de viajes", icon: "calendar" },
      { to: { name: "travels" }, label: "Mis pasajeros", icon: "users" },
      { to: { name: "comments" }, label: "Comentarios", icon: "comments" },
    ];
  }

  if (level === 3) {
    return [{ to: { name: "cobranza" }, label: "Panel de cobranza", icon: "wallet" }];
  }

  if (level >= 4) {
    return [{ to: { name: "travels" }, label: "Panel de control", icon: "grid" }];
  }

  return [];
});

const isActive = (item) => {
  if (!item?.to?.name) return false;
  return route.name === item.to.name;
};

const handleNavigate = () => {
  if (props.mobile) emit("close");
};

const handleGoHome = () => {
  router.push({ name: "home" });
  if (props.mobile) emit("close");
};

const handleLogout = async () => {
  await logout();
  if (props.mobile) emit("close");
};

const iconPaths = {
  calendar:
    "M8 2v2M16 2v2M3.5 9.5h17M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  users:
    "M16 21v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8.5 10v-1a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75",
  comments:
    "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z",
  
};
</script>

<template>
  <aside
    class="fixed w-76 flex h-dvh flex-col  bg-experience-blue text-white"
  >
    <!-- Header -->
    <div class="border-b border-white/10 px-5 py-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-[11px] uppercase tracking-[0.28em] text-slate-300">
            Panel de control
          </p>
          <h2 class="mt-1 text-lg font-semibold text-white">RH Experience App</h2>
        </div>

        <button
          v-if="mobile"
          @click="$emit('close')"
          class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/10 lg:hidden"
          type="button"
          aria-label="Cerrar menú"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- User Card -->
    <div class="px-5 pt-5">
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold uppercase text-white"
          >
            {{ user?.username?.charAt(0) || "U" }}
          </div>

          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-white">
              {{ user?.username || "Usuario" }}
            </p>
            <p class="truncate text-xs text-slate-300">
              {{ roleLabel }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <div class="flex-1 px-4 py-6">
      

      <nav class="space-y-1">
        <RouterLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          @click="handleNavigate"
          class="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition"
          :class="
            isActive(item)
              ? 'bg-white text-black shadow-sm'
              : ' hover:bg-white/8 text-white'
          "
        >
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl border transition"
            :class="
              isActive(item)
                ? 'border-slate-200 bg-slate-100 text-black'
                : 'border-white/10 bg-white/5 text-slate-300 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white'
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4.5 w-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="iconPaths[item.icon]"
              />
            </svg>
          </span>

          <span class="truncate">{{ item.label }}</span>
        </RouterLink>
      </nav>
    </div>

    <!-- Footer actions -->
    <div class="border-t border-white/10 px-4 py-4">
      <div class="space-y-2">
        <button
          @click="handleGoHome"
          class="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-white transition hover:bg-white/8 hover:text-white cursor-pointer"
          type="button"
        >
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4.5 w-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 12l9-9 9 9M5 10v10h14V10"
              />
            </svg>
          </span>
          <span>Salir del panel</span>
        </button>

        <button
          @click="handleLogout"
          class="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-red-400 transition hover:bg-rose-500/10 cursor-pointer"
          type="button"
        >
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-500/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4.5 w-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
              />
            </svg>
          </span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  </aside>
</template>