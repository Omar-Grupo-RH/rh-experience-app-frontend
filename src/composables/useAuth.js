import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const STORAGE_KEY = "AUTH_TOKEN";
const STORAGE_USER = "AUTH_USER";

const token = ref(localStorage.getItem(STORAGE_KEY) || null);
const user = ref(JSON.parse(localStorage.getItem(STORAGE_USER) || "null"));

function toBoolAdmin(val) {
  return val === true || val === 1 || val === "1" || val === "true";
}

function decodeJwtPayload(jwt) {
  try {
    const [, payload] = jwt.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function hydrateFromToken(logoutFn) {
  if (!token.value) {
    user.value = null;
    localStorage.removeItem(STORAGE_USER);
    return;
  }

  const payload = decodeJwtPayload(token.value);
  if (
    !payload ||
    (payload.exp && payload.exp < Math.floor(Date.now() / 1000))
  ) {
    logoutFn?.();
    return;
  }

  const base = user.value || {};
  const adminValue =
    typeof payload.admin !== "undefined"
      ? toBoolAdmin(payload.admin)
      : typeof base.admin !== "undefined"
      ? toBoolAdmin(base.admin)
      : false;

  user.value = {
    id: payload.sub || payload.id || base.id || null,
    first_name: payload.first_name || base.first_name,
    last_name: payload.last_name || base.last_name,
    admin: adminValue,
    raw: payload,
  };

  localStorage.setItem(STORAGE_USER, JSON.stringify(user.value));
}

export function useAuth() {
  const router = useRouter();
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_USER);
    router.push({ name: "home" });
  }

  async function login(jwt, profile) {
    token.value = jwt;
    localStorage.setItem(STORAGE_KEY, jwt);

    hydrateFromToken(logout);

    if (profile) {
      user.value = {
        ...user.value,
        ...profile,
        id: profile.id ?? user.value?.id ?? null,
        admin: toBoolAdmin(profile.admin),
      };
      localStorage.setItem(STORAGE_USER, JSON.stringify(user.value));
    }

    

    if (user.value.admin) {
      router.push({ name: "dashboard" });
      return;
    }

    const url = new URL(window.location.href);
    const next = url.searchParams.get("next");
    router.push(next || { name: "home" });
  }

  // inicializamos al cargar el composable
  hydrateFromToken(logout);

  return { token, user, isAuthenticated, login, logout, hydrateFromToken };
}
