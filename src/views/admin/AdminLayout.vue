<script setup>
import AsideMenu from "@/components/admin/Navigation/AsideMenu.vue";
import { RouterView, RouterLink } from "vue-router";
</script>

<template>
  <div class="grid lg:grid-cols-5">
    <div class="lg:col-span-1">
      <AsideMenu />
    </div>
    <div class="lg:col-span-4 p-5">
      <RouterView />
    </div>
  </div>
</template>
