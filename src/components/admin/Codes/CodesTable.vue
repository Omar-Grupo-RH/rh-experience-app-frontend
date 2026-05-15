<script setup>
defineProps({
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
};
</script>

<template>
  <div class="w-full">
    <div
      v-if="!codes.length"
      class="flex min-h-[260px] flex-col items-center justify-center border-slate-300 bg-slate-50 px-6 py-10 text-center"
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
            v-for="code in codes"
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
        v-for="code in codes"
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
