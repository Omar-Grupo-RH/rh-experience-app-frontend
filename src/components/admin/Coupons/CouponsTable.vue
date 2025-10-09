<script setup>
import { ref, reactive, computed } from "vue";
import Swal from "sweetalert2";

// ====== Datos iniciales ======
const initialCoupons = [
  {
    id: "1",
    code: "VERANO2024",
    discount: 20,
    isActive: true,
    expirationDate: "2024-08-31",
    usageCount: 45,
    usageLimit: 100,
    description: "Descuento de verano",
  },
  {
    id: "2",
    code: "PRIMERAVEZ",
    discount: 15,
    isActive: true,
    expirationDate: "2024-12-31",
    usageCount: 128,
    usageLimit: 500,
    description: "Para nuevos clientes",
  },
  {
    id: "3",
    code: "GRUPOGRANDE",
    discount: 25,
    isActive: false,
    expirationDate: "2024-10-15",
    usageCount: 12,
    usageLimit: 50,
    description: "Grupos de 10+ personas",
  },
];

// ====== Estado ======
const coupons = ref([...initialCoupons]);
const isDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const editingCoupon = ref(null);
const deletingCouponId = ref(null);
const copiedId = ref(null);

const formData = reactive({
  code: "",
  discount: "",
  expirationDate: "",
  usageLimit: "",
  description: "",
  isActive: true,
});

// ====== Computados ======
const activeCount = computed(
  () => coupons.value.filter((c) => c.isActive).length
);

// ====== Funciones ======
function openAddModal() {
  editingCoupon.value = null;
  Object.assign(formData, {
    code: "",
    discount: "",
    expirationDate: "",
    usageLimit: "",
    description: "",
    isActive: true,
  });
  isDialogOpen.value = true;
}

function openEditModal(coupon) {
  editingCoupon.value = coupon;
  Object.assign(formData, {
    code: coupon.code,
    discount: coupon.discount,
    expirationDate: coupon.expirationDate,
    usageLimit: coupon.usageLimit,
    description: coupon.description,
    isActive: coupon.isActive,
  });
  isDialogOpen.value = true;
}

function handleSubmit() {
  if (editingCoupon.value) {
    // Editar existente
    const index = coupons.value.findIndex(
      (c) => c.id === editingCoupon.value.id
    );
    if (index !== -1) {
      coupons.value[index] = {
        ...editingCoupon.value,
        code: formData.code.toUpperCase(),
        discount: Number(formData.discount),
        expirationDate: formData.expirationDate,
        usageLimit: Number(formData.usageLimit),
        description: formData.description,
        isActive: formData.isActive,
      };
    }
  } else {
    // Crear nuevo
    coupons.value.push({
      id: Date.now().toString(),
      code: formData.code.toUpperCase(),
      discount: Number(formData.discount),
      expirationDate: formData.expirationDate,
      usageLimit: Number(formData.usageLimit),
      description: formData.description,
      isActive: formData.isActive,
      usageCount: 0,
    });
  }
  isDialogOpen.value = false;
}

function toggleStatus(id) {
  const c = coupons.value.find((x) => x.id === id);
  if (c) c.isActive = !c.isActive;
}

function handleCopy(code, id) {
  navigator.clipboard.writeText(code);
  copiedId.value = id;
  setTimeout(() => (copiedId.value = null), 2000);
}

