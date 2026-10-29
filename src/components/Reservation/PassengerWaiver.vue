<script setup>
import {
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
} from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";

const props = defineProps({
  passenger: { type: Object, required: true },
  index: { type: Number, required: true },
});

const store = useReservaStore();
const VERSION = "2026-10-29-v1";
const canvas = ref(null);
const accepted = ref(false);
const expanded = ref(true);
const hasDrawing = ref(false);
const error = ref("");
const WIDTH = 800;
const HEIGHT = 300;

let drawing = false;
let lastPoint = null;
let activePointerId = null;

const seat = computed(() => String(props.passenger.seat ?? ""));
const fullName = computed(() =>
  [props.passenger.first_name, props.passenger.last_name]
    .filter(Boolean)
    .join(" ")
    .trim(),
);
const phone = computed(() => {
  const code = String(props.passenger.phone_country_code || "52").replace(
    /\D/g,
    "",
  );
  const number = String(props.passenger.phone || "").replace(/\D/g, "");
  return `+${code} ${number}`;
});
const email = computed(() =>
  String(props.passenger.email || "")
    .trim()
    .toLowerCase(),
);
const todayForLetter = computed(() => {
  const parts = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Merida",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value || "";
  return `Mérida, Yucatán, a los ${get("day")} días del mes de ${get("month")} año ${get("year")}.`;
});
const documentFingerprint = computed(() =>
  store.getPassengerWaiverFingerprint(props.passenger),
);
const completed = computed(() =>
  store.isPassengerWaiverComplete(props.passenger),
);

