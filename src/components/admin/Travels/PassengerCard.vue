<script setup>
import { computed } from "vue";
import { formatDateToSpanish } from "@/utils/formatDate";

const props = defineProps({
  passenger: {
    type: Object,
    required: true,
  },
  adminLevel: {
    type: [String, Number],
    default: null,
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
  isMenuOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "toggle",
  "toggle-menu",
  "edit",
  "confirm-payment",
  "reschedule-passenger",
]);

const registrationTypeLabels = {
  internal: "Personal interno",
  alliance: "Alianza",
  prize: "Premio",
  investor: "Inversionista",
  prospect: "Cliente prospecto",
  family_friend: "Invitado extra, familiares o amigos",
};

const getRegistrationTypeLabel = (type) => {
  return registrationTypeLabels[type] || "Sin tipo";
};

const getRegistrationTypeColors = (type) => {
  const colors = {
    internal: "bg-blue-50 text-blue-700 ring-blue-100",
    alliance: "bg-pink-50 text-pink-700 ring-pink-100",
    prize: "bg-amber-50 text-amber-700 ring-amber-100",
    investor: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    prospect: "bg-lime-50 text-lime-700 ring-lime-100",
    family_friend: "bg-purple-50 text-purple-700 ring-purple-100",
  };

  return (
    colors[type] ||
    "bg-experience-blue/10 text-experience-blue ring-experience-blue/10"
  );
};

const parseJSON = (value) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const isRhevoDevelopment = (development) => {
  return (
    String(development || "")
      .trim()
      .toUpperCase() === "RHEVO"
  );
};

const getStageLabelByDevelopment = (development) => {
  return isRhevoDevelopment(development) ? "Fracción" : "Etapa";
};

const getLotLabelByDevelopment = (development) => {
  return isRhevoDevelopment(development) ? "Unidad" : "Lote";
};

const getOriginLabel = (origin) => {
  const origins = {
    directo_rh: "Grupo RH",
    alianza: "Alianza",
  };

  return origins[origin] || "No registrado";
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getFreeConditionByType = (type) => {
  const conditions = {
    internal: "Primera visita gratis",
    alliance: "Con código de alianza",
    investor: "Para cualquier proyecto",
    prize: "Boleto por premio / código RH Experience",
  };

  return conditions[type] || "No requiere pago";
};

const getPassengerCostInfo = (passenger) => {
  const type = passenger?.registration_type;
  const status = passenger?.payment_status;

  if (status === "free") {
    return {
      label: "Costo",
      amount: "Gratis",
      condition: getFreeConditionByType(type),
      tone: "green",
    };
  }

  if (type === "internal") {
    return {
      label: "Costo",
      amount: formatCurrency(500),
      condition: "Segunda visita en adelante",
      tone: status === "paid" ? "green" : "orange",
    };
  }

  if (type === "family_friend") {
    return {
      label: "Costo",
      amount: formatCurrency(500),
      condition:
        "Invitado extra del inversionista, familiares o amigos de Comunidad RH",
      tone: status === "paid" ? "green" : "orange",
    };
  }

  if (type === "prospect") {
    return {
      label: "Costo",
      amount: formatCurrency(1500),
      condition:
        "Si decide invertir, se sugiere aplicar este monto a su cuota de apertura",
      tone: status === "paid" ? "green" : "orange",
    };
  }

  if (type === "alliance") {
    return {
      label: "Costo",
      amount: "Gratis",
      condition: "Con código de alianza",
      tone: "green",
    };
  }

  if (type === "investor") {
    return {
      label: "Costo",
      amount: "Gratis",
      condition: "Para cualquier proyecto",
      tone: "green",
    };
  }

  if (type === "prize") {
    return {
      label: "Costo",
      amount: "Gratis",
      condition: "Boleto por premio / código RH Experience",
      tone: "green",
    };
  }

  return {
    label: "Costo",
    amount: "No registrado",
    condition: "Sin información de costo",
    tone: "slate",
  };
};

const costCardClasses = computed(() => {
  const tone = getPassengerCostInfo(props.passenger).tone;

  const classes = {
    green: "bg-green-50 ring-green-100 text-green-700",
    orange: "bg-orange-50 ring-orange-100 text-orange-700",
    slate: "bg-slate-50 ring-slate-100 text-slate-700",
  };

  return classes[tone] || classes.slate;
});

const costLabelClasses = computed(() => {
  const tone = getPassengerCostInfo(props.passenger).tone;

  const classes = {
    green: "text-green-500",
    orange: "text-orange-500",
    slate: "text-slate-400",
  };

  return classes[tone] || classes.slate;
});

const canConfirmPayment = computed(() => {
  return (
    (Number(props.adminLevel) === 1 || Number(props.adminLevel) === 3) &&
    (props.passenger.payment_status || "free") !== "free"
  );
});

const canShowOptions = computed(() => {
  return Number(props.adminLevel) === 1 || Number(props.adminLevel) === 2;
});

const allergies = computed(() => parseJSON(props.passenger.allergies));

const healthConditions = computed(() =>
  parseJSON(props.passenger.health_conditions),
);
</script>

<template>
  <article
    class="relative rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-experience-blue/20 hover:shadow-md"
  >
    <div
      class="flex w-full flex-col gap-4 p-5 text-left transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex min-w-0 items-center gap-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h3
              class="truncate text-xl font-semibold capitalize text-slate-900"
            >
              {{ passenger.first_name }} {{ passenger.last_name }}
            </h3>
            <span
              class="text-xs font-medium px-1.5 py-0.5 rounded-full"
              :class="getRegistrationTypeColors(passenger.registration_type)"
            >
              {{ getRegistrationTypeLabel(passenger.registration_type) }}
            </span>
          </div>

          <p class="mt-1 text-sm font-medium text-slate-500">
            Asiento {{ passenger.seat_id }}
          </p>

          <p class="mt-1 text-xs font-semibold text-slate-400">
            Código: {{ passenger.ticket_code || "Sin código" }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 sm:justify-end" @click.stop>
        <button
          v-if="canConfirmPayment"
          type="button"
          class="w-fit cursor-pointer rounded-lg px-4 py-2 text-sm font-medium ring-1 transition"
          :class="
            passenger.payment_status === 'paid'
              ? 'bg-experience-green/10 text-green-600 ring-experience-green/10 cursor-not-allowed'
              : 'bg-experience-pink/10 text-experience-pink ring-experience-pink/10 hover:bg-experience-pink/15'
          "
          :disabled="passenger.payment_status === 'paid'"
          @click.stop.prevent="emit('confirm-payment', passenger.id)"
        >
          {{
            passenger.payment_status === "paid" ? "Pagado" : "Confirmar pago"
          }}
        </button>

        <span
          v-if="passenger.payment_status === 'free'"
          class="w-fit rounded-lg bg-experience-green/10 px-4 py-2 text-sm font-medium text-green-600 ring-1 ring-experience-green/10"
        >
          Gratis
        </span>

        <button
          type="button"
          class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          :class="isExpanded ? 'rotate-180' : ''"
          @click.stop="emit('toggle', passenger.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div class="relative" v-if="canShowOptions">
          <button
            type="button"
            class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            :class="{
              'bg-experience-blue/10 text-experience-blue': isMenuOpen,
            }"
            aria-label="Abrir menú de acciones"
            @click.stop="emit('toggle-menu', passenger.id)"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-1"
          >
            <div
              v-if="isMenuOpen"
              class="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5"
              @click.stop
            >
              <button
                type="button"
                class="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                @click="emit('edit', passenger)"
              >
                Editar
              </button>
              <button
                type="button"
                class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm cursor-pointer text-slate-700 transition hover:bg-slate-50"
                @click="emit('reschedule-passenger', passenger)"
              >
                Reagendar
              </button>

              <!-- 
                    <button
                      type="button"
                      class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm cursor-pointer text-slate-700 transition hover:bg-slate-50"
                      @click="resendPassengerEmail(p)"
                    >
                      Reenviar correo
                    </button>

                    <button
                      type="button"
                      class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm cursor-pointer text-rose-600 transition hover:bg-rose-50"
                      @click="deletePassenger(p)"
                    >
                      Eliminar
                    </button> -->
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isExpanded" class="border-t border-slate-100 bg-white p-5">
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div class="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Email
            </p>
            <p class="mt-1 break-all text-sm font-medium text-slate-700">
              {{ passenger.email }}
            </p>
          </div>

          <div class="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Celular
            </p>
            <p class="mt-1 text-sm font-medium text-slate-700">
              {{
                passenger.phone_country_code
                  ? `(+${passenger.phone_country_code})`
                  : "(-)"
              }}
              {{ passenger.phone }}
            </p>
          </div>

          <div class="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Fecha nacimiento
            </p>
            <p class="mt-1 text-sm font-medium text-slate-700">
              {{ formatDateToSpanish(passenger.born_date) }}
            </p>
          </div>

          <div class="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Ciudad
            </p>
            <p class="mt-1 text-sm font-medium text-slate-700">
              {{ passenger.city || "No registrada" }}
            </p>
          </div>

          <div class="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Fecha compra
            </p>
            <p class="mt-1 text-sm font-medium text-slate-700">
              {{ formatDateToSpanish(passenger.created_at) }}
            </p>
          </div>

          <div
            class="col-span-2 rounded-lg p-4 ring-1"
            :class="costCardClasses"
          >
            <p
              class="text-xs font-medium uppercase tracking-wide"
              :class="costLabelClasses"
            >
              {{ getPassengerCostInfo(passenger).label }}
            </p>

            <p class="mt-1 text-base font-bold">
              {{ getPassengerCostInfo(passenger).amount }}
            </p>

            <p class="mt-1 text-xs font-medium opacity-80">
              {{ getPassengerCostInfo(passenger).condition }}
            </p>

            <p
              v-if="passenger.payment_status === 'paid'"
              class="mt-2 w-fit rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100"
            >
              Pago confirmado
            </p>

            <p
              v-else-if="passenger.payment_status === 'pending'"
              class="mt-2 w-fit rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100"
            >
              Pago pendiente
            </p>

            <p
              v-else-if="passenger.payment_status === 'free'"
              class="mt-2 w-fit rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100"
            >
              No requiere pago
            </p>
          </div>
        </div>

        <div class="mt-4 rounded-lg bg-red-50 p-4 ring-1 ring-red-100">
          <p class="text-xs font-medium uppercase tracking-wide text-red-500">
            Alergias
          </p>

          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="(allergy, i) in allergies"
              :key="i"
              class="rounded-full bg-white px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-100"
            >
              {{ allergy }}
            </span>

            <span
              v-if="allergies.length === 0"
              class="text-sm italic text-red-500"
            >
              Sin alergias
            </span>
          </div>
        </div>

        <div class="mt-4 rounded-lg bg-red-50 p-4 ring-1 ring-red-100">
          <p class="text-xs font-medium uppercase tracking-wide text-red-500">
            Condiciones de Salud
          </p>

          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="(condition, i) in healthConditions"
              :key="i"
              class="rounded-full bg-white px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-100"
            >
              {{ condition }}
            </span>

            <span
              v-if="healthConditions.length === 0"
              class="text-sm italic text-red-500"
            >
              Sin condiciones de salud
            </span>
          </div>
        </div>

        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div class="mb-4">
            <p
              class="text-xs font-medium uppercase tracking-[0.18em] text-experience-blue"
            >
              Datos de inscripción
            </p>

            <h4 class="mt-1 text-lg font-semibold text-slate-900">
              {{ getRegistrationTypeLabel(passenger.registration_type) }}
            </h4>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-if="passenger.registration_type === 'internal'"
              class="rounded-lg bg-white p-4 ring-1 ring-slate-100"
            >
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Código de área
              </p>
              <p class="mt-1 font-medium text-slate-800">
                {{ passenger.area_code || "No registrado" }}
              </p>
            </div>

            <template v-if="passenger.registration_type === 'alliance'">
              <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Alianza
                </p>
                <p class="mt-1 font-medium text-slate-800">
                  {{ passenger.alliance_name || "No registrada" }}
                </p>
              </div>

              <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Código alianza
                </p>
                <p class="mt-1 font-medium text-slate-800">
                  {{ passenger.alliance_code || "No registrado" }}
                </p>
              </div>
            </template>

            <div
              v-if="passenger.registration_type === 'prize'"
              class="rounded-lg bg-white p-4 ring-1 ring-slate-100"
            >
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Código premio
              </p>
              <p class="mt-1 font-medium text-slate-800">
                {{ passenger.prize_code || "No registrado" }}
              </p>
            </div>

            <template v-if="passenger.registration_type === 'investor'">
              <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Desarrollo
                </p>
                <p class="mt-1 font-medium text-slate-800">
                  {{ passenger.development || "No registrado" }}
                </p>
              </div>

              <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  {{ getStageLabelByDevelopment(passenger.development) }}
                </p>
                <p class="mt-1 font-medium text-slate-800">
                  {{ passenger.stage || "No registrada" }}
                </p>
              </div>

              <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  {{ getLotLabelByDevelopment(passenger.development) }}
                </p>
                <p class="mt-1 font-medium text-slate-800">
                  {{ passenger.lot_number || "No registrado" }}
                </p>
              </div>
            </template>

            <template v-if="passenger.registration_type === 'prospect'">
              <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Desarrollo
                </p>
                <p class="mt-1 font-medium text-slate-800">
                  {{ passenger.development || "No registrado" }}
                </p>
              </div>

              <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Asesor
                </p>
                <p class="mt-1 font-medium text-slate-800">
                  {{ passenger.advisor_name || "No registrado" }}
                </p>
              </div>

              <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Código asesor
                </p>
                <p class="mt-1 font-medium text-slate-800 uppercase">
                  {{ passenger.advisor_code || "No registrado" }}
                </p>
              </div>

              <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Origen
                </p>
                <p class="mt-1 font-medium text-slate-800">
                  {{ getOriginLabel(passenger.origin) }}
                </p>
              </div>

              <div
                v-if="passenger.origin === 'alianza'"
                class="rounded-lg bg-white p-4 ring-1 ring-slate-100"
              >
                <p
                  class="text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Alianza origen
                </p>
                <p class="mt-1 font-medium text-slate-800">
                  {{ passenger.origin_alliance_name || "No registrada" }}
                </p>
              </div>
            </template>

            <div
              v-if="!passenger.registration_type"
              class="rounded-lg bg-white p-4 ring-1 ring-slate-100"
            >
              <p class="text-sm font-medium text-slate-500">
                No hay datos de inscripción registrados para este pasajero.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </article>
</template>
