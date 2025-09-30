import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
 
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("@/views/auth/AuthLayout.vue"),
      children: [
        {
          path: "registro",
          name: "register",
          meta: { title: "Registro" },
          component: () => import("@/views/auth/RegistroView.vue"),
        },
        {
          path: "iniciar-sesion",
          name: "login",
          meta: { title: "Iniciar Sesion" },
          component: () => import("@/views/auth/LoginView.vue"),
        },
      ],
    },
  ],
});

export default router;
