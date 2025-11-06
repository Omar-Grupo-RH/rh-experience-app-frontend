<script setup>
defineProps({
  limit: Number,
});
</script>

<template>
  <div class="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:mt-5" aria-hidden="true">
    <div
      v-for="i in limit"
      :key="i"
      class="n rounded-xl shadow-lg p-5 h-[150px] bg-gray-200 animate-pulse"
    ></div>
  </div>
</template>
