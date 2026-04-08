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
    class="tracking-widest text-center text-sm"
    active-class="font-bold"
  >
    <slot></slot>
  </RouterLink>
</template>
