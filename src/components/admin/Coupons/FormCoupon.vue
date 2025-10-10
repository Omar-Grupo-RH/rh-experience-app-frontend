<script setup>
import { ref, watch, computed } from "vue";
import { useCouponStore } from "@/stores/couponStore";

const props = defineProps({
  mode: { type: String, default: "create" }, // "create" o "edit"
  coupon: { type: Object, default: null },
});

const emit = defineEmits(["close"]);

const store = useCouponStore();

// Datos reactivos del formulario
const form = ref({
  code: "",
  discount: "",
  description: "",
  usageLimit: "",
  expirationDate: "",
  isActive: false,
});

// Si es modo edición, carga los datos del cupón
watch(
  () => props.coupon,
  (val) => {
    if (props.mode === "edit" && val) {
      form.value = { ...val };
    }
  },
  { immediate: true }
);

// Computed para personalizar textos
const title = computed(() =>
  props.mode === "edit" ? "Editar cupón" : "Crear nuevo cupón"
);
const submitLabel = computed(() =>
  props.mode === "edit" ? "Guardar cambios" : "Crear cupón"
);

// Acción de envío
async function handleSubmit() {
  try {
    if (props.mode === "edit") {
      await store.updateCoupon(props.coupon.id, form.value);
    } else {
      await store.createCoupon(form.value);
    }
    emit("close");
  } catch (error) {
    console.error("Error al guardar cupón:", error);
  }
}
</script>

<template>
  <div
    class="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
  >
    <div class="bg-white rounded-lg shadow p-6 w-full max-w-lg">
      <h2 class="text-xl font-bold mb-4">{{ title }}</h2>

      <FormKit
        type="form"
        id="couponForm"
        :actions="false"
        :submit-label="submitLabel"
        incomplete-message="No se pudo enviar, revisa las notificaciones"
        @submit="handleSubmit"
      >
        <FormKit
          type="text"
          label="Código del cupón"
          name="code"
          v-model="form.code"
          placeholder="RHEXPERIENCE10"
          validation="required|length:3"
          :validation-messages="{ required: 'El código es obligatorio' }"
        />

        <FormKit
          type="number"
          label="Descuento (%)"
          name="discount"
          v-model="form.discount"
          placeholder="20"
          validation="required|between:1,100|integer|numeric|positive"
          :validation-messages="{
            required: 'El descuento es obligatorio',
          }"
        />

        <FormKit
          type="text"
          label="Descripción"
          name="description"
          v-model="form.description"
          placeholder="Para nuevos clientes"
          validation="required|length:3"
          :validation-messages="{
            required: 'La descripción es obligatoria',
          }"
        />

        <FormKit
          type="number"
          label="Cantidad de uso"
          name="usageLimit"
          v-model="form.usageLimit"
          placeholder="20"
          validation="required|between:1,100|integer|numeric|positive"
          :validation-messages="{
            required: 'La cantidad de uso es obligatoria',
          }"
        />

        <FormKit
          type="date"
          label="Fecha de expiración"
          name="expirationDate"
          v-model="form.expirationDate"
          validation="required|date"
          :validation-messages="{
            required: 'La fecha es obligatoria',
            date: 'Fecha no válida',
          }"
        />

        <div>
          <label for="isActive">Activar cupon</label>
          <input
            type="checkbox"
            id="isActive"
            v-model="form.isActive"
            class="ml-2"
          />
        </div>

        <div class="flex justify-between gap-3 mt-6">
          <button
            type="button"
            class="bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300"
            @click="$emit('close')"
          >
            Cancelar
          </button>

          <FormKit type="submit">{{ submitLabel }}</FormKit>
        </div>
      </FormKit>
    </div>
  </div>
</template>