function prepareCanvas() {
  if (!canvas.value) return;
  canvas.value.width = WIDTH;
  canvas.value.height = HEIGHT;
  const ctx = canvas.value.getContext("2d");
  if (!ctx) {
    error.value = "No se pudo iniciar el área de firma.";
    return;
  }
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = "#000000";
  ctx.fillStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function pointFromEvent(event) {
  if (!canvas.value) return null;
  const rect = canvas.value.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return {
    x: ((event.clientX - rect.left) / rect.width) * WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
  };
}

function startDrawing(event) {
  if (!accepted.value || !canvas.value || completed.value) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  const point = pointFromEvent(event);
  if (!point) return;
  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;
  event.preventDefault();
  drawing = true;
  activePointerId = event.pointerId;
  lastPoint = point;
  error.value = "";
  canvas.value.setPointerCapture?.(event.pointerId);
  ctx.beginPath();
  ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
  ctx.fill();
  hasDrawing.value = true;
  store.clearPassengerWaiver(seat.value);
}

function draw(event) {
  if (!drawing || activePointerId !== event.pointerId || !lastPoint) return;
  const point = pointFromEvent(event);
  if (!point || !canvas.value) return;
  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;
  event.preventDefault();
  ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  lastPoint = point;
}

function stopDrawing(event) {
  if (event && activePointerId !== null && event.pointerId !== activePointerId)
    return;
  drawing = false;
  lastPoint = null;
  activePointerId = null;
}

async function clearSignature() {
  stopDrawing();
  hasDrawing.value = false;
  error.value = "";
  store.clearPassengerWaiver(seat.value);
  await nextTick();
  prepareCanvas();
}

function handleAcceptance(value) {
  accepted.value = value;
  if (!value) clearSignature();
}

function saveSignature() {
  error.value = "";
  if (!accepted.value || !hasDrawing.value || !canvas.value) {
    error.value = "Lee y acepta la carta, y dibuja tu firma para continuar.";
    return;
  }
  if (
    !seat.value ||
    !fullName.value ||
    !email.value ||
    !String(props.passenger.phone || "").trim() ||
    !store.selectedTripId
  ) {
    error.value = "Faltan datos del pasajero. Regresa al paso anterior.";
    return;
  }
  const signature = canvas.value.toDataURL("image/png");
  store.setPassengerWaiver(seat.value, {
    version: VERSION,
    accepted: true,
    signature,
    fingerprint: documentFingerprint.value,
    signed_for: {
      trip_id: String(store.selectedTripId),
      seat: seat.value,
      full_name: fullName.value,
      email: email.value,
      phone: phone.value,
    },
  });
  if (!store.isPassengerWaiverComplete(props.passenger)) {
    error.value = "No se pudo validar la firma. Intenta nuevamente.";
    return;
  }
  expanded.value = false;
}

async function editSignature() {
  store.clearPassengerWaiver(seat.value);
  accepted.value = false;
  hasDrawing.value = false;
  error.value = "";
  expanded.value = true;
  await nextTick();
  prepareCanvas();
}

watch(documentFingerprint, async () => {
  accepted.value = false;
  hasDrawing.value = false;
  expanded.value = true;
  error.value = "";
  store.clearPassengerWaiver(seat.value);
  await nextTick();
  prepareCanvas();
});

watch(expanded, async (opened) => {
  if (opened && !completed.value) {
    await nextTick();
    prepareCanvas();
  }
});

onMounted(async () => {
  if (completed.value) {
    accepted.value = true;
    expanded.value = false;
  } else {
    accepted.value = false;
    expanded.value = true;
    await nextTick();
    prepareCanvas();
  }
});
onBeforeUnmount(() => stopDrawing());
</script>

<template>
  <article class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div
      class="flex items-center justify-between gap-3 border-b border-slate-100 p-5"
    >
      <div>
        <p class="text-xs font-semibold text-slate-500">
          Pasajero {{ index + 1 }} · Asiento {{ seat }}
        </p>

        <h3 class="mt-1 text-lg font-bold text-slate-900">
          Carta responsiva — {{ fullName }}
        </h3>
      </div>

      <span
        class="rounded-full px-3 py-1 text-xs font-semibold"
        :class="
          completed
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'
        "
      >
        {{ completed ? "Firmada" : "Pendiente" }}
      </span>
    </div>

    <div v-if="completed && !expanded" class="p-5">
      <p class="text-sm text-green-700">
        La responsiva fue aceptada y firmada. Se guardará como PDF al confirmar
        la reservación.
      </p>

      <button
        type="button"
        class="mt-3 text-sm font-bold text-experience-blue underline"
        @click="expanded = true"
      >
        Ver carta
      </button>

      <button
        type="button"
        class="ml-4 mt-3 text-sm font-semibold text-slate-600 underline"
        @click="editSignature"
      >
        Volver a firmar
      </button>
    </div>

    <div v-else class="space-y-5 p-5">
      <div
        class="max-h-80 space-y-4 overflow-y-auto rounded-xl border border-slate-200 p-4 text-sm leading-7 text-slate-700"
        tabindex="0"
        aria-label="Texto completo de la carta responsiva"
      >
        <p class="text-right">
          {{ todayForLetter }}
        </p>

        <div class="space-y-1.5 text-sm leading-relaxed">
          <p>
            Nombre completo:
            <span class="font-semibold text-slate-900">{{ fullName }}</span>
          </p>
          <p>
            Teléfono:
            <span class="font-semibold text-slate-900">{{ phone }}</span> &nbsp;
            Correo:
            <span class="font-semibold text-slate-900 break-all">{{
              email
            }}</span>
          </p>
          <p>
            Identificación oficial:
            <span class="font-semibold text-slate-900">INE</span>
          </p>
        </div>

        <p>
          Declaro que participo voluntariamente en las actividades de RH
          Experience y me comprometo a seguir en todo momento las indicaciones
          de seguridad y uso proporcionadas por el personal de Grupo RH.
        </p>

        <h4 class="font-bold text-slate-900">RESPONSABILIDAD POR DAÑOS</h4>

        <p>
          Me comprometo a utilizar responsablemente los vehículos RZR/Racer,
          mobiliario, instalaciones, accesorios y demás equipo utilizado durante
          la experiencia.
        </p>

        <p>
          Acepto que, si ocasiono algún daño por negligencia, uso indebido o
          incumplimiento de las indicaciones recibidas, deberé cubrir el costo
          comprobable de su reparación o, cuando corresponda, de su reposición.
        </p>

        <p>
          El daño será documentado mediante fotografías, video y/o reporte de
          incidencia. No serán responsabilidad del participante los desperfectos
          preexistentes, desgaste normal o fallas mecánicas que no hayan sido
          ocasionadas por su conducta.
        </p>

        <h4 class="font-bold text-slate-900">GARANTÍA Y COBRO</h4>

        <p>
          Cuando la actividad o equipo lo requiera, Grupo RH podrá solicitar
          previamente una garantía, informando al participante su monto y
          condiciones antes del inicio de la actividad.
        </p>

        <p>
          Si la experiencia concluye sin daños atribuibles al participante, la
          garantía será liberada o devuelta conforme al medio utilizado. En caso
          de daño comprobado, se aplicará el procedimiento previamente informado
          para cubrir el costo correspondiente.
        </p>

        <p>
          Si el daño supera el importe de la garantía, la diferencia será
          notificada al participante y deberá cubrirse mediante los medios
          oficiales de pago de Grupo RH.
        </p>

        <p>
          Autorizo recibir cualquier notificación relacionada con una incidencia
          a través del teléfono, WhatsApp y/o correo electrónico proporcionados
          en esta carta.
        </p>

        <p>
          Declaro haber leído y comprendido estas condiciones y acepto
          cumplirlas durante mi participación en RH Experience.
        </p>
      </div>

      <label class="flex cursor-pointer items-start gap-3 text-sm">
        <input
          :checked="accepted"
          type="checkbox"
          class="mt-1 h-4 w-4"
          @change="handleAcceptance($event.target.checked)"
        />

        <span>
          He leído y comprendido la carta responsiva y acepto sus condiciones.
          Soy el participante que firma.
        </span>
      </label>

      <div v-if="!completed">
        <div class="mb-2 flex items-center justify-between">
          <label class="text-sm font-bold">Firma del participante</label>

          <button
            type="button"
            class="text-xs font-semibold text-slate-600 underline"
            @click="clearSignature"
          >
            Limpiar firma
          </button>
        </div>

        <canvas
          ref="canvas"
          class="block h-36 w-full rounded-xl border-2 border-dashed border-slate-300 bg-transparent touch-none"
          :class="accepted ? 'cursor-crosshair' : 'opacity-40'"
          @pointerdown="startDrawing"
          @pointermove="draw"
          @pointerup="stopDrawing"
          @pointercancel="stopDrawing"
          @lostpointercapture="stopDrawing"
        />

        <p class="mt-2 text-xs text-slate-500">
          Firma usando tu dedo, mouse o lápiz digital.
        </p>
      </div>

      <p v-if="error" class="text-sm text-red-600" role="alert">
        {{ error }}
      </p>

      <button
        v-if="!completed"
        type="button"
        class="w-full rounded-xl bg-experience-blue px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!accepted || !hasDrawing"
        @click="saveSignature"
      >
        Guardar firma y aceptación
      </button>

      <button
        v-else
        type="button"
        class="text-sm font-semibold text-experience-blue underline"
        @click="expanded = false"
      >
        Cerrar lectura
      </button>
    </div>
  </article>
</template>
