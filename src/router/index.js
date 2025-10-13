// router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import { useAuth } from "@/composables/useAuth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    {
      path: "/auth",
      name: "auth",
      component: () => import("@/views/auth/AuthLayout.vue"),
      children: [
        {
          path: "registro",
          name: "register",
          meta: { title: "Registro", guestOnly: true },
          component: () => import("@/views/auth/RegistroView.vue"),
        },
        {
          path: "iniciar-sesion",
          name: "login",
          meta: { title: "Iniciar Sesion", guestOnly: true },
          component: () => import("@/views/auth/LoginView.vue"),
        },
      ],
    },
    {
      path: "/me",
      name: "me",
      meta: { requiresAuth: true, title: "Mi Perfil" },
      component: () => import("@/views/MyTripsView.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      meta: { adminOnly: true },
      component: () => import("@/views/admin/AdminLayout.vue"),
      children: [
        {
          path: "panel",
          name: "dashboard",
          meta: { title: "Dashboard", adminOnly: true },
          component: () => import("@/views/admin/DashboardView.vue"),
        },
        {
          path: "clientes",
          name: "clients",
          meta: { title: "Clientes", adminOnly: true },
          component: () => import("@/views/admin/clients/ClientsView.vue"),
        },
        {
          path: "agregar-cliente",
          name: "new-client",
          meta: { title: "Clientes - Agregar", adminOnly: true },
          component: () => import("@/views/admin/clients/NewClientView.vue"),
        },
        {
          path: "editar-cliente/:id",
          name: "update-client",
          meta: { title: "Clientes - Editar", adminOnly: true },
          component: () => import("@/views/admin/clients/EditClientView.vue"),
        },
        {
          path: "viajes",
          name: "tours",
          meta: { title: "Viajes", adminOnly: true },
          component: () => import("@/views/admin/ToursView.vue"),
        },
        {
          path: "cupones",
          name: "coupons",
          meta: { title: "Cupones", adminOnly: true },
          component: () => import("@/views/admin/CouponsView.vue"),
        },
        {
          path: "ingresos",
          name: "earnings",
          meta: { title: "Ingresos", adminOnly: true }, // 👈
          component: () => import("@/views/admin/EarningsView.vue"),
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const { isAuthenticated, user, hydrateFromToken } = useAuth();
  hydrateFromToken();

  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth);
  const guestOnly = to.matched.some((r) => r.meta?.guestOnly);
  const adminOnly = to.matched.some((r) => r.meta?.adminOnly);

  // Si requiere auth y NO está logueado → a login
  if (requiresAuth && !isAuthenticated.value) {
    return { name: "login", query: { next: to.fullPath }, replace: true };
  }

  // Si es solo para invitados y SÍ está logueado → a home (o next)
  if (guestOnly && isAuthenticated.value) {
    const next = to.query?.next ?? { name: "home" };
    return typeof next === "string"
      ? { path: next, replace: true }
      : { ...next, replace: true };
  }

  // rutas solo para admin
  if (adminOnly && (!user.value || !user.value.admin)) {
    return { name: "home", replace: true }; // o una vista 403
  }
});

export default router;