function handleDelete(id) {
  deletingCouponId.value = id;
  Swal.fire({
    title: "¿Eliminar cupón?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  }).then((r) => {
    if (r.isConfirmed) {
      coupons.value = coupons.value.filter((c) => c.id !== id);
      Swal.fire("Eliminado", "El cupón ha sido eliminado.", "success");
    }
  });
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <div class="mb-8 flex items-center justify-end">
      <button
        @click="openAddModal"
        class="flex items-center gap-2 rounded-md bg-experience-pink px-4 py-2 text-white cursor-pointer"
      >
        <span class="text-lg">＋</span> Crear Cupón
      </button>
    </div>

    <div>
      <div class="border-b p-4">
        <h2 class="text-lg font-semibold">Cupones de Descuento</h2>
        <p class="text-sm text-gray-500">
          {{ activeCount }} activos • {{ coupons.length }} totales
        </p>
      </div>

      <div class="divide-y">
        <div
          v-for="coupon in coupons"
          :key="coupon.id"
          class="flex items-center justify-between gap-4 p-4 hover:bg-gray-50"
        >
          <div class="flex flex-1 items-center gap-4">
            <input
              type="checkbox"
              v-model="coupon.isActive"
              @change="toggleStatus(coupon.id)"
            />
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <code
                  class="rounded bg-blue-50 px-2 py-1 font-mono text-sm font-bold text-blue-600"
                >
                  {{ coupon.code }}
                </code>
                <span
                  :class="[
                    'text-xs rounded px-2 py-1 font-semibold',
                    coupon.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-500',
                  ]"
                >
                  {{ coupon.isActive ? "Activo" : "Inactivo" }}
                </span>
                <div
                  class="flex items-center gap-1 font-semibold text-blue-600"
                >
                  {{ coupon.discount }}%
                </div>
              </div>
              <p class="mt-1 text-sm text-gray-500">{{ coupon.description }}</p>
              <div class="mt-2 flex gap-4 text-xs text-gray-400">
                <span>
                  Vence:
                  {{
                    new Date(coupon.expirationDate).toLocaleDateString(
                      "es-ES",
                      { dateStyle: "medium" }
                    )
                  }}
                </span>
                <span
                  >Usos: {{ coupon.usageCount }}/{{ coupon.usageLimit }}</span
                >
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="handleCopy(coupon.code, coupon.id)"
              class="rounded p-1.5 text-gray-500 hover:bg-gray-100"
            >
              <span v-if="copiedId === coupon.id">✅</span>
              <span v-else>📋</span>
            </button>
            <button
              @click="openEditModal(coupon)"
              class="rounded p-1.5 text-gray-500 hover:bg-gray-100"
            >
              ✏️
            </button>
            <button
              @click="handleDelete(coupon.id)"
              class="rounded p-1.5 text-red-500 hover:bg-red-100"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal crear/editar -->
    <div
      v-if="isDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 class="text-lg font-semibold mb-1">
          {{ editingCoupon ? "Editar Cupón" : "Crear Cupón" }}
        </h2>
        <p class="text-sm text-gray-500 mb-4">
          {{
            editingCoupon
              ? "Actualiza los datos"
              : "Completa los datos del nuevo cupón"
          }}
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Código</label>
            <input
              v-model="formData.code"
              class="w-full rounded border p-2 uppercase"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Descuento (%)</label>
            <input
              v-model="formData.discount"
              type="number"
              min="1"
              max="100"
              class="w-full rounded border p-2"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Descripción</label>
            <input
              v-model="formData.description"
              class="w-full rounded border p-2"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1"
              >Fecha de Vencimiento</label
            >
            <input
              v-model="formData.expirationDate"
              type="date"
              class="w-full rounded border p-2"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Límite de Uso</label>
            <input
              v-model="formData.usageLimit"
              type="number"
              min="1"
              class="w-full rounded border p-2"
              required
            />
          </div>

          <div class="flex items-center justify-between border rounded p-3">
            <div>
              <p class="font-medium text-sm">Estado del cupón</p>
              <p class="text-xs text-gray-500">Activar o desactivar</p>
            </div>
            <input type="checkbox" v-model="formData.isActive" />
          </div>

          <div class="flex justify-end gap-2 pt-3">
            <button
              type="button"
              @click="isDialogOpen = false"
              class="rounded border px-4 py-2 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {{ editingCoupon ? "Guardar cambios" : "Crear" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
