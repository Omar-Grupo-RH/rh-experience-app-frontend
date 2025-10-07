import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { plugin, defaultConfig } from "@formkit/vue";
import { useToast } from "vue-toast-notification";

import config from "../formkit.config";

import router from "./router";
import App from "./App.vue";

import "vue-toast-notification/dist/theme-sugar.css";

const $toast = useToast({
  duration: 5000,
  position: "top-right",
});
const appName = "RH Experience"; // nombre por defecto

router.afterEach((to) => {
  // toma el meta.title más cercano (soporta rutas anidadas)
  const record = [...to.matched].reverse().find((r) => r.meta?.title);
  let title = record?.meta?.title;

  // permite funciones para títulos dinámicos
  if (typeof title === "function") title = title(to);

  document.title = title ? `${title} | ${appName}` : appName;
});

const app = createApp(App);
app.provide("toast", $toast);
app.use(createPinia());
app.use(plugin, defaultConfig(config));

app.use(router);

app.mount("#app");
