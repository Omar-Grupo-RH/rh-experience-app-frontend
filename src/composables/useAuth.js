import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useReservaStore } from "@/stores/reservaStore";

const STORAGE_KEY = "AUTH_TOKEN";
const STORAGE_USER = "AUTH_USER";

const token = ref(localStorage.getItem(STORAGE_KEY) || null);
const user = ref(JSON.parse(localStorage.getItem(STORAGE_USER) || "null"));

function decodeJwtPayload(jwt) {
  try {
    const [, payload] = jwt.split(".");
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function hydrateFromToken() {
  if (!token.value) {
    user.value = null;
    localStorage.removeItem(STORAGE_USER);
    return;
  }

  const payload = decodeJwtPayload(token.value);
  if (!payload) {
    token.value = null;
    localStorage.removeItem(STORAGE_KEY);
    user.value = null;
    localStorage.removeItem(STORAGE_USER);
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    token.value = null;
    localStorage.removeItem(STORAGE_KEY);
    user.value = null;
    localStorage.removeItem(STORAGE_USER);
    return;
  }

  const base = user.value || {};

  user.value = {
    id: payload.sub || payload.id || base.id || null,
    first_name: payload.first_name || base.first_name,
    last_name: payload.last_name || base.last_name,
    email: payload.email || base.email,
    phone: payload.phone || base.phone,
    raw: payload,
  };

  localStorage.setItem(STORAGE_USER, JSON.stringify(user.value));
}
hydrateFromToken();

export function useAuth() {
  const router = useRouter();
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const storeReserva = useReservaStore();

  async function login(jwt, profile) {
    token.value = jwt;
    localStorage.setItem(STORAGE_KEY, jwt);

    hydrateFromToken();

    if (profile) {
      user.value = {
        ...user.value,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        id: profile.id ?? user.value?.id ?? null,
      };
      localStorage.setItem(STORAGE_USER, JSON.stringify(user.value));
    }

    storeReserva.form.first_name = user.value.first_name;
    storeReserva.form.last_name = user.value.last_name;
    storeReserva.form.email = user.value.email;
    storeReserva.form.phone = user.value.phone;

    const url = new URL(window.location.href);
    const next = url.searchParams.get("next");
    router.push(next || { name: "home" });
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_USER);

    // Recarga directamente la página principal
    window.location.href = "/";
  }


  return { token, user, isAuthenticated, login, logout, hydrateFromToken };
}
