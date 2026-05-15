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
      {
        label: "Dashboard",
        to: { name: "dashboard" },
        icon: "grid",
      },
      { to: { name: "calendar" }, label: "Agenda de viajes", icon: "calendar" },
      { to: { name: "travels" }, label: "Mis pasajeros", icon: "users" },
      { to: { name: "codes" }, label: "Códigos", icon: "codes" },
      {
        label: "Encuestas",
        to: { name: "survey-responses" },
        icon: "survey",
      },
      { to: { name: "comments" }, label: "Comentarios", icon: "comments" },
      { to: { name: "users" }, label: "Usuarios", icon: "users" },
    ];
  }

  if (level === 2) {
    return [
      {
        label: "Dashboard",
        to: { name: "dashboard" },
        icon: "grid",
      },
      { to: { name: "calendar" }, label: "Agenda de viajes", icon: "calendar" },
      { to: { name: "travels" }, label: "Mis pasajeros", icon: "users" },
      { to: { name: "codes" }, label: "Códigos", icon: "codes" },
      {
        label: "Encuestas",
        to: { name: "survey-responses" },
        icon: "survey",
      },
      { to: { name: "comments" }, label: "Comentarios", icon: "comments" },
    ];
  }

  if (level === 3) {
    return [
      { to: { name: "cobranza" }, label: "Panel de cobranza", icon: "wallet" },
    ];
  }

  if (level >= 4) {
    return [
      { to: { name: "travels" }, label: "Panel de control", icon: "grid" },
    ];
  }

  return [];
});

const isActive = (item) => {
  if (!item?.to?.name) return false;

  return route.name === item.to.name || route.meta?.activeMenu === item.to.name;
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
  codes:
    "M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z",
  comments: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z",
  survey:
    "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z",
  wallet:
    "M20 7H5a2 2 0 0 1 0-4h13v4M3 7h17a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 7h.01",
  grid: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
};
</script>

<template>
  <aside
    class="flex h-dvh flex-col bg-experience-blue text-white shadow-[16px_0_40px_rgba(15,23,42,0.18)]"
    :class="
      mobile ? 'w-full' : 'hidden w-76 shrink-0 lg:sticky lg:top-0 lg:flex'
    "
  >
    <!-- Header -->
    <div class="border-b border-white/10 px-5 py-5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[11px] uppercase tracking-[0.28em] text-white/50">
            Panel de control
          </p>
          <h2 class="mt-1 truncate text-lg font-semibold text-white">
            RH Experience App
          </h2>
        </div>

        <button
          v-if="mobile"
          @click="$emit('close')"
          class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
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
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 6l12 12M18 6L6 18"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- User Card -->
    <div class="px-5 pt-5">
      <div
        class="rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-sm"
      >
        <div class="flex items-center gap-3">
          <div class="min-w-0">
            <p class="truncate font-semibold text-white">
              {{ user?.username || "Usuario" }}
            </p>
            <p class="mt-0.5 truncate text-xs text-white/55">
              {{ roleLabel }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <div class="flex-1 overflow-y-auto px-4 py-6">
      <nav class="space-y-1.5">
        <RouterLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          @click="handleNavigate"
          class="group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-all duration-200"
          :class="
            isActive(item)
              ? 'bg-white text-experience-blue shadow-sm'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          "
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200"
            :class="
              isActive(item)
                ? 'border-white bg-experience-blue/80 text-white'
                : 'border-white/10 bg-white/5 text-white group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white'
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
          class="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
          type="button"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70"
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
          class="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-red-300 transition-all duration-200 hover:bg-rose-500/10 hover:text-red-200"
          type="button"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-500/10 text-red-300"
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
