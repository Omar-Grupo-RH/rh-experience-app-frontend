<script setup>
import { formatDateToSpanish } from "@/utils/formatDate";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useTravelStore } from "@/stores/admin/travelStore";
import html2pdf from "html2pdf.js";
import { useAuth } from "@/composables/useAuth";

const { adminLevel } = useAuth();

const route = useRoute();
const store = useTravelStore();

const expandedPassengerIds = ref([]);
const ticketSearch = ref("");

onMounted(async () => {
  try {
    await store.getPassengersByTravel(Number(route.params.id));
  } catch (error) {
    console.log(error);
  }
});

const registrationTypeLabels = {
  internal: "Personal interno",
  alliance: "Alianza",
  prize: "Premio",
  investor: "Inversionista",
  prospect: "Cliente prospecto",
  family_friend: "Familiares y Amigos",
};

const getRegistrationTypeLabel = (type) => {
  return registrationTypeLabels[type] || "Sin tipo";
};

const parseJSON = (allergies) => {
  try {
    const parsed = JSON.parse(allergies || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const passengers = computed(() => store.passengersByTravelArray || []);

const normalizeTicketCode = (value = "") => {
  return String(value)
    .replace(/^RH-/i, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .trim();
};

const handleTicketSearchInput = (event) => {
  ticketSearch.value = normalizeTicketCode(event.target.value);
};

const clearTicketSearch = () => {
  ticketSearch.value = "";
};

const filteredPassengers = computed(() => {
  const search = normalizeTicketCode(ticketSearch.value);

  if (!search) return passengers.value;

  return passengers.value.filter((passenger) => {
    const ticketCode = normalizeTicketCode(passenger.ticket_code || "");

    return ticketCode.includes(search);
  });
});

const displayedPassengersCount = computed(() => filteredPassengers.value.length);

const isPassengerExpanded = (id) => {
  return expandedPassengerIds.value.includes(id);
};

const togglePassenger = (id) => {
  if (expandedPassengerIds.value.includes(id)) {
    expandedPassengerIds.value = expandedPassengerIds.value.filter(
      (item) => item !== id,
    );
    return;
  }

  expandedPassengerIds.value.push(id);
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

const getFreeConditionByType = (type) => {
  const conditions = {
    internal: "Primera visita gratis",
    alliance: "Con código de alianza",
    investor: "Para cualquier proyecto",
    prize: "Boleto por premio / código RH Experience",
  };

  return conditions[type] || "No requiere pago";
};

const getCostCardClasses = (passenger) => {
  const tone = getPassengerCostInfo(passenger).tone;

  const classes = {
    green: "bg-green-50 ring-green-100 text-green-700",
    orange: "bg-orange-50 ring-orange-100 text-orange-700",
    slate: "bg-slate-50 ring-slate-100 text-slate-700",
  };

  return classes[tone] || classes.slate;
};

const getCostLabelClasses = (passenger) => {
  const tone = getPassengerCostInfo(passenger).tone;

  const classes = {
    green: "text-green-500",
    orange: "text-orange-500",
    slate: "text-slate-400",
  };

  return classes[tone] || classes.slate;
};

const generatePDF = () => {
  const element = document.createElement("div");
  const passengersToExport = filteredPassengers.value;

  element.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: #1e40af; font-size: 24px; font-weight: 600; margin-bottom: 10px;">RH EXPERIENCE</h1>
      <p style="color: #666; font-size: 13px; margin-bottom: 20px;">
        Fecha de salida: ${formatDateToSpanish(
          store.travelSelected?.trip_date ||
            store.travelSelected?.[0]?.trip_date ||
            "",
        )}
      </p>

      <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">
        Pasajeros (${passengersToExport.length})
      </h2>

      ${
        ticketSearch.value
          ? `<p style="color: #d94a93; font-size: 12px; margin-bottom: 15px;"><strong>Filtro:</strong> RH-${ticketSearch.value}</p>`
          : ""
      }

      ${passengersToExport
        .map((p) => {
          const allergies = parseJSON(p.allergies);
          const healthConditions = parseJSON(p.health_conditions);

          return `
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-bottom: 14px;">
              <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">
                ${p.first_name || ""} ${p.last_name || ""}
              </h3>

              <p style="margin: 4px 0; font-size: 12px;"><strong>Código boleto:</strong> ${p.ticket_code || "Sin código"}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Estado de pago:</strong> ${p.payment_status || ""}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Asiento:</strong> ${p.seat_id || ""}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Email:</strong> ${p.email || ""}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Celular:</strong> ${p.phone || ""}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Fecha nacimiento:</strong> ${formatDateToSpanish(p.born_date)}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Alergias:</strong> ${allergies.length ? allergies.join(", ") : "Sin alergias"}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Condiciones de salud:</strong> ${healthConditions.length ? healthConditions.join(", ") : "Sin problemas de salud"}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Fecha compra:</strong> ${formatDateToSpanish(p.created_at)}</p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

              <p style="margin: 4px 0; font-size: 12px;"><strong>Tipo inscripción:</strong> ${getRegistrationTypeLabel(p.registration_type)}</p>

              ${
                p.registration_type === "internal"
                  ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Código de área:</strong> ${p.area_code || "No registrado"}</p>`
                  : ""
              }

              ${
                p.registration_type === "alliance"
                  ? `
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Alianza:</strong> ${p.alliance_name || "No registrada"}</p>
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Código alianza:</strong> ${p.alliance_code || "No registrado"}</p>
                  `
                  : ""
              }

              ${
                p.registration_type === "prize"
                  ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Código premio:</strong> ${p.prize_code || "No registrado"}</p>`
                  : ""
              }

              ${
                p.registration_type === "investor"
                  ? `
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Desarrollo:</strong> ${p.development || "No registrado"}</p>
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Etapa:</strong> ${p.stage || "No registrada"}</p>
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Lote:</strong> ${p.lot_number || "No registrado"}</p>
                  `
                  : ""
              }

              ${
                p.registration_type === "prospect"
                  ? `
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Desarrollo:</strong> ${p.development || "No registrado"}</p>
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Asesor:</strong> ${p.advisor_name || "No registrado"}</p>
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Código asesor:</strong> ${p.advisor_code || "No registrado"}</p>
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Origen:</strong> ${getOriginLabel(p.origin)}</p>
                    ${
                      p.origin === "alianza"
                        ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Alianza origen:</strong> ${p.origin_alliance_name || "No registrada"}</p>`
                        : ""
                    }
                  `
                  : ""
              }
            </div>
          `;
        })
        .join("")}
    </div>
  `;

  const options = {
    margin: 1,
    filename: `lista-pasajeros-${formatDateToSpanish(
      store.travelSelected?.trip_date || store.travelSelected?.[0]?.trip_date,
    )}.pdf`,
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    },
    jsPDF: {
      unit: "cm",
      format: "a4",
      orientation: "portrait",
    },
  };

  html2pdf().set(options).from(element).save();
};
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-8 lg:p-5">
    <div
      class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div class="space-y-1">
        <h2 class="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Listado de pasajeros
        </h2>

        <p class="text-sm font-normal text-slate-500 sm:text-base">
          Administra la información de pasajeros por RH Experience.
        </p>
      </div>

      <RouterLink
        :to="{ name: 'travels' }"
        class="inline-flex gap-2 w-fit items-center justify-center rounded-lg bg-experience-blue px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-experience-blue/90 hover:shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Regresar
      </RouterLink>
    </div>

    <div
      v-if="store.hasPassengersByTravel"
      class="space-y-6 rounded-xl bg-white p-4 sm:p-6"
    >
      <div class="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-100">
        <div
          class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h2 class="text-3xl font-semibold text-experience-pink sm:text-4xl">
              RH EXPERIENCE
            </h2>

            <p class="mt-3 text-sm font-normal text-slate-500">
              Fecha de salida
            </p>

            <p class="text-lg font-medium text-slate-800">
              {{
                formatDateToSpanish(
                  store.travelSelected?.trip_date ||
                    store.travelSelected?.[0]?.trip_date ||
                    "",
                )
              }}
            </p>

            <button
              class="inline-flex mt-3 cursor-pointer items-center justify-center rounded-lg bg-experience-pink px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
              type="button"
              @click="generatePDF"
            >
              📥 Descargar PDF
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-2xl font-semibold text-slate-900">
            Pasajeros
            <span class="font-medium text-experience-blue">
              ({{ displayedPassengersCount }})
            </span>
          </h3>

          <p
            v-if="ticketSearch"
            class="mt-1 text-sm font-medium text-slate-400"
          >
            Filtrando por código:
            <span class="text-experience-pink">RH-{{ ticketSearch }}</span>
          </p>
        </div>

        <div class="flex w-full items-center gap-2 sm:w-auto">
          <label
            class="relative block w-full sm:w-80"
            aria-label="Buscar por código de boleto"
          >
            <span
              class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                  d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                />
              </svg>
            </span>

            <span
              class="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-sm font-black text-experience-blue"
            >
              RH-
            </span>

            <input
              :value="ticketSearch"
              type="search"
              inputmode="text"
              autocomplete="off"
              placeholder="B95FFAE8"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-20 pr-4 text-sm font-bold uppercase text-slate-700 outline-none transition placeholder:font-medium placeholder:text-slate-300 focus:border-experience-pink focus:bg-white focus:ring-2 focus:ring-experience-pink/10"
              @input="handleTicketSearchInput"
            />
          </label>

          <button
            v-if="ticketSearch"
            type="button"
            class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            @click="clearTicketSearch"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div class="grid gap-4">
        <div
          v-if="!filteredPassengers.length"
          class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"
        >
          <p class="font-semibold text-slate-900">
            No se encontró ningún pasajero con ese código.
          </p>

          <p class="mt-1 text-sm text-slate-500">
            Revisa que el código sea correcto. Ejemplo:
            <span class="font-bold text-experience-pink">RH-B95FFAE8</span>
          </p>
        </div>

        <article
          v-for="p in filteredPassengers"
          :key="p.id"
          class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-experience-blue/20 hover:shadow-md"
        >
          <!-- Vista inicial -->
          <button
            type="button"
            class="flex w-full flex-col gap-4 p-5 text-left transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex min-w-0 items-center gap-4">
              <div class="min-w-0">
                <h3
                  class="truncate text-xl font-semibold capitalize text-slate-900"
                >
                  {{ p.first_name }} {{ p.last_name }}
                </h3>

                <p class="mt-1 text-sm font-medium text-slate-500">
                  Asiento {{ p.seat_id }}
                </p>

                <p class="mt-1 text-xs font-semibold text-slate-400">
                  Código: {{ p.ticket_code || "Sin código" }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 sm:justify-end">
              <span
                class="w-fit rounded-full bg-experience-blue/10 px-4 py-2 text-sm font-medium text-experience-blue ring-1 ring-experience-blue/10"
              >
                {{ getRegistrationTypeLabel(p.registration_type) }}
              </span>

              <button
                v-if="
                  (Number(adminLevel) === 1 || Number(adminLevel) === 3) &&
                  (p.payment_status || 'free') !== 'free'
                "
                type="button"
                class="w-fit cursor-pointer rounded-full px-4 py-2 text-sm font-medium ring-1 transition"
                :class="
                  p.payment_status === 'paid'
                    ? 'bg-green-50 text-green-700 ring-green-100'
                    : 'bg-experience-pink/10 text-experience-pink ring-experience-pink/10 hover:bg-experience-pink/15'
                "
                :disabled="p.payment_status === 'paid'"
                @click.stop.prevent="store.tooglePayment(p.id)"
              >
                {{ p.payment_status === "paid" ? "Pagado" : "Confirmar pago" }}
              </button>

              <span
                v-if="p.payment_status === 'free'"
                class="w-fit rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700 ring-1 ring-green-100"
              >
                Gratis
              </span>

              <span
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition cursor-pointer"
                :class="isPassengerExpanded(p.id) ? 'rotate-180' : ''"
                @click="togglePassenger(p.id)"
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
              </span>
            </div>
          </button>

          <!-- Dropdown -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div
              v-if="isPassengerExpanded(p.id)"
              class="border-t border-slate-100 bg-white p-5"
            >
              <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div class="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p
                    class="text-xs font-medium uppercase tracking-wide text-slate-400"
                  >
                    Email
                  </p>
                  <p class="mt-1 break-all text-sm font-medium text-slate-700">
                    {{ p.email }}
                  </p>
                </div>

                <div class="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p
                    class="text-xs font-medium uppercase tracking-wide text-slate-400"
                  >
                    Celular
                  </p>
                  <p class="mt-1 text-sm font-medium text-slate-700">
                    {{ p.phone }}
                  </p>
                </div>

                <div class="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p
                    class="text-xs font-medium uppercase tracking-wide text-slate-400"
                  >
                    Fecha nacimiento
                  </p>
                  <p class="mt-1 text-sm font-medium text-slate-700">
                    {{ formatDateToSpanish(p.born_date) }}
                  </p>
                </div>

                <div class="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p
                    class="text-xs font-medium uppercase tracking-wide text-slate-400"
                  >
                    Fecha compra
                  </p>
                  <p class="mt-1 text-sm font-medium text-slate-700">
                    {{ formatDateToSpanish(p.created_at) }}
                  </p>
                </div>

                <div
                  class="rounded-lg p-4 ring-1"
                  :class="getCostCardClasses(p)"
                >
                  <p
                    class="text-xs font-medium uppercase tracking-wide"
                    :class="getCostLabelClasses(p)"
                  >
                    {{ getPassengerCostInfo(p).label }}
                  </p>

                  <p class="mt-1 text-base font-bold">
                    {{ getPassengerCostInfo(p).amount }}
                  </p>

                  <p class="mt-1 text-xs font-medium opacity-80">
                    {{ getPassengerCostInfo(p).condition }}
                  </p>

                  <p
                    v-if="p.payment_status === 'paid'"
                    class="mt-2 w-fit rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100"
                  >
                    Pago confirmado
                  </p>

                  <p
                    v-else-if="p.payment_status === 'pending'"
                    class="mt-2 w-fit rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100"
                  >
                    Pago pendiente
                  </p>

                  <p
                    v-else-if="p.payment_status === 'free'"
                    class="mt-2 w-fit rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100"
                  >
                    No requiere pago
                  </p>
                </div>
              </div>

              <div class="mt-4 rounded-lg bg-red-50 p-4 ring-1 ring-red-100">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-red-500"
                >
                  Alergias
                </p>

                <div class="mt-2 flex flex-wrap gap-2">
                  <span
                    v-for="(allergy, i) in parseJSON(p.allergies)"
                    :key="i"
                    class="rounded-full bg-white px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-100"
                  >
                    {{ allergy }}
                  </span>

                  <span
                    v-if="parseJSON(p.allergies).length === 0"
                    class="text-sm italic text-red-500"
                  >
                    Sin alergias
                  </span>
                </div>
              </div>

              <div class="mt-4 rounded-lg bg-red-50 p-4 ring-1 ring-red-100">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-red-500"
                >
                  Condiciones de Salud
                </p>

                <div class="mt-2 flex flex-wrap gap-2">
                  <span
                    v-for="(condition, i) in parseJSON(p.health_conditions)"
                    :key="i"
                    class="rounded-full bg-white px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-100"
                  >
                    {{ condition }}
                  </span>

                  <span
                    v-if="parseJSON(p.health_conditions).length === 0"
                    class="text-sm italic text-red-500"
                  >
                    Sin condiciones de salud
                  </span>
                </div>
              </div>

              <div
                class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div class="mb-4">
                  <p
                    class="text-xs font-medium uppercase tracking-[0.18em] text-experience-blue"
                  >
                    Datos de inscripción
                  </p>

                  <h4 class="mt-1 text-lg font-semibold text-slate-900">
                    {{ getRegistrationTypeLabel(p.registration_type) }}
                  </h4>
                </div>

                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div
                    v-if="p.registration_type === 'internal'"
                    class="rounded-lg bg-white p-4 ring-1 ring-slate-100"
                  >
                    <p
                      class="text-xs font-medium uppercase tracking-wide text-slate-400"
                    >
                      Código de área
                    </p>
                    <p class="mt-1 font-medium text-slate-800">
                      {{ p.area_code || "No registrado" }}
                    </p>
                  </div>

                  <template v-if="p.registration_type === 'alliance'">
                    <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                      <p
                        class="text-xs font-medium uppercase tracking-wide text-slate-400"
                      >
                        Alianza
                      </p>
                      <p class="mt-1 font-medium text-slate-800">
                        {{ p.alliance_name || "No registrada" }}
                      </p>
                    </div>

                    <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                      <p
                        class="text-xs font-medium uppercase tracking-wide text-slate-400"
                      >
                        Código alianza
                      </p>
                      <p class="mt-1 font-medium text-slate-800">
                        {{ p.alliance_code || "No registrado" }}
                      </p>
                    </div>
                  </template>

                  <div
                    v-if="p.registration_type === 'prize'"
                    class="rounded-lg bg-white p-4 ring-1 ring-slate-100"
                  >
                    <p
                      class="text-xs font-medium uppercase tracking-wide text-slate-400"
                    >
                      Código premio
                    </p>
                    <p class="mt-1 font-medium text-slate-800">
                      {{ p.prize_code || "No registrado" }}
                    </p>
                  </div>

                  <template v-if="p.registration_type === 'investor'">
                    <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                      <p
                        class="text-xs font-medium uppercase tracking-wide text-slate-400"
                      >
                        Desarrollo
                      </p>
                      <p class="mt-1 font-medium text-slate-800">
                        {{ p.development || "No registrado" }}
                      </p>
                    </div>

                    <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                      <p
                        class="text-xs font-medium uppercase tracking-wide text-slate-400"
                      >
                        Etapa
                      </p>
                      <p class="mt-1 font-medium text-slate-800">
                        {{ p.stage || "No registrada" }}
                      </p>
                    </div>

                    <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                      <p
                        class="text-xs font-medium uppercase tracking-wide text-slate-400"
                      >
                        Lote
                      </p>
                      <p class="mt-1 font-medium text-slate-800">
                        {{ p.lot_number || "No registrado" }}
                      </p>
                    </div>
                  </template>

                  <template v-if="p.registration_type === 'prospect'">
                    <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                      <p
                        class="text-xs font-medium uppercase tracking-wide text-slate-400"
                      >
                        Desarrollo
                      </p>
                      <p class="mt-1 font-medium text-slate-800">
                        {{ p.development || "No registrado" }}
                      </p>
                    </div>

                    <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                      <p
                        class="text-xs font-medium uppercase tracking-wide text-slate-400"
                      >
                        Asesor
                      </p>
                      <p class="mt-1 font-medium text-slate-800">
                        {{ p.advisor_name || "No registrado" }}
                      </p>
                    </div>

                    <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                      <p
                        class="text-xs font-medium uppercase tracking-wide text-slate-400"
                      >
                        Código asesor
                      </p>
                      <p class="mt-1 font-medium text-slate-800 uppercase">
                        {{ p.advisor_code || "No registrado" }}
                      </p>
                    </div>

                    <div class="rounded-lg bg-white p-4 ring-1 ring-slate-100">
                      <p
                        class="text-xs font-medium uppercase tracking-wide text-slate-400"
                      >
                        Origen
                      </p>
                      <p class="mt-1 font-medium text-slate-800">
                        {{ getOriginLabel(p.origin) }}
                      </p>
                    </div>

                    <div
                      v-if="p.origin === 'alianza'"
                      class="rounded-lg bg-white p-4 ring-1 ring-slate-100"
                    >
                      <p
                        class="text-xs font-medium uppercase tracking-wide text-slate-400"
                      >
                        Alianza origen
                      </p>
                      <p class="mt-1 font-medium text-slate-800">
                        {{ p.origin_alliance_name || "No registrada" }}
                      </p>
                    </div>
                  </template>

                  <div
                    v-if="!p.registration_type"
                    class="rounded-lg bg-white p-4 ring-1 ring-slate-100"
                  >
                    <p class="text-sm font-medium text-slate-500">
                      No hay datos de inscripción registrados para este
                      pasajero.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </article>
      </div>
    </div>

    <div
      v-else
      class="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"
    >
      <p class="font-normal text-slate-500">
        No hay pasajeros registrados para este RH EXPERIENCE.
      </p>
    </div>
  </div>
</template>