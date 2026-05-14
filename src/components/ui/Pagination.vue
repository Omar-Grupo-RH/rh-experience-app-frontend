<script setup>
import { computed } from "vue";

const props = defineProps({
  pagination: {
    type: Object,
    required: true,
    default: () => ({
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1,
      from: 0,
      to: 0,
    }),
  },

  perPageOptions: {
    type: Array,
    default: () => [5, 10, 15, 25, 50],
  },

  showPerPage: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["page-change", "per-page-change"]);

const currentPage = computed(() => Number(props.pagination.current_page || 1));
const lastPage = computed(() => Number(props.pagination.last_page || 1));
const total = computed(() => Number(props.pagination.total || 0));

const canGoPrev = computed(() => currentPage.value > 1);
const canGoNext = computed(() => currentPage.value < lastPage.value);

const pages = computed(() => {
  const current = currentPage.value;
  const last = lastPage.value;
  const delta = 2;

  const start = Math.max(1, current - delta);
  const end = Math.min(last, current + delta);

  const range = [];

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  return range;
});

const goToPage = (page) => {
  const pageNumber = Number(page);

  if (pageNumber < 1) return;
  if (pageNumber > lastPage.value) return;
  if (pageNumber === currentPage.value) return;

  emit("page-change", pageNumber);
};

const handlePerPageChange = (event) => {
  emit("per-page-change", Number(event.target.value));
};
</script>

<template>
  <div
    v-if="total > 0"
    class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
  >
    <!-- Info -->
    <div class="text-sm text-slate-500">
      Mostrando
      <span class="font-bold text-slate-900">
        {{ pagination.from }}
      </span>
      -
      <span class="font-bold text-slate-900">
        {{ pagination.to }}
      </span>
      de
      <span class="font-bold text-slate-900">
        {{ pagination.total }}
      </span>
      registros
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <!-- Per page -->
      <div
        v-if="showPerPage"
        class="flex items-center gap-2"
      >
        <label class="text-sm font-medium text-slate-500">
          Mostrar
        </label>

        <select
          :value="pagination.per_page"
          @change="handlePerPageChange"
          class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
        >
          <option
            v-for="option in perPageOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          :disabled="!canGoPrev"
          @click="goToPage(currentPage - 1)"
          class="inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Ant.
        </button>

        <button
          v-if="!pages.includes(1)"
          type="button"
          @click="goToPage(1)"
          class="hidden h-10 min-w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
        >
          1
        </button>

        <span
          v-if="pages[0] > 2"
          class="hidden px-2 text-sm font-bold text-slate-400 sm:inline"
        >
          ...
        </span>

        <button
          v-for="page in pages"
          :key="page"
          type="button"
          @click="goToPage(page)"
          class="inline-flex h-10 min-w-10 items-center justify-center rounded-2xl px-3 text-sm font-bold transition"
          :class="
            page === currentPage
              ? 'bg-experience-blue text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          "
        >
          {{ page }}
        </button>

        <span
          v-if="pages[pages.length - 1] < lastPage - 1"
          class="hidden px-2 text-sm font-bold text-slate-400 sm:inline"
        >
          ...
        </span>

        <button
          v-if="!pages.includes(lastPage) && lastPage > 1"
          type="button"
          @click="goToPage(lastPage)"
          class="hidden h-10 min-w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
        >
          {{ lastPage }}
        </button>

        <button
          type="button"
          :disabled="!canGoNext"
          @click="goToPage(currentPage + 1)"
          class="inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sig.
        </button>
      </div>
    </div>
  </div>
</template>