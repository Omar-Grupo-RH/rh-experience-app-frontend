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

const replacementFront = ref(null);
const replacementBack = ref(null);
const replacing = ref(false);

const canReview = computed(
  () =>
    document.value?.verification_status === "pending" &&
    document.value?.has_identity &&
    Boolean(frontUrl.value) &&
    Boolean(backUrl.value),
);

const canUploadReplacement = computed(
  () =>
    document.value?.verification_status === "rejected" &&
    document.value?.can_replace === true,
);

function validateReplacementFile(file) {
  if (!(file instanceof File)) return false;

  return (
    ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
    file.size > 0 &&
    file.size <= 8 * 1024 * 1024
  );
}

function selectReplacement(event, side) {
  const file = event.target.files?.[0] || null;

  if (file && !validateReplacementFile(file)) {
    Swal.fire(
      "Archivo inválido",
      "Selecciona una imagen JPG, PNG o WebP de máximo 8 MB.",
      "warning",
    );

    if (side === "front") replacementFront.value = null;
    else replacementBack.value = null;

    event.target.value = "";
    return;
  }

  if (side === "front") replacementFront.value = file;
  else replacementBack.value = file;

  event.target.value = "";
}

async function uploadReplacement() {
  if (
    !canUploadReplacement.value ||
    !validateReplacementFile(replacementFront.value) ||
    !validateReplacementFile(replacementBack.value) ||
    replacing.value
  ) {
    await Swal.fire(
      "Documentos incompletos",
      "Selecciona imágenes válidas del frente y reverso.",
      "warning",
    );
    return;
  }

  const confirmation = await Swal.fire({
    title: "¿Registrar nuevo INE?",
    text: "Las nuevas imágenes quedarán pendientes de verificación.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Subir imágenes",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#315fa8",
  });

  if (!confirmation.isConfirmed) return;

  replacing.value = true;

  try {
    await IdentityAdminAPI.replace(
      props.passenger.id,
      replacementFront.value,
      replacementBack.value,
    );

    replacementFront.value = null;
    replacementBack.value = null;

    await loadDocument();

    emit("updated", {
      passenger_id: props.passenger.id,
      verification_status: "pending",
    });

    await Swal.fire({
      icon: "success",
      title: "INE actualizado",
      text: "Las nuevas imágenes quedaron pendientes de revisión.",
    });
  } catch (err) {
    await Swal.fire(
      "Error",
      err.response?.data?.message ||
        "No se pudieron subir las nuevas imágenes.",
      "error",
    );
  } finally {
    replacing.value = false;
  }
}

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
  if (!canReview.value || saving.value) return;

  const isVerify = status === "verified";

  const confirmation = await Swal.fire({
    title: isVerify
      ? "¿Verificar identificación?"
      : "¿Rechazar identificación?",
    text: isVerify
      ? "Una vez verificado, el INE quedará bloqueado."
      : "Se retirarán ambas fotografías y se notificará al pasajero por correo.",
    icon: isVerify ? "question" : "warning",
    showCancelButton: true,
    confirmButtonText: isVerify ? "Sí, verificar" : "Sí, rechazar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: isVerify ? "#315fa8" : "#dc2626",
  });

  if (!confirmation.isConfirmed) return;

  saving.value = true;

  try {
    const result = await IdentityAdminAPI.verify(props.passenger.id, status);

    await loadDocument();

    emit("updated", {
      passenger_id: props.passenger.id,
      verification_status: status,
    });

    if (!isVerify && !result.data?.email_sent) {
      await Swal.fire({
        icon: "warning",
        title: "INE rechazado",
        text:
          "El rechazo quedó registrado, pero el correo no pudo enviarse. " +
          (result.data?.email_error || ""),
      });
    } else {
      await Swal.fire({
        icon: "success",
        title: isVerify ? "INE verificado" : "INE rechazado",
        text: isVerify
          ? "La identificación quedó verificada."
          : "El pasajero fue notificado por correo.",
      });
    }
  } catch (err) {
    await loadDocument();

    await Swal.fire(
      "Error",
      err.response?.data?.message || "No se pudo actualizar el estado del INE.",
      "error",
    );
  } finally {
    saving.value = false;
  }
}

