<script setup>
import CardInfo from "@/components/admin/Earning/CardInfo.vue";
import EarningsTable from "@/components/admin/Earning/EarningsTable.vue";
import { currencyFormat } from "@/utils/formatMoney";
</script>

<template>
  <div class="mx-auto p-5 space-y-10">
    <div class="space-y-1">
      <h2 class="text-4xl font-semibold">Resumen de ventas</h2>
      <p class="text-gray-400">Gestiona tus ingresos por ventas de boletos</p>
    </div>
    <div>
      <div class="grid grid-cols-4 gap-x-5">
        <CardInfo
          title="Ganancia bruta"
          :text="currencyFormat(13000)"
          color="#2c5da7"
        >
          <img src="/svg/money.svg" class="w-5" alt="" />
        </CardInfo>
        <CardInfo
          title="Ganancia neta"
          :text="currencyFormat(9360)"
          color="#69c2be"
        >
          <img src="/svg/money.svg" class="w-5" alt="" />
        </CardInfo>
        <CardInfo title="Transacciones completas" text="5" color="#88bf73">
          <img src="/svg/cart.svg" class="w-6" alt="" />
        </CardInfo>
        <CardInfo title="Ganancia del dia de hoy"     :text="currencyFormat(1200)" color="#d94a93">
          <img src="/svg/money.svg" class="w-6" alt="" />
        </CardInfo>
      </div>

      <div class="rounded-lg shadow bg-white p-5 mt-10">
        <EarningsTable />
      </div>
    </div>
  </div>
</template>
