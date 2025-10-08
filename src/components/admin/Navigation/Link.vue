<script setup>
import { RouterLink } from "vue-router";

defineProps({
  to: {
    type: String,
  },
});
</script>

<template>
  <RouterLink
    :to="{ name: to }"
    class="block py-2 px-4 rounded lg:text-xl text-white hover:bg-experience-white/20"
    active-class="bg-experience-white/20 font-semibold"
  >
    <slot></slot>
  </RouterLink>
</template>
