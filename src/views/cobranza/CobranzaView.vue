<script setup>
import { formatDateToSpanish } from "@/utils/formatDate";
import { useEarningStore } from "@/stores/admin/earningStore";
import { currencyFormat } from "@/utils/formatMoney";
import { onMounted } from "vue";
import * as XLSX from "xlsx";

const store = useEarningStore();

// primer llamado al cargar
onMounted(() => {
  store.fetchEarnings();
});

// Exportar a Excel
const exportToExcel = () => {
  if (!store.buyers.length) {
    alert("No hay datos para exportar.");
    return;
  }

  // Mapeamos los datos del grid a un formato amigable para Excel
  const rows = store.buyers.map((order) => ({
    "Nombre del cliente": order.buyer_name,
    "Monto pagado": order.total_cents, // en pesos (si viene en centavos)
    "Estado de compra": order.status,
    "Fecha de compra": order.created_at,
  }));

  // Creamos la hoja y el libro
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");

  // Nombre del archivo
  const today = new Date();
  const isoDate = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const fileName = `ventas-rh-experience-${isoDate}.xlsx`;

  // Descargar archivo
  XLSX.writeFile(workbook, fileName);
};
</script>

<template>
  <div class="mx-auto p-5 space-y-10">
    <div class="space-y-1">
      <h2 class="text-4xl font-semibold">Resumen de ventas</h2>
      <p class="text-gray-400">Gestiona los ingresos por ventas de boletos</p>
    </div>

    <div class="rounded-lg shadow bg-white p-5 mt-10 h-full">
      <div class="flex justify-end my-5">
        <button
          class="bg-experience-blue text-white p-2 w-32 rounded-sm text-sm cursor-pointer"
          @click="exportToExcel"
        >
          Exportar EXCEL
        </button>
      </div>
      <div class="h-full relative">
        <!-- loader -->
        <div
          v-if="store.loading"
          class="absolute inset-0 flex items-center justify-center bg-white/60 z-20"
        >
          Cargando...
        </div>

        <div
          v-if="store.buyers.length"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <div
            v-for="order in store.buyers"
            :key="order.id"
            class="p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col border rounded-sm border-gray-200"
          >
            <div class="flex-1">
              <h3
                class="text-lg font-semibold text-foreground mb-2 line-clamp-2 capitalize"
              >
                {{ order.buyer_name }}
              </h3>
              <div class="space-y-3">
                <div>
                  <p
                    class="text-xs text-muted-foreground uppercase tracking-wide"
                  >
                    Monto Pagado
                  </p>
                  <p class="text-2xl font-bold text-primary">
                    {{ currencyFormat(order.total_cents) }}
                  </p>
                </div>
                <div class="flex items-center justify-between">
                  <p
                    class="text-xs text-muted-foreground uppercase tracking-wide"
                  >
                    Estado
                  </p>
                  <p
                    class="px-1.5 py-1 rounded-2xl text-white text-xs"
                    :class="
                      order.status === 'pagado' ? 'bg-green-600' : 'bg-gray-400'
                    "
                  >
                    {{ order.status }}
                  </p>
                </div>
              </div>
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
