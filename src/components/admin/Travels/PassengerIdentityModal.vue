<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import Swal from "sweetalert2";
import IdentityAdminAPI from "@/api/IdentityAdminAPI";

const props = defineProps({
  passenger: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "updated"]);

const loading = ref(false);
const saving = ref(false);
const document = ref(null);
const frontUrl = ref("");
const backUrl = ref("");
const error = ref("");

const fullName = computed(() => {
  if (!props.passenger) return "";

  return [props.passenger.first_name, props.passenger.last_name]
    .filter(Boolean)
    .join(" ");
});

const statusLabel = computed(() => {
  switch (document.value?.verification_status) {
    case "verified":
      return "Verificado";
    case "rejected":
      return "Rechazado";
    default:
      return "Pendiente";
  }
});

const statusClasses = computed(() => {
  switch (document.value?.verification_status) {
    case "verified":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
});

function revokeImages() {
  if (frontUrl.value) URL.revokeObjectURL(frontUrl.value);
  if (backUrl.value) URL.revokeObjectURL(backUrl.value);

  frontUrl.value = "";
  backUrl.value = "";
}

let requestVersion = 0;

async function loadDocument() {
  const version = ++requestVersion;
  revokeImages();

  document.value = null;
  error.value = "";

  if (!props.passenger?.id) return;

  loading.value = true;

  try {
    const data = await IdentityAdminAPI.getDocument(props.passenger.id);

    if (version !== requestVersion) return;

    document.value = data;

    if (!data.has_identity) return;

    // Cargar imágenes autenticadas de forma individual.
    if (data.has_front) {
      const url = await IdentityAdminAPI.getImage(props.passenger.id, "front");

      if (version !== requestVersion) {
        URL.revokeObjectURL(url);
        return;
      }

      frontUrl.value = url;
    }

    if (data.has_back) {
      const url = await IdentityAdminAPI.getImage(props.passenger.id, "back");

      if (version !== requestVersion) {
        URL.revokeObjectURL(url);
        return;
      }

      backUrl.value = url;
    }
  } catch (err) {
    if (version !== requestVersion) return;

    error.value =
      err.response?.data?.message ||
      err.userMessage ||
      err.message ||
      "No se pudieron cargar los documentos.";
  } finally {
    if (version === requestVersion) {
      loading.value = false;
    }
  }
}

async function updateStatus(status) {
  if (!document.value?.has_identity || saving.value) return;

  const isVerify = status === "verified";

  const confirmation = await Swal.fire({
    title: isVerify
      ? "¿Verificar identificación?"
      : "¿Rechazar identificación?",
    text: isVerify
      ? "Confirma que revisaste ambos lados del INE."
      : "El INE quedará marcado como rechazado.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: isVerify ? "Sí, verificar" : "Sí, rechazar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: isVerify ? "#315fa8" : "#dc2626",
  });

  if (!confirmation.isConfirmed) return;

  saving.value = true;

  try {
    await IdentityAdminAPI.verify(props.passenger.id, status);

    document.value = {
      ...document.value,
      verification_status: status,
    };

    emit("updated", {
      passenger_id: props.passenger.id,
      verification_status: status,
    });

    await Swal.fire({
      icon: "success",
      title: isVerify ? "INE verificado" : "INE rechazado",
      timer: 1600,
      showConfirmButton: false,
    });
  } catch (err) {
    await Swal.fire(
      "Error",
      err.response?.data?.message || "No se pudo actualizar el estado.",
      "error",
    );
  } finally {
    saving.value = false;
  }
}

function close() {
  emit("close");
}

watch(
  () => props.passenger?.id,
  () => loadDocument(),
  { immediate: true },
);

onBeforeUnmount(() => {
  ++requestVersion;
  revokeImages();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="passenger"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 sm:p-6"
      role="presentation"
      @click.self="close"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="identity-modal-title"
        class="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header
          class="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6"
        >
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-widest text-slate-500"
            >
              Documentación de pasajero
            </p>

            <h2
              id="identity-modal-title"
              class="mt-1 text-xl font-bold text-slate-900"
            >
              {{ fullName }}
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              Asiento {{ passenger.seat_id || "—" }} ·
              {{ passenger.ticket_code || "Sin boleto" }}
            </p>
          </div>

          <button
            type="button"
            class="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar"
            @click="close"
          >
            ✕
          </button>
        </header>

        <main class="overflow-y-auto p-5 sm:p-6">
          <div v-if="loading" class="py-14 text-center text-slate-500">
            Cargando documentación...
          </div>

          <div
            v-else-if="error"
            class="rounded-xl bg-red-50 p-5 text-sm text-red-700"
            role="alert"
          >
            {{ error }}

            <button
              type="button"
              class="mt-3 block font-bold underline"
              @click="loadDocument"
            >
              Reintentar
            </button>
          </div>

          <div
            v-else-if="!document?.has_identity"
            class="rounded-xl bg-amber-50 p-8 text-center text-amber-800"
          >
            <h3 class="text-lg font-bold">No hay identificación registrada</h3>

            <p class="mt-2 text-sm">
              Este pasajero todavía no cuenta con un INE guardado en el sistema.
            </p>
          </div>

          <template v-else>
            <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
              <span
                class="rounded-full px-3 py-1 text-sm font-semibold"
                :class="statusClasses"
              >
                {{ statusLabel }}
              </span>

              <p class="text-xs text-slate-500">
                Registrado:
                {{ document.uploaded_at || "—" }}
              </p>
            </div>

            <div class="grid gap-5 md:grid-cols-2">
              <div>
                <h3 class="mb-3 text-sm font-bold text-slate-800">
                  INE — Frente
                </h3>

                <div
                  class="flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                >
                  <img
                    v-if="frontUrl"
                    :src="frontUrl"
                    alt="Frente de la identificación"
                    class="max-h-[420px] w-full object-contain"
                  />

                  <span v-else class="text-sm text-slate-500">
                    Imagen no disponible
                  </span>
                </div>
              </div>

              <div>
                <h3 class="mb-3 text-sm font-bold text-slate-800">
                  INE — Reverso
                </h3>

                <div
                  class="flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                >
                  <img
                    v-if="backUrl"
                    :src="backUrl"
                    alt="Reverso de la identificación"
                    class="max-h-[420px] w-full object-contain"
                  />

                  <span v-else class="text-sm text-slate-500">
                    Imagen no disponible
                  </span>
                </div>
              </div>
            </div>

            <div
              class="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p class="text-sm font-bold text-slate-800">Carta responsiva</p>

              <p class="mt-1 text-sm text-slate-500">
                Pendiente de integrar la plantilla y la firma electrónica.
              </p>
            </div>
          </template>
        </main>

        <footer
          class="flex flex-wrap justify-end gap-3 border-t border-slate-200 p-5"
        >
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            @click="close"
          >
            Cerrar
          </button>

          <template v-if="document?.has_identity && !loading">
            <button
              type="button"
              :disabled="saving || !!error"
              class="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              @click="updateStatus('rejected')"
            >
              Rechazar INE
            </button>

            <button
              type="button"
              :disabled="saving || !!error || !frontUrl || !backUrl"
              class="rounded-lg bg-experience-blue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              @click="updateStatus('verified')"
            >
              {{ saving ? "Guardando..." : "Verificar INE" }}
            </button>
          </template>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
