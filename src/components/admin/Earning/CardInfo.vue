<script setup>
defineProps({
  text: String,
  title: String,
  color: String,
});
</script>

<template>
  <div
    class="rounded-lg shadow bg-white p-5 flex-1 lg:h-36 flex flex-col justify-around"
  >
    <div class="flex justify-between items-center">
      <p class="text-gray-500 text-sm">{{ title }}</p>
      <div
        class="size-10 flex justify-center items-center rounded-sm"
        :style="{ backgroundColor: color }"
      >
        <slot />
      </div>
    </div>

    <div>
      <p class="text-lg font-semibold lg:text-xl" :style="{ color }">
        {{ text }}
      </p>
    </div>
  </div>
</template>
