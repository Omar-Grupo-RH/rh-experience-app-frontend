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
    class="block py-2 px-4 rounded text-white hover:bg-experience-white/20"
    active-class="bg-experience-white/20 "
  >
    <slot></slot>
  </RouterLink>
</template>
