<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";

const props = defineProps({
  passenger: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["change"]);

const store = useReservaStore();

const MAX_SIZE = 8 * 1024 * 1024;

const front = computed(
  () => store.getPassengerDocuments(props.passenger.seat).front,
);
const back = computed(
  () => store.getPassengerDocuments(props.passenger.seat).back,
);

// Previews reconstruidas desde el store para conservarlas al regresar al paso
const frontPreview = ref(front.value ? URL.createObjectURL(front.value) : "");
const backPreview = ref(back.value ? URL.createObjectURL(back.value) : "");
const errors = ref({});

const fullName = computed(() =>
  [props.passenger.first_name, props.passenger.last_name]
    .filter(Boolean)
    .join(" "),
);

const complete = computed(() => Boolean(front.value && back.value));

function revokePreview(type) {
  const current = type === "front" ? frontPreview.value : backPreview.value;

  if (current) URL.revokeObjectURL(current);
}

function validateFile(file) {
  if (!file) return "Selecciona una imagen.";

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "Solo se permiten JPG, PNG o WebP.";
  }

  if (file.size > MAX_SIZE) {
    return "La imagen no puede superar 8 MB.";
  }

  return "";
}

function notifyParent() {
  emit("change", {
    front: front.value,
    back: back.value,
    complete: complete.value,
  });
}

function selectFile(event, type) {
  const file = event.target.files?.[0];

  const error = validateFile(file);

  if (error) {
    errors.value[type] = error;
    event.target.value = "";
    return;
  }

  errors.value[type] = "";

  revokePreview(type);

  const preview = URL.createObjectURL(file);

  store.setPassengerDocument(props.passenger.seat, type, file);

  if (type === "front") {
    frontPreview.value = preview;
  } else {
    backPreview.value = preview;
  }

  notifyParent();
}

function removeFile(type) {
  revokePreview(type);

  store.setPassengerDocument(props.passenger.seat, type, null);

  if (type === "front") {
    frontPreview.value = "";
  } else {
    backPreview.value = "";
  }

  notifyParent();
}

onBeforeUnmount(() => {
  revokePreview("front");
  revokePreview("back");
});
</script>

<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="mb-5">
      <p class="text-sm font-medium text-slate-500">Pasajero {{ index + 1 }}</p>

      <h3 class="text-xl font-bold text-slate-900">
        {{ fullName || "Sin nombre" }}
      </h3>

      <p class="mt-1 text-sm text-slate-500">Asiento {{ passenger.seat }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div v-for="side in ['front', 'back']" :key="side" class="space-y-2">
        <p class="text-sm font-semibold text-slate-700">
          INE —
          {{ side === "front" ? "Frente" : "Reverso" }}
        </p>

        <div
          class="relative flex min-h-44 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50"
        >
          <template v-if="side === 'front' ? frontPreview : backPreview">
            <img
              :src="side === 'front' ? frontPreview : backPreview"
              alt="Vista previa de identificación"
              class="h-44 w-full object-contain"
            />

            <button
              type="button"
              class="my-3 cursor-pointer text-sm font-semibold text-red-600"
              @click="removeFile(side)"
            >
              Eliminar imagen
            </button>
          </template>

          <template v-else>
            <label
              class="flex cursor-pointer flex-col items-center gap-2 p-6 text-center"
            >
              <span class="text-3xl">+</span>

              <span class="text-sm font-semibold text-experience-blue">
                Seleccionar imagen
              </span>

              <span class="text-xs text-slate-500">
                JPG, PNG o WebP · Máximo 8 MB
              </span>

              <input
                type="file"
                class="sr-only"
                accept="image/jpeg,image/png,image/webp"
                @change="selectFile($event, side)"
              />
            </label>
          </template>
        </div>

        <p
          v-if="errors[side]"
          class="text-xs font-medium text-red-600"
          role="alert"
        >
          {{ errors[side] }}
        </p>
      </div>
    </div>

    <p
      class="mt-5 text-sm font-medium"
      :class="complete ? 'text-green-700' : 'text-amber-700'"
    >
      {{
        complete
          ? "Ambos lados del INE están seleccionados."
          : "Debes proporcionar ambos lados del INE."
      }}
    </p>
  </article>
</template>
