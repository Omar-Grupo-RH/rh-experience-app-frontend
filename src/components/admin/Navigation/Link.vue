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
    class="block py-2 px-4 rounded hover:bg-gray-100"
    active-class="font-bold"
  >
    <slot></slot>
  </RouterLink>
</template>