const downloadingWaiver = ref(false);

async function downloadWaiver() {
  if (!props.passenger?.id || downloadingWaiver.value) return;

  downloadingWaiver.value = true;

  try {
    const pdf = await IdentityAdminAPI.getWaiverPdf(props.passenger.id);

    const url = URL.createObjectURL(pdf);
    const link = document.createElement("a");

    link.href = url;
    link.download = `responsiva-pasajero-${props.passenger.id}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (err) {
    await Swal.fire(
      "Responsiva no disponible",
      "Este pasajero todavía no tiene una carta firmada o no se pudo recuperar.",
      "warning",
    );
  } finally {
    downloadingWaiver.value = false;
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

          <!-- Identificación rechazada: nueva carga -->
          <div v-else-if="canUploadReplacement" class="space-y-5">
            <div class="rounded-xl border border-red-200 bg-red-50 p-5">
              <h3 class="font-bold text-red-700">Identificación rechazada</h3>

              <p class="mt-2 text-sm text-red-600">
                Las imágenes anteriores fueron retiradas del expediente. Puedes
                registrar nuevas fotografías del frente y reverso del INE de
                este pasajero.
              </p>
            </div>

            <div class="grid gap-5 md:grid-cols-2">
              <div
                v-for="side in ['front', 'back']"
                :key="side"
                class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5"
              >
                <h4 class="mb-3 text-sm font-bold text-slate-800">
                  INE —
                  {{ side === "front" ? "Frente" : "Reverso" }}
                </h4>

                <label
                  class="flex cursor-pointer flex-col items-center gap-3 rounded-lg bg-white p-6 text-center ring-1 ring-slate-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-10 w-10 text-experience-blue"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 16V4m-5 5 5-5 5 5" />
                    <path d="M4 16v4h16v-4" />
                  </svg>

                  <span class="text-sm font-semibold text-experience-blue">
                    Seleccionar imagen
                  </span>

                  <span class="text-xs text-slate-500">
                    JPG, PNG o WebP · Máximo 8 MB
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    class="sr-only"
                    @change="selectReplacement($event, side)"
                  />
                </label>

                <p
                  v-if="side === 'front' ? replacementFront : replacementBack"
                  class="mt-3 break-all text-xs font-medium text-green-700"
                >
                  {{
                    side === "front"
                      ? replacementFront?.name
                      : replacementBack?.name
                  }}
                </p>
              </div>
            </div>

            <button
              type="button"
              :disabled="replacing || !replacementFront || !replacementBack"
              class="w-full rounded-xl bg-experience-blue px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              @click="uploadReplacement"
            >
              {{
                replacing
                  ? "Subiendo identificaciones..."
                  : "Guardar nuevas imágenes del INE"
              }}
            </button>

            <p class="text-center text-xs text-slate-500">
              Las nuevas fotografías deberán verificarse nuevamente antes de
              considerarse aprobadas.
            </p>
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
              class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 class="text-sm font-bold text-slate-800">
                    Carta responsiva firmada
                  </h3>

                  <p class="mt-1 text-xs text-slate-500">
                    Documento individual asociado a este pasajero.
                  </p>
                </div>

                <button
                  type="button"
                  :disabled="downloadingWaiver"
                  class="rounded-lg bg-experience-blue px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  @click="downloadWaiver"
                >
                  {{
                    downloadingWaiver
                      ? "Descargando..."
                      : "Descargar responsiva PDF"
                  }}
                </button>
              </div>
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

          <!-- Acciones disponibles solo si está pendiente -->
          <template v-if="canReview && !loading">
            <button
              type="button"
              :disabled="saving"
              class="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              @click="updateStatus('rejected')"
            >
              Rechazar INE
            </button>

            <button
              type="button"
              :disabled="saving"
              class="rounded-lg bg-experience-blue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              @click="updateStatus('verified')"
            >
              {{ saving ? "Guardando..." : "Verificar INE" }}
            </button>
          </template>

          <!-- Verificado: sin acciones de modificación -->
          <span
            v-else-if="document?.verification_status === 'verified'"
            class="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>

            INE verificado
          </span>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
