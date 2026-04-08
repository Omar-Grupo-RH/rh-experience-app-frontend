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
          path: "agenda",
          name: "calendar",
          meta: {
            title: "Agenda de viajes",
            adminOnly: true,
          },
          component: () => import("@/views/admin/ToursView.vue"),
        },
        {
          path: "pasajeros",
          name: "travels",
          meta: {
            title: "Mis Pasajeros",
            adminOnly: true,
          },
          component: () => import("@/views/admin/TravelsView.vue"),
        },
        {
          path: "lista-pasajeros/:id",
          name: "list-passenger",
          meta: {
            title: "Lista de pasajeros",
            adminOnly: true,
          },
          component: () =>
            import("@/views/admin/travels/ListPassengerView.vue"),
        },
        {
          path: "comentarios",
          name: "comments",
          meta: {
            title: "Comentarios",
            adminOnly: true,
          },
          component: () => import("@/views/admin/CommentsView.vue"),
        },
        {
          path: "usuarios",
          name: "users",
          meta: {
            title: "Usuarios",
            adminOnly: true,
            fullAdminOnly: true,
          },
          component: () => import("@/views/admin/programmer/UsersView.vue"),
        },
      ],
    },
    // {
    //   path: "/cobranza",
    //   name: "cobranza-root",
    //   meta: {
    //     adminOnly: true,
    //     requiredAdminLevel: 3, //solo admin === 2
    //   },
    //   component: () => import("@/views/cobranza/CobranzaLayout.vue"), // tu layout para admin 2
    //   children: [
    //     {
    //       path: "listado",
    //       name: "cobranza",
    //       meta: {
    //         title: "Cobranza",
    //         adminOnly: true,
    //         requiredAdminLevel: 3,
    //       },
    //       component: () => import("@/views/cobranza/CobranzaView.vue"),
    //     },
    //     // aquí en el futuro agregas más vistas para admin 2
    //   ],
    // },
  ],
});

router.beforeEach((to) => {
  const { isAuthenticated, user, adminLevel, hydrateFromToken } = useAuth();
  hydrateFromToken();

  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth);
  const guestOnly = to.matched.some((r) => r.meta?.guestOnly);
  const adminOnly = to.matched.some((r) => r.meta?.adminOnly);
  const fullAdminOnly = to.matched.some((r) => r.meta?.fullAdminOnly);

  // nivel exacto requerido (si alguna ruta lo define)
  const requiredAdminLevel = to.matched.reduce((lvl, r) => {
    if (r.meta?.requiredAdminLevel !== undefined) {
      return r.meta.requiredAdminLevel;
    }
    return lvl;
  }, null);

  // requiere auth
  if (requiresAuth && !isAuthenticated.value) {
    return { name: "login", query: { next: to.fullPath }, replace: true };
  }

  // solo invitados
  if (guestOnly && isAuthenticated.value) {
    const next = to.query?.next ?? { name: "home" };
    return typeof next === "string"
      ? { path: next, replace: true }
      : { ...next, replace: true };
  }

  // rutas solo para algún admin (nivel > 0)
  if (adminOnly && (!user.value || adminLevel.value <= 0)) {
    return { name: "home", replace: true };
  }

  // rutas solo para admin full (admin === 1)
  if (fullAdminOnly && adminLevel.value !== 1) {
    return { name: "home", replace: true };
  }

  // rutas con nivel de admin exacto (ej: requiredAdminLevel: 2)
  if (requiredAdminLevel !== null && adminLevel.value !== requiredAdminLevel) {
    return { name: "home", replace: true };
  }
});

export default router;
