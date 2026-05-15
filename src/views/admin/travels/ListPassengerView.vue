<script setup>
import { formatDateToSpanish } from "@/utils/formatDate";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useTravelStore } from "@/stores/admin/travelStore";
import html2pdf from "html2pdf.js";

const route = useRoute();
const store = useTravelStore();

const expandedPassengerIds = ref([]);

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

const generatePDF = () => {
  const element = document.createElement("div");

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
        Pasajeros (${store.quantityPassengers})
      </h2>

      ${passengers.value
        .map((p) => {
          const allergies = parseJSON(p.allergies);
          return `
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-bottom: 14px;">
              <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">
                ${p.first_name || ""} ${p.last_name || ""}
              </h3>

              <p style="margin: 4px 0; font-size: 12px;"><strong>Asiento:</strong> ${p.seat_id || ""}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Email:</strong> ${p.email || ""}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Celular:</strong> ${p.phone || ""}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Fecha nacimiento:</strong> ${formatDateToSpanish(p.born_date)}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Alergias:</strong> ${allergies.length ? allergies.join(", ") : "Sin alergias"}</p>
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
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Origen:</strong> ${p.origin || "No registrado"}</p>
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
  <div class="mx-auto max-w-7xl space-y-8 p-5">
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
      class="space-y-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6"
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

      <div class="flex items-center justify-between">
        <h3 class="text-2xl font-semibold text-slate-900">
          Pasajeros
          <span class="font-medium text-experience-blue">
            ({{ store.quantityPassengers }})
          </span>
        </h3>
      </div>

      <div class="grid gap-4">
        <article
          v-for="p in passengers"
          :key="p.id"
          class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-experience-blue/20 hover:shadow-md"
        >
          <!-- Vista inicial -->
          <button
            type="button"
            class="flex w-full cursor-pointer flex-col gap-4 p-5 text-left transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between"
            @click="togglePassenger(p.id)"
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
              </div>
            </div>

            <div class="flex items-center gap-3 sm:justify-end">
              <span
                class="w-fit rounded-full bg-experience-blue/10 px-4 py-2 text-sm font-medium text-experience-blue ring-1 ring-experience-blue/10"
              >
                {{ getRegistrationTypeLabel(p.registration_type) }}
              </span>

              <span
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition"
                :class="isPassengerExpanded(p.id) ? 'rotate-180' : ''"
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
                  v-if="p.registration_type === 'prospect'"
                  class="rounded-lg bg-green-50 p-4 ring-1 ring-green-100"
                >
                  <p
                    class="text-xs font-medium uppercase tracking-wide text-green-500"
                  >
                    Costo
                  </p>
                  <p class="mt-1 text-sm font-semibold text-green-700">
                    +$800 MXN
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
