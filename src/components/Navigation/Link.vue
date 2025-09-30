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
    class="text-lg tracking-widest w-full h-full  text-center flex justify-center items-center"
    active-class="font-bold"
  >
    <slot></slot>
  </RouterLink>
</template>
