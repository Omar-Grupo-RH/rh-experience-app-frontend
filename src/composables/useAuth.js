// useAuth.js
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const STORAGE_KEY = "AUTH_TOKEN";
const STORAGE_USER = "AUTH_USER";

const token = ref(localStorage.getItem(STORAGE_KEY) || null);
const user = ref(JSON.parse(localStorage.getItem(STORAGE_USER) || "null"));

function decodeJwtPayload(jwt) {
  try {
    const [, payload] = jwt.split(".");
    let b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const json = atob(b64);
    const bytes = Uint8Array.from(json, (c) => c.charCodeAt(0));
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text);
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

  // Si el JWT trae datos, úsalos; si no, conserva los del STORAGE_USER
  const base = user.value || {};
  user.value = {
    id: payload.sub || payload.id || base.id || null,
    name:
      payload.name ||
      payload.username ||
      payload.email ||
      base.name ||
      "Usuario",
    email: payload.email || base.email || null,
    raw: payload,
  };
  localStorage.setItem(STORAGE_USER, JSON.stringify(user.value));
}
hydrateFromToken();

export function useAuth() {
  const router = useRouter();
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  async function login(jwt, profile) {
    token.value = jwt;
    localStorage.setItem(STORAGE_KEY, jwt);

    // 1) hidrata desde el token
    hydrateFromToken();

    // 2) si el backend devolvió datos fuera del token, mézclalos aquí
    if (profile) {
      user.value = {
        ...user.value,
        // mapea primero_name -> name
        name:
          profile.name ?? profile.first_name ?? user.value?.name ?? "Usuario",
        email: profile.email ?? user.value?.email ?? null,
        id: profile.id ?? user.value?.id ?? null,
      };
      localStorage.setItem(STORAGE_USER, JSON.stringify(user.value));
    }

    const url = new URL(window.location.href);
    const next = url.searchParams.get("next");
    router.push(next || { name: "home" });
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_USER);
    router.push({ name: "home" });
  }

  return { token, user, isAuthenticated, login, logout, hydrateFromToken };
}
