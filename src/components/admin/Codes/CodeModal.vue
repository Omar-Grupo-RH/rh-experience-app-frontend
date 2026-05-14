<script setup>
import { computed } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  code: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  codeTypes: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["close", "submit"]);

const isEditing = computed(() => Boolean(props.code?.id));

const initialValues = computed(() => ({
  id: props.code?.id ?? null,
  type: props.code?.type ?? "",
  name: props.code?.name ?? "",
  code: props.code?.code ?? "",
}));

const handleSubmit = (formData) => {
  emit("submit", {
    ...formData,
    code: formData.code?.toUpperCase()?.trim(),
    name: formData.name?.trim(),
  });
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-xs"
        @click.self="$emit('close')"
      >
        <Transition
          appear
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="translate-y-4 scale-95 opacity-0"
          enter-to-class="translate-y-0 scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 scale-100 opacity-100"
          leave-to-class="translate-y-4 scale-95 opacity-0"
        >
          <div
            class="w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-slate-200"
          >
            <div
              class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5"
            >
              <div>
                <p
                  class="text-sm font-semibold uppercase tracking-[0.18em] text-experience-blue"
                >
                  Gestión de códigos
                </p>
                <h3 class="mt-1 text-2xl font-black text-slate-900">
                  {{ isEditing ? "Editar código" : "Crear código" }}
                </h3>
                <p class="mt-1 text-sm text-slate-500">
                  Completa la información para administrar el acceso.
                </p>
              </div>

              <button
                type="button"
                class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                @click="$emit('close')"
              >
                ✕
              </button>
            </div>

            <div class="px-6 py-6">
              <FormKit
                :key="initialValues.id || 'create-code'"
                type="form"
                :value="initialValues"
                :actions="false"
                :classes="{
                    message:'hidden'
                  }"
                @submit="handleSubmit"
              >
                <FormKit
                  type="select"
                  name="type"
                  label="Tipo de código"
                  placeholder="Selecciona un tipo"
                  validation="required"
                  :validation-messages="{
                    required: 'El tipo de código es obligatorio.',
                  }"
                  :options="[
                    { label: 'Selecciona un tipo', value: '' },
                    ...codeTypes,
                  ]"
                />

                <FormKit
                  type="text"
                  name="name"
                  label="Nombre"
                  placeholder="Ej. Marketing, Broker RH, Promo Mayo"
                  validation="required|length:3,120"
                  :validation-messages="{
                    required: 'El nombre es obligatorio.',
                    length: 'El nombre debe tener entre 3 y 120 caracteres.',
                  }"
                />

                <FormKit
                  type="text"
                  name="code"
                  label="Código"
                  placeholder="Ej. MKT, BRH001, MAYO10"
                  validation="required|matches:/^[A-Za-z0-9_-]+$/|length:2,80"
                  :validation-messages="{
                    required: 'El código es obligatorio.',
                    matches:
                      'Solo puedes usar letras, números, guiones y guion bajo.',
                    length: 'El código debe tener entre 2 y 80 caracteres.',
                  }"
                  help="El código se guardará automáticamente en mayúsculas."
                  :classes="{
                    help: 'text-xs text-slate-500',
                  }"
                />

                <div
                  class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
                >
                  <button
                    type="button"
                    class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    @click="$emit('close')"
                  >
                    Cancelar
                  </button>

                  <FormKit
                    type="submit"
                    :disabled="loading"
                    :classes="{
                      input:
                        'inline-flex w-full sm:w-auto cursor-pointer items-center justify-center rounded-lg bg-experience-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-experience-blue/90 disabled:cursor-not-allowed disabled:opacity-60',
                    }"
                  >
                    {{
                      loading
                        ? "Guardando..."
                        : isEditing
                          ? "Guardar cambios"
                          : "Crear código"
                    }}
                  </FormKit>
                </div>
              </FormKit>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
