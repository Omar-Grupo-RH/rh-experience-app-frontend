<script setup>
import { onMounted, ref } from "vue";
import { useCouponStore } from "@/stores/couponStore";
import { formatDateToSpanish } from "@/utils/formatDate";
const store = useCouponStore();

onMounted(async () => {
  await store.getCoupons();
});
</script>

<template>
  <div>
    <div class="space-y-5" v-if="store.hasCoupons">
      <div class="flex justify-end">
        <RouterLink
          :to="{ name: 'new-coupon' }"
          class="bg-experience-pink text-white px-4 py-2 rounded cursor-pointer shadow"
        >
          + Nuevo cupón
        </RouterLink>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-center p-3 font-normal">Código</th>
            <th class="text-center p-3 font-normal">Descripción</th>
            <th class="text-center p-3 font-normal">Descuento(%)</th>
            <th class="text-center p-3 font-normal">Limite de uso</th>
            <th class="text-center p-3 font-normal">Expira</th>
            <th class="text-center p-3 font-normal">Estado</th>
            <th class="text-center p-3 font-normal">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="coupon in store.coupons"
            :key="coupon.id"
            class="border-b border-gray-200 hover:bg-gray-50 text-center"
            :class="[store.isExpiredOrUsedUp(coupon.id) ? 'opacity-50' : '']"
          >
            <td class="p-3 text-sm">{{ coupon.code }}</td>
            <td class="p-3 text-sm">{{ coupon.description }}</td>
            <td class="p-3 text-sm">{{ coupon.discount }}%</td>
            <td class="p-3 text-sm">{{ coupon.usage_limit }}</td>
            <td class="p-3 text-sm">
              {{ formatDateToSpanish(coupon.expiry_date) }}
            </td>
            <td class="p-3 text-sm">
              <button
                class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 cursor-pointer"
                :class="[
                  store.statusCoupon(coupon.id)
                    ? 'bg-green-100 text-green-500'
                    : 'bg-red-100 text-red-500',
                ]"
              >
                {{ store.statusCoupon(coupon.id) ? "Activo" : "Inactivo" }}
              </button>
            </td>
            <td class="p-3 text-sm">
              <button class="text-blue-600 hover:underline mr-2">Editar</button>
              |
              <button class="text-red-500 hover:underline cursor-pointer">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else>
      <p class="text-center text-gray-500">No hay cupones registrados.</p>
      <div class="flex justify-end mt-4">
        <RouterLink
          :to="{ name: 'new-coupon' }"
          class="bg-experience-pink text-white px-4 py-2 rounded cursor-pointer shadow"
        >
          + Nuevo cupón
        </RouterLink>
      </div>
    </div>
  </div>
</template>
