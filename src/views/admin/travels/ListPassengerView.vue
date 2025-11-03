<script setup>
import { formatDateToSpanish } from "@/utils/formatDate";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useTravelStore } from "@/stores/admin/travelStore";
const route = useRoute();
const id = ref(null);
const store = useTravelStore();

onMounted(async () => {
  id.value = Number(route.params.id);
  try {
    await store.getPassengersByTravel(id.value);
  } catch (error) {
    console.log(error);
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto p-5 space-y-10">
    <div class="space-y-2">
      <div>
        <h2 class="text-4xl font-semibold">Listado de pasajeros</h2>
        <p class="text-gray-400">Administra a tus pasajeros.</p>
      </div>
      <RouterLink
        :to="{ name: 'travels' }"
        class="bg-experience-pink text-white px-4 py-2 rounded cursor-pointer shadow"
      >
        Volver a tus viajes
      </RouterLink>
    </div>

    <div
      class="rounded-lg shadow bg-white p-5"
      v-if="store.hasPassengersByTravel"
    >
      <div class="w-full p-5 rounded-lg bg-gray-50">
        <h2 class="text-4xl font-black text-experience-blue">RH EXPERIENCE</h2>
        <div class="flex flex-col mt-10">
          <p class="text-sm text-gray-500">Fecha de salida: <span class="block text-lg text-black">{{ formatDateToSpanish(store.travelSelected[0].trip_date) }}</span></p>
        </div>
      </div>
      <div class="flex justify-between items-center my-5">
        <h3 class="font-bold text-2xl">
          Pasajeros ({{ store.quantityPassengers }})
        </h3>
        <button
          class="bg-experience-blue text-white p-2 rounded-lg cursor-pointer hover:bg-experience-white hover:text-black transition-colors duration-300 ease-in"
        >
          📥 Descargar PDF
        </button>
      </div>
      <div>
        <table class="w-full" id="table-passengers">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-center p-3 font-normal">Nombre(s)</th>
              <th class="text-center p-3 font-normal">Apellido(s)</th>
              <th class="text-center p-3 font-normal">Email</th>
              <th class="text-center p-3 font-normal">Celular</th>
              <th class="text-center p-3 font-normal">Fecha de nacimiento</th>
              <th class="text-center p-3 font-normal">Alergias</th>
              <th class="text-center p-3 font-normal">Asiento</th>
              <th class="text-center p-3 font-normal">Fecha de compra</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in store.passengersByTravelArray"
              :key="p.id"
              class="border-b border-gray-200 hover:bg-gray-50 text-center"
            >
              <td class="p-3 text-xs">{{ p.first_name }}</td>
              <td class="p-3 text-xs">{{ p.last_name }}</td>
              <td class="p-3 text-xs">{{ p.email }}</td>
              <td class="p-3 text-xs">{{ p.phone }}</td>
              <td class="p-3 text-xs">
                {{ formatDateToSpanish(p.born_date) }}
              </td>
              <td class="p-3 text-xs">
                <div class="flex justify-center flex-wrap gap-2">
                  <span
                    v-for="(allergy, i) in JSON.parse(p.allergies)"
                    :key="i"
                    class="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-1 rounded-full"
                  >
                    {{ allergy }}
                  </span>

                  <span
                    v-if="JSON.parse(p.allergies).length === 0"
                    class="text-gray-400 italic text-[10px]"
                  >
                    Sin alergias
                  </span>
                </div>
              </td>
              <td class="p-3 text-xs">{{ p.seat_id }}</td>
              <td class="p-3 text-xs">
                {{ formatDateToSpanish(p.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <p class="text-center text-gray-500">
        No hay pasajeros registrados para este RH EXPERIENCE.
      </p>
    </div>
  </div>
</template>
