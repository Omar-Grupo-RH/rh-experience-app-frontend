import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useReservaStore } from "@/stores/reservaStore";

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

function syncReservaStore(userData) {
  const storeReserva = useReservaStore();
  if (!storeReserva) return;
  const fields = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "born_date",
    "allergies",
  ];
  fields.forEach((f) => {
    if (userData[f]) storeReserva.form[f] = userData[f];
  });
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
    email: payload.email || base.email,
    phone: payload.phone || base.phone,
    born_date: payload.born_date || base.born_date,
    allergies: payload.allergies || base.allergies,
    admin: adminValue,
    raw: payload,
  };

  localStorage.setItem(STORAGE_USER, JSON.stringify(user.value));
  syncReservaStore(user.value);
}

export function useAuth() {
  const router = useRouter();
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const storeReserva = useReservaStore();
  function logout() {
    storeReserva.form.first_name = "";
    storeReserva.form.last_name = "";
    storeReserva.form.email = "";
    storeReserva.form.phone = "";
    storeReserva.form.born_date = "";
    storeReserva.form.allergies = [];
    token.value = null;
    user.value = null;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_USER);
    router.push({ name: "login" });
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

    syncReservaStore(user.value);

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
