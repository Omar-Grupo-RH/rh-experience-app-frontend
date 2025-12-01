<script setup>
import { onMounted, watch } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { formatDateToSpanish } from "@/utils/formatDate";
import { useEarningStore } from "@/stores/admin/earningStore";
import { currencyFormat } from "@/utils/formatMoney";

const store = useEarningStore();

// primer llamado al cargar
onMounted(() => {
  store.fetchEarnings();
});

// cuando cambie la fecha
watch(
  () => store.date,
  () => {
    store.fetchEarnings();
  }
);
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-16">
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
        <!-- loader -->
        <div
          v-if="store.loading"
          class="absolute inset-0 flex items-center justify-center bg-white/60 z-20"
        >
          Cargando...
        </div>

        <table
          v-if="store.rows.length"
          class="w-full text-xs lg:text-sm hidden md:table"
        >
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr class="border-b border-gray-200 text-sm">
              <th class="text-center py-2 font-normal">Comprador</th>
              <th class="text-center py-2 font-normal">Subtotal</th>
              <th class="text-center py-2 font-normal">Descuento</th>
              <th class="text-center py-2 font-normal">Total</th>
              <th class="text-center py-2 font-normal">Estado</th>
              <th class="text-center py-2 font-normal">Fecha compra</th>
              <th class="text-center py-2 font-normal">Fecha Viaje</th>
            </tr>
          </thead>

          <tbody class="text-xs">
            <tr
              v-for="order in store.rows"
              :key="order.id"
              class="border-b border-gray-200 text-center"
            >
              <td class="p-3 text-center capitalize">
                {{ order.buyer_name }}
              </td>
              <td class="p-3 text-center">
                {{ currencyFormat(order.subtotal_cents) }}
              </td>
              <td class="p-3 text-center">
                {{ currencyFormat(order.discount_cents) }}
              </td>
              <td class="p-3 text-center">
                {{ currencyFormat(order.total_cents) }}
              </td>
              <td class="p-3 text-center">
                <span
                  class="px-1.5 py-1 rounded-2xl text-white"
                  :class="
                    order.status === 'pagado' ? 'bg-green-600' : 'bg-gray-400'
                  "
                >
                  {{ order.status }}
                </span>
              </td>
              <td class="p-3 text-center">
                {{ formatDateToSpanish(order.created_at) }}
              </td>
              <td class="p-3 text-center">
                {{ formatDateToSpanish(order.trip_date) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="store.rows.length" class="space-y-3 md:hidden">
          <div
            v-for="order in store.rows"
            :key="order.id"
            class="border border-gray-200 rounded-lg p-4 text-xs bg-white shadow-sm"
          >
            <div class="flex justify-between mb-1">
              <span class="font-semibold">Comprador</span>
              <span class="capitalize text-right">{{ order.buyer_name }}</span>
            </div>

            <div class="flex justify-between mb-1">
              <span>Subtotal</span>
              <span>{{ currencyFormat(order.subtotal_cents) }}</span>
            </div>

            <div class="flex justify-between mb-1">
              <span>Descuento</span>
              <span>{{ currencyFormat(order.discount_cents) }}</span>
            </div>

            <div class="flex justify-between mb-1">
              <span>Total</span>
              <span class="font-semibold">
                {{ currencyFormat(order.total_cents) }}
              </span>
            </div>

            <div class="flex justify-between mb-1 items-center">
              <span>Estado</span>
              <span
                class="px-1.5 py-0.5 rounded-2xl text-white text-[11px]"
                :class="
                  order.status === 'pagado' ? 'bg-green-600' : 'bg-gray-400'
                "
              >
                {{ order.status }}
              </span>
            </div>

            <div class="flex justify-between mb-1">
              <span>Fecha compra</span>
              <span>{{ formatDateToSpanish(order.created_at) }}</span>
            </div>

            <div class="flex justify-between">
              <span>Fecha viaje</span>
              <span>{{ formatDateToSpanish(order.trip_date) }}</span>
            </div>
          </div>
        </div>
        <div v-else>
          <h3 class="text-center text-gray-400 text-sm">
            No se encontraron registros para los filtros seleccionados.
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>
