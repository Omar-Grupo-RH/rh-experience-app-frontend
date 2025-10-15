<script setup>
import { useCouponStore } from "@/stores/couponStore";
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";

const couponStore = useCouponStore();
const route = useRoute();
const router = useRouter();

const formData = ref({
  code: "",
  discount: "",
  usage_limit: "",
  expiry_date: "", // Cambiado a expiry_date para consistencia
  is_active: true,
  description: "",
});

onMounted(async () => {
  try {
    const id = Number(route.params.id);
    const coupon = await couponStore.getCouponById(id); // Guardar el resultado

    if (coupon) {
      formData.value = {
        code: coupon.code,
        discount: coupon.discount,
        usage_limit: coupon.usage_limit,
        expiry_date: coupon.expiry_date, // Asegúrate que coincida con tu API
        is_active: coupon.is_active === "1" || coupon.is_active === 1,
        description: coupon.description,
      };
    }
  } catch (error) {
    console.error("Error cargando cupón:", error);
    error.value = "No se pudo cargar el cupón";
  }
});

const handleSubmit = async (submitData) => {
  const id = Number(route.params.id);

  const payload = {
    ...submitData,
    id: id,
    is_active: submitData.is_active ? 1 : 0,
  };
  try {
    await couponStore.updateCoupon(payload);
    router.push({ name: "coupons" });
  } catch (error) {
    console.error("Error actualizando cupón:", error);
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-5 space-y-10">
    <div class="flex flex-col gap-2">
      <div class="space-y-0.5">
        <h2 class="text-4xl font-semibold">Actualizar Cupón</h2>
        <p class="text-gray-400">
          Llena el formulario para actualizar el cupón de descuento seleccionado
        </p>
      </div>
      <RouterLink
        :to="{ name: 'coupons' }"
        class="bg-experience-pink w-fit text-white px-4 py-2 rounded cursor-pointer shadow"
      >
        Regresar
      </RouterLink>
    </div>

    <div class="rounded-lg max-w-4xl mx-auto shadow bg-white p-10">
      <div class="max-w-2xl mx-auto">
        <FormKit
          type="form"
          @submit="handleSubmit"
          id="couponForm"
          :actions="false"
          incomplete-message="No se pudo enviar, revisa las notificaciones"
        >
          <FormKit
            type="text"
            label="Código del cupón"
            name="code"
            v-model="formData.code"
            placeholder="RHEXPERIENCE10"
            validation="required|length:3"
            :validation-messages="{ required: 'El código es obligatorio' }"
          />

          <FormKit
            type="number"
            label="Descuento (%)"
            name="discount"
            placeholder="20"
            v-model="formData.discount"
            validation="required|between:1,100|integer|numeric|positive"
            :validation-messages="{
              required: 'El descuento es obligatorio',
            }"
          />

          <FormKit
            type="text"
            label="Descripción"
            v-model="formData.description"
            name="description"
            placeholder="Para nuevos clientes"
            validation="required|length:3"
            :validation-messages="{
              required: 'La descripción es obligatoria',
            }"
          />

          <FormKit
            type="number"
            v-model="formData.usage_limit"
            label="Cantidad de uso"
            name="usage_limit"
            placeholder="20"
            validation="required|between:1,100|integer|numeric|positive"
            :validation-messages="{
              required: 'La cantidad de uso es obligatoria',
            }"
          />

          <FormKit
            type="date"
            label="Fecha de expiración"
            name="expiry_date"
            v-model="formData.expiry_date"
            validation="required|date"
            :validation-messages="{
              required: 'La fecha es obligatoria',
              date: 'Fecha no válida',
            }"
          />
          <FormKit
            type="checkbox"
            label="Activar cupón"
            name="is_active"
            v-model="formData.is_active"
          />

          <div class="mt-5">
            <FormKit type="submit">Actualizar cupón</FormKit>
          </div>
        </FormKit>
      </div>
    </div>
  </div>
</template>
