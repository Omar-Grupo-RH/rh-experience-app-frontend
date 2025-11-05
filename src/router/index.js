// router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import { useAuth } from "@/composables/useAuth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      meta: { title: "Comprar Tickets" },
      component: HomeView,
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("@/views/auth/AuthLayout.vue"),
      children: [
        {
          path: "iniciar-sesion",
          name: "login",
          meta: { title: "Iniciar Sesion", guestOnly: true },
          component: () => import("@/views/auth/LoginView.vue"),
        },
      ],
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
          path: "agenda",
          name: "calendar",
          meta: { title: "Agenda de viajes", adminOnly: true },
          component: () => import("@/views/admin/ToursView.vue"),
        },
        {
          path: "viajes",
          name: "travels",
          meta: { title: "Mis Viajes", adminOnly: true },
          component: () => import("@/views/admin/travels/TravelsView.vue"),
        },
        {
          path: "lista-pasajeros/:id",
          name: "list-passenger",
          meta: { title: "Lista de pasajeros ", adminOnly: true },
          component: () =>
            import("@/views/admin/travels/ListPassengerView.vue"),
        },
        {
          path: "cupones",
          name: "coupons",
          meta: { title: "Cupones", adminOnly: true },
          component: () => import("@/views/admin/coupons/CouponsView.vue"),
        },
        {
          path: "agregar-cupon",
          name: "new-coupon",
          meta: { title: "Cupones - Agregar", adminOnly: true },
          component: () => import("@/views/admin/coupons/NewCouponView.vue"),
        },
        {
          path: "editar-cupon/:id",
          name: "update-coupon",
          meta: { title: "Cupones - Editar", adminOnly: true },
          component: () => import("@/views/admin/coupons/EditCouponView.vue"),
        },
        {
          path: "ingresos",
          name: "earnings",
          meta: { title: "Ingresos", adminOnly: true }, // 👈
          component: () => import("@/views/admin/EarningsView.vue"),
        },
        {
          path: "comentarios",
          name: "comments",
          meta: { title: "Comentarios", adminOnly: true }, // 👈
          component: () => import("@/views/admin/CommentsView.vue"),
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
