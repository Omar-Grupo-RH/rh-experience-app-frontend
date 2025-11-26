<script setup>
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { formatDateToSpanish } from "@/utils/formatDate";
import { useEarningStore } from "@/stores/admin/earningStore";

const store = useEarningStore();
</script>

<template>
  <div class="flex gap-x-16">
    <div class="flex flex-col justify-center gap-5">
      <div>
        <VueDatePicker
          inline
          auto-apply
          v-model="store.date"
          :model-type="'yyyy-MM-dd'"
          :format="'yyyy-MM-dd'"
          :time-config="{ enableTimePicker: false }"
        />
      </div>
    </div>

    <div class="flex-1">
      <div class="flex justify-between items-center pb-5">
        <h3 class="text-xl">
          Ganancias totales
          {{ store.date ? `del ${formatDateToSpanish(store.date)}` : "" }}
        </h3>
        <div class="flex gap-3 items-center">
          <button
            @click="store.toggleOrder"
            class="px-2 py-1 rounded-sm text-sm cursor-pointer transition w-32 border border-gray-400 flex gap-2 justify-center"
          >
            <img src="/svg/arrows.svg" class="w-3" alt="" />
            {{ store.order === "asc" ? "Ascendente" : "Descendente" }}
          </button>
          <button
            class="px-2 py-1 rounded-sm text-sm cursor-pointer transition w-32 border border-gray-400 flex gap-2 justify-center"
            @click="store.resetDate()"
          >
            Mostrar todo
          </button>
        </div>
      </div>
      <div class="overflow-y-scroll h-96 relative">
        <table class="w-full">
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr class="border-b border-gray-200 text-sm">
              <th class="text-center py-2 font-normal">Cliente</th>
              <th class="text-center py-2 font-normal">Subtotal</th>
              <th class="text-center py-2 font-normal">Descuento</th>
              <th class="text-center py-2 font-normal">Total</th>
              <th class="text-center py-2 font-normal">Estado</th>
              <th class="text-center py-2 font-normal">Fecha</th>
              <th class="text-center py-2 font-normal">Viaje</th>
            </tr>
          </thead>

          <tbody class="text-xs">
            <tr
              class="border-b border-gray-200 text-center"
              v-for="index in 100"
              :key="index"
            >
              <td class="p-3 text-center">Omar Fernando Solis Carvajal</td>
              <td class="p-3 text-center">$2,100.00</td>
              <td class="p-3 text-center">$210.00</td>
              <td class="p-3 text-center">$1890.00</td>
              <td class="p-3 text-center">
                <span class="bg-green-600 px-1.5 py-1 rounded-2xl text-white"
                  >Pagado</span
                >
              </td>
              <td class="p-3 text-center">10 Noviembre 2025</td>
              <td class="p-3 text-center">19 Noviembre</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
