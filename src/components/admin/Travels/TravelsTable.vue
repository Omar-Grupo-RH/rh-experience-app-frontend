<script setup>
import { formatDateToSpanish } from "@/utils/formatDate";

defineProps({
  travels: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div>
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="p-3 font-normal">Titulo</th>
          <th class="p-3 font-normal">Fecha de salida</th>
          <th class="p-3 font-normal">Pasajeros</th>
          <th class="p-3 font-normal">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="travel in travels"
          :key="travel.id"
          class="border-b border-gray-200 hover:bg-gray-50 text-center"
        >
          <td class="p-3 text-sm">{{ travel.title }}</td>
          <td class="p-3 text-sm">
            {{ formatDateToSpanish(travel.trip_date) }}
          </td>
          <td class="p-3 text-sm">
            <span class="bg-experience-blue size-7 flex items-center justify-center  rounded-full text-white mx-auto">
              {{ travel.unavaible_seats }}
            </span>
          </td>
          <td class="p-3 text-sm">
            <RouterLink
              class="text-experience-blue hover:underline cursor-pointer"
              :to="{ name: 'list-passenger', params: { id: travel.id } }"
            >
              Ver pasajeros
            </RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
