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
      path: "/encuesta",
      name: "survey",
      meta: { title: "Encuesta de Experiencia" },
      component: () => import("@/views/SurveyView.vue"),
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("@/views/auth/AuthLayout.vue"),
      children: [
        {
          path: "iniciar-sesion",
          name: "login",
          meta: {
            title: "Iniciar Sesion",
            guestOnly: true,
          },
          component: () => import("@/views/auth/LoginView.vue"),
        },
      ],
    },

    {
      path: "/admin",
      name: "admin",
      meta: {
        requiresAuth: true,
        adminOnly: true,
      },
      component: () => import("@/views/admin/AdminLayout.vue"),
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          meta: {
            title: "Dashboard",
            requiresAuth: true,
            adminOnly: true,
            fullAdminOnly: true,
          },
          component: () => import("@/views/admin/DashboardView.vue"),
        },

        {
          path: "agenda",
          name: "calendar",
          meta: {
            title: "Agenda de viajes",
            requiresAuth: true,
            adminOnly: true,
          },
          component: () => import("@/views/admin/ToursView.vue"),
        },
        {
          path: "pasajeros",
          name: "travels",
          meta: {
            title: "Mis Pasajeros",
            requiresAuth: true,
            adminOnly: true,
          },
          component: () => import("@/views/admin/TravelsView.vue"),
        },
        {
          path: "lista-pasajeros/:id",
          name: "list-passenger",
          meta: {
            title: "Lista de pasajeros",
            requiresAuth: true,
            activeMenu: "travels",
            adminOnly: true,
          },
          component: () =>
            import("@/views/admin/travels/ListPassengerView.vue"),
        },
        {
          path: "encuestas",
          name: "survey-responses",
          meta: {
            title: "Encuestas",
            requiresAuth: true,
            adminOnly: true,
            fullAdminOnly: true,
          },
          component: () => import("@/views/admin/SurveyResponsesView.vue"),
        },
        {
          path: "codes",
          name: "codes",
          meta: {
            title: "Códigos",
            requiresAuth: true,
            adminOnly: true,
            fullAdminOnly: true,
          },
          component: () => import("@/views/admin/CodesView.vue"),
        },
        {
          path: "comentarios",
          name: "comments",
          meta: {
            title: "Comentarios",
            requiresAuth: true,
            adminOnly: true,
            fullAdminOnly: true,
          },
          component: () => import("@/views/admin/CommentsView.vue"),
        },
        {
          path: "usuarios",
          name: "users",
          meta: {
            title: "Usuarios",
            requiresAuth: true,
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
    //     requiresAuth: true,
    //     adminOnly: true,
    //     requiredAdminLevel: 3,
    //   },
    //   component: () => import("@/views/cobranza/CobranzaLayout.vue"),
    //   children: [
    //     {
    //       path: "listado",
    //       name: "cobranza",
    //       meta: {
    //         title: "Cobranza",
    //         requiresAuth: true,
    //         adminOnly: true,
    //         requiredAdminLevel: 3,
    //       },
    //       component: () => import("@/views/cobranza/CobranzaView.vue"),
    //     },
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

  const requiredAdminLevel = to.matched.reduce((lvl, r) => {
    if (r.meta?.requiredAdminLevel !== undefined) {
      return r.meta.requiredAdminLevel;
    }

    return lvl;
  }, null);

  
if (guestOnly && isAuthenticated.value) {
  if (Number(adminLevel.value) === 1) {
    return {
      name: "dashboard",
      replace: true,
    };
  }

  if (Number(adminLevel.value) === 2) {
    return {
      name: "calendar",
      replace: true,
    };
  }

  return {
    name: "home",
    replace: true,
  };
}

  if ((requiresAuth || adminOnly) && !isAuthenticated.value) {
    return {
      name: "login",
      query: {
        next: to.fullPath,
      },
      replace: true,
    };
  }

  // Si es ruta admin pero el usuario no tiene nivel admin.
  if (adminOnly && (!user.value || adminLevel.value <= 0)) {
    return {
      name: "home",
      replace: true,
    };
  }

  // Solo super administrador.
  if (fullAdminOnly && Number(adminLevel.value) !== 1) {
    return {
      name: "home",
      replace: true,
    };
  }

  // Ruta con nivel exacto.
  if (
    requiredAdminLevel !== null &&
    Number(adminLevel.value) !== Number(requiredAdminLevel)
  ) {
    return {
      name: "home",
      replace: true,
    };
  }
});

export default router;
