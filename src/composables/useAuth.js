// useAuth.js
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const STORAGE_KEY = "AUTH_TOKEN";
const STORAGE_USER = "AUTH_USER";

const token = ref(localStorage.getItem(STORAGE_KEY) || null);
const user = ref(JSON.parse(localStorage.getItem(STORAGE_USER) || "null"));

function toAdminLevel(val) {
  if (val === null || val === undefined) return 0;
  const n = Number(val);
  return Number.isNaN(n) ? 0 : n; // 0,1,2,3...
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
  const adminLevel =
    payload.admin !== undefined
      ? toAdminLevel(payload.admin)
      : base.admin !== undefined
        ? toAdminLevel(base.admin)
        : 0;

  user.value = {
    id: payload.sub || payload.id || base.id || null,
    username: payload.username || base.username,
    admin: adminLevel,
    raw: payload,
  };

  localStorage.setItem(STORAGE_USER, JSON.stringify(user.value));
}

export function useAuth() {
  const router = useRouter();
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const adminLevel = computed(() => user.value?.admin ?? 0);
  const isAdmin = computed(() => adminLevel.value > 0);
  const isFullAdmin = computed(() => adminLevel.value === 1);

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
     const level = toAdminLevel(profile.admin ?? user.value?.admin ?? 0);

     user.value = {
       ...user.value,
       ...profile,
       id: profile.id ?? user.value?.id ?? null,
       admin: level,
     };

     localStorage.setItem(STORAGE_USER, JSON.stringify(user.value));
   }

   const level = Number(user.value?.admin ?? 0);

   if (level === 1) {
     return await router.replace({ name: "dashboard" });
   }

   if (level === 2) {
     return await router.replace({ name: "calendar" });
   }

   return await router.replace({ name: "home" });
 }

  hydrateFromToken(logout);

  return {
    token,
    user,
    isAuthenticated,
    adminLevel,
    isAdmin,
    isFullAdmin,
    login,
    logout,
    hydrateFromToken,
  };
}
