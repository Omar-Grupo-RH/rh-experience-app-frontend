<script setup>
import { ref } from "vue";
import { useCouponStore } from "@/stores/couponStore";
import FormCoupon from "@/components/admin/Coupons/FormCoupon.vue";
import { formatDateToSpanish } from "@/utils/formatDate";
const store = useCouponStore();

const showForm = ref(false);
const selectedCoupon = ref(null);
const mode = ref("create");

function openCreate() {
  mode.value = "create";
  selectedCoupon.value = null;
  showForm.value = true;
}

function openEdit(coupon) {
  mode.value = "edit";
  selectedCoupon.value = coupon;
  showForm.value = true;
}
</script>

<template>
  <div>
    <div class="space-y-5" v-if="store.coupons.length > 0">
      <div class="flex justify-end">
        <button
          @click="openCreate"
          class="bg-experience-pink text-white px-4 py-2 rounded shadow"
        >
          + Nuevo cupón
        </button>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-center p-3 font-normal">Código</th>
            <th class="text-center p-3 font-normal">Descuento</th>
            <th class="text-center p-3 font-normal">Uso</th>
            <th class="text-center p-3 font-normal">Expira</th>
            <th class="text-center p-3 font-normal">Activo</th>
            <th class="text-center p-3 font-normal">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="coupon in store.coupons"
            :key="coupon.id"
            class="border-b border-gray-200 hover:bg-gray-50 text-center"
          >
            <td class="p-3 font-medium">{{ coupon.code }}</td>
            <td class="p-3">{{ coupon.discount }}%</td>
            <td class="p-3">{{ coupon.usageLimit }}</td>
            <td class="p-3">
              {{ formatDateToSpanish(coupon.expirationDate) }}
            </td>
            <td class="p-3">
              <span
                :class="coupon.isActive ? 'text-green-600' : 'text-red-500'"
              >
                {{ coupon.isActive ? "Sí" : "No" }}
              </span>
            </td>
            <td class="p-3">
              <button
                class="text-blue-600 hover:underline mr-2"
                @click="openEdit(coupon)"
              >
                Editar
              </button>
              |
              <button
                class="text-red-500 hover:underline cursor-pointer"
                @click="store.deleteCoupon(coupon)"
              >
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
        <button
          @click="openCreate"
          class="bg-experience-pink text-white px-4 py-2 rounded cursor-pointer shadow"
        >
          + Nuevo cliente
        </button>
      </div>
    </div>

    <!-- Modal con formulario -->
    <FormCoupon
      v-if="showForm"
      :mode="mode"
      :coupon="selectedCoupon"
      @close="showForm = false"
    />
  </div>
</template>
