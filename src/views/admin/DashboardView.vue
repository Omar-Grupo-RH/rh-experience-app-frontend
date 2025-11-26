<script setup>
import IncomeChart from "@/components/admin/Graphics/IncomeChart.vue";
</script>

<template>
  <div class="mx-auto p-5 space-y-10">
    <h2 class="text-4xl font-semibold">Panel de control</h2>
    <div class="flex gap-5">
      <div
        class="rounded-lg shadow bg-white p-5 flex-1 lg:h-36 flex flex-col justify-around"
      >
        <div class="flex justify-between items-center">
          <p>Total de Clientes</p>
          <div><img src="/svg/cart.svg" class="w-8" alt="" /></div>
        </div>
        <div>
          <p class="text-lg font-black lg:text-xl">100 clientes</p>
        </div>
      </div>
      <div
        class="rounded-lg shadow bg-white p-5 flex-1 lg:h-36 flex flex-col justify-around"
      >
        <div class="flex justify-between">
          <p>Ingreso Total</p>
          <div><img src="/svg/money.svg" class="w-8" alt="" /></div>
        </div>
        <div>
          <p class="text-lg font-black lg:text-xl">$4,326 MXN</p>
        </div>
      </div>
      <div
        class="rounded-lg shadow bg-white p-5 flex-1 lg:h-36 flex flex-col justify-around"
      >
        <div class="flex justify-between">
          <p>Proximo experience</p>
          <div><img src="/svg/calendar.svg" class="w-8" alt="" /></div>
        </div>
        <div>
          <p class="text-lg font-black lg:text-xl">
            Jueves 31 de Octubre del 2025
          </p>
        </div>
      </div>
    </div>

    <div>
      <IncomeChart />
    </div>

    
  </div>
</template>
