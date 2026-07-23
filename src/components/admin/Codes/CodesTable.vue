<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  codes: {
    type: Array,
    required: true,
  },
  getTypeLabel: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["edit-code", "delete-code"]);

const typeClasses = {
  department: "bg-blue-50 text-blue-700 ring-blue-100",
  alliance: "bg-violet-50 text-violet-700 ring-violet-100",
  discount: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  internal: "bg-yellow-50 text-yellow-700 ring-yellow-100",
};

const currentPage = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [10, 20, 50, 100];

const totalPages = computed(() => {
  return Math.ceil(props.codes.length / itemsPerPage.value) || 1;
});

const paginatedCodes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;

  return props.codes.slice(start, end);
});

const paginationStart = computed(() => {
  if (!props.codes.length) return 0;

  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, props.codes.length);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);

  if (current <= 2) {
    end = Math.min(total, 5);
  }

  if (current >= total - 1) {
    start = Math.max(1, total - 4);
  }

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  return pages;
});

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;

  currentPage.value = page;
};

const nextPage = () => {
  goToPage(currentPage.value + 1);
};

const prevPage = () => {
  goToPage(currentPage.value - 1);
};

watch(
  () => props.codes.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }

    if (currentPage.value < 1) {
      currentPage.value = 1;
    }
  },
);

watch(itemsPerPage, () => {
  currentPage.value = 1;
});
</script>

<template>
  <div class="w-full">
    <div
      v-if="!codes.length"
      class="flex min-h-[260px] flex-col items-center justify-center border rounded-2xl border-dashed border-slate-300 bg-slate-50  px-6 py-10 text-center"
    >
      <h3 class="text-lg font-bold text-slate-900">
        No hay códigos registrados
      </h3>
      <p class="mt-1 max-w-sm text-sm text-slate-500">
        Crea códigos para departamentos, alianzas o descuentos.
      </p>
    </div>

    <div
      v-else
      class="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:block"
    >
    <!-- Paginación -->
    <div
      v-if="codes.length"
      class="flex flex-col gap-4  px-4 py-4 shadow-sm xl:flex-row xl:items-center xl:justify-between"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p class="text-sm font-medium text-slate-500">
          Mostrando
          <span class="font-bold text-slate-900">{{ paginationStart }}</span>
          -
          <span class="font-bold text-slate-900">{{ paginationEnd }}</span>
          de
          <span class="font-bold text-slate-900">{{ codes.length }}</span>
          códigos
        </p>

        <div class="flex items-center gap-2">
          <label class="text-sm font-bold text-slate-500">
            Mostrar:
          </label>

          <select
            v-model.number="itemsPerPage"
            class="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 outline-none transition focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/10"
          >
            <option
              v-for="option in itemsPerPageOptions"
              :key="option"
              :value="option"
            >
              {{ option }}
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="totalPages > 1"
        class="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          Anterior
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          class="h-10 w-10 rounded-xl text-sm font-bold transition"
          :class="
            currentPage === page
              ? 'bg-experience-blue text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          "
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          Siguiente
        </button>
      </div>
    </div>
      <table class="w-full">
        <thead class="bg-slate-50">
          <tr class="border-b border-slate-200">
            <th
              class="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Nombre
            </th>
            <th
              class="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Código
            </th>
            <th
              class="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Tipo
            </th>
            <th
              class="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Acciones
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="code in paginatedCodes"
            :key="code.id"
            class="transition hover:bg-slate-50/80"
          >
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <div>
                  <p class="font-bold text-slate-900">
                    {{ code.name }}
                  </p>
                </div>
              </div>
            </td>

            <td class="px-5 py-4">
              <span
                class="inline-flex rounded-2xl bg-slate-100 px-3 py-1.5 font-mono text-sm font-bold text-slate-700 ring-1 ring-slate-200"
              >
                {{ code.code }}
              </span>
            </td>

            <td class="px-5 py-4">
              <span
                class="inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1"
                :class="
                  typeClasses[code.type] ||
                  'bg-slate-50 text-slate-600 ring-slate-100'
                "
              >
                {{ getTypeLabel(code.type) }}
              </span>
            </td>

            <td class="px-5 py-4">
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  class="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-experience-blue transition hover:bg-experience-blue/10"
                  @click="$emit('edit-code', code)"
                >
                  Editar
                </button>

                <button
                  type="button"
                  class="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                  @click="$emit('delete-code', code)"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="codes.length" class="grid gap-4 md:hidden">
      <article
        v-for="code in paginatedCodes"
        :key="code.id"
        class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="truncate text-base font-black text-slate-900">
              {{ code.name }}
            </h3>

            <p class="mt-1 font-mono text-sm font-bold text-slate-500">
              {{ code.code }}
            </p>
          </div>

          <span
            class="shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1"
            :class="
              typeClasses[code.type] ||
              'bg-slate-50 text-slate-600 ring-slate-100'
            "
          >
            {{ getTypeLabel(code.type) }}
          </span>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            class="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-experience-blue transition hover:bg-experience-blue/10"
            @click="$emit('edit-code', code)"
          >
            Editar
          </button>

          <button
            type="button"
            class="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
            @click="$emit('delete-code', code)"
          >
            Eliminar
          </button>
        </div>
      </article>
    </div>

    
  </div>
</template>