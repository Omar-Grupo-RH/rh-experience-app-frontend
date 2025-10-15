<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const formData = ref({
  code: "",
  discount: "",
  usage_limit: "",
  expiry_limit: "",
  is_active: true,
  created_at: [],
  description: "",
});

const handleSubmit = async (formData) => {
  const submitData = {
    ...formData,
    is_active: formData.is_active ? 1 : 0,
  };

  console.log("Datos a enviar:", submitData);
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-5 space-y-10">
    <div class="flex flex-col gap-2">
      <div class="space-y-0.5">
        <h2 class="text-4xl font-semibold">Agregar Nuevo Cupon</h2>
        <p class="text-gray-400">
          Llena el formulario para agregar un nuevo cupon de descuento
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
            v-model="formData.expiry_limit"
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
            <FormKit type="submit">Agregar cupon</FormKit>
          </div>
        </FormKit>
      </div>
    </div>
  </div>
</template>

<style>
#isActive {
  accent-color: red !important;
}
</style>
