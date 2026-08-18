<script setup>
import { ref, inject, onMounted, watch } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import { formatDateToSpanish } from "@/utils/formatDate";
import PassengersItem from "@/components/Reservation/PassengersItem.vue";
import ReservationAPI, {
  clearReservationIdempotencyKey,
} from "@/api/ReservationAPI";

const store = useReservaStore();
const toast = inject("toast");

const loading = ref(false);

function buildRegistrationPayload(store) {
  const data = store.registrationData;

  const base = {
    registration_type: store.registrationType,
  };

  if (store.registrationType === "internal") {
    return {
      ...base,
      area_code: data.area_code,
    };
  }

  if (store.registrationType === "alliance") {
    return {
      ...base,
      alliance_name: data.alliance_name,
      alliance_code: data.alliance_code,
    };
  }

  if (store.registrationType === "prize") {
    return {
      ...base,
      prize_code: data.prize_code,
    };
  }

  if (store.registrationType === "investor") {
    return {
      ...base,
      development: data.development,
      stage: data.stage,
      lot_number: data.lot_number,
    };
  }

  if (store.registrationType === "prospect") {
    const payload = {
      ...base,
      development: data.development,
      advisor_name: data.advisor_name,
      advisor_code: data.advisor_code,
      origin: data.origin,
    };

    if (data.origin === "alianza") {
      payload.origin_alliance_name = data.origin_alliance_name;
    }

    return payload;
  }

  if (store.registrationType === "family_friend") {
    return {
      ...base,
    };
  }

  return base;
}

function buildPayload() {
  return {
    trip_data: {
      date: store.date,
      trip_id: store.selectedTripId,
      seats: store.selectedSeats,
      tickets_email: store.passengers[0]?.email,
      tickets_name: store.passengers[0]?.first_name || "Cliente",
    },

    RegistrationType: buildRegistrationPayload(store),

    payment_summary: {
      requires_payment: store.requiresPayment,
      paid_tickets_count: store.paidTicketsCount,
      free_tickets_count: store.freeTicketsCount,
      price_per_ticket: store.registrationPricePerPerson,
      total_amount: store.registrationTotal,
    },

    passengers: store.passengers.map((p) => ({
      seat_id: p.seat,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      phone_country_code: p.phone_country_code,
      phone: p.phone,
      city: p.city,
      born_date: p.born_date,
      allergies: p.allergies,
      health_conditions: p.health_conditions,
    })),
  };
}

async function verifyInternalPassengerEmail() {
  if (store.registrationType !== "internal") return;

  const email = store.passengers[0]?.email;

  if (!email) return;

  await store.verifyEmailRegister(email);
}

async function startCheckout() {
  if (!store.canPay) {
    toast?.open?.({
      message: "Debes aceptar términos y condiciones.",
      type: "error",
    });
    return;
  }

  if (!store.canContinuePassengers) {
    toast?.open?.({
      message: "Revisa los datos de pasajeros.",
      type: "error",
    });
    return;
  }

  const payload = buildPayload();

  try {
    loading.value = true;

    const { data } = await ReservationAPI.reserveTrip(payload);

    if (!data.success) {
      clearReservationIdempotencyKey();

      toast?.open?.({
        message: data.message || "No se pudo completar la reservación.",
        type: "error",
      });

      return;
    }

    clearReservationIdempotencyKey();

    toast?.open?.({
      message: data.message || "Reservación completada exitosamente.",
      type: "success",
    });

    store.reset();
  } catch (error) {
    const status = error.response?.status;

    if ([400, 409, 422].includes(status)) {
      clearReservationIdempotencyKey();
    }

    toast?.open?.({
      message:
        error.userMessage ||
        error.response?.data?.message ||
        "Ocurrió un error al procesar tu solicitud.",
      type: "error",
    });
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await verifyInternalPassengerEmail();
});

watch(
  () => store.passengers[0]?.email,
  async () => {
    await verifyInternalPassengerEmail();
  },
);
</script>

<template>
  <div class="max-w-3xl mx-auto relative px-4 sm:px-0">
    <div
      class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div class="px-6 pt-5 sm:px-8">
        <h3
          class="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3"
        >
          <svg
            class="w-6 h-6 text-experience-blue"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>

          Confirmar Reservación
        </h3>

        <p class="text-sm text-gray-500 font-light mt-1 ml-9">
          Revisa los detalles antes de finalizar tu reserva.
        </p>
      </div>

      <div class="p-3 sm:p-8">
        <div
          class="grid grid-cols-1 md:grid-cols-2 mb-8 bg-gray-50 border border-gray-100 rounded-xl"
        >
          <div class="flex items-start gap-3 p-4">
            <div class="bg-experience-blue/20 p-2 rounded-lg shadow-sm">
              <svg
                class="w-5 h-5 text-experience-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>

            <div>
              <p
                class="text-[11px] text-gray-500 font-light uppercase tracking-wider"
              >
                Fecha Seleccionada
              </p>

              <p class="text-sm md:text-base text-gray-800">
                {{ formatDateToSpanish(store.date) }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-4 rounded-xl">
            <div class="bg-experience-blue/20 p-2 rounded-lg shadow-sm">
              <svg
                class="w-5 h-5 text-experience-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>

            <div>
              <p
                class="text-[11px] text-gray-500 font-light uppercase tracking-wider"
              >
                Punto de Encuentro
              </p>

              <p class="text-sm md:text-base text-gray-800">Oficinas de Grupo RH</p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-4 rounded-xl">
            <div class="bg-experience-blue/20 p-2 rounded-lg shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5 text-experience-blue"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>

            <div>
              <p
                class="text-[11px] text-gray-500 font-light uppercase tracking-wider"
              >
                Hora de salida
              </p>

              <p class="text-sm md:text-base text-gray-800">9:00 AM</p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-4 rounded-xl">
            <div class="bg-experience-blue/20 p-2 rounded-lg shadow-sm">
              <svg
                class="w-4 h-4 text-experience-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
            </div>

            <div>
              <p
                class="text-[11px] text-gray-500 font-light uppercase tracking-wider"
              >
                Los boletos serán enviados a
              </p>

              <p class="text-sm md:text-base text-gray-800">
                {{ store.passengers[0]?.email }}
              </p>
            </div>
          </div>
        </div>

        <div class="mb-8">
          <div class="space-y-4">
            <PassengersItem
              v-for="(p, index) in store.passengers"
              :key="index"
              :p="p"
              :index="index"
            />
          </div>
        </div>

        <div
          v-if="
            store.registrationType === 'internal' &&
            store.emailVerificationLoading
          "
          class="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <p class="text-sm font-semibold text-slate-700">
            Verificando si ya has tomado un RH Experience previamente...
          </p>
        </div>

        <div
          v-if="
            store.registrationType === 'internal' &&
            store.emailVerification?.exists
          "
          class="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4"
        >
          <p class="text-sm font-semibold text-blue-800">
            ¡Hola! Nos da mucho gusto que quieras vivir nuevamente la
            experiencia. Hemos verificado que ya participaste anteriormente en
            un RH Experience, por lo que para este segundo viaje se aplicará una
            cuota de recuperación de $500 MXN.
          </p>
        </div>

        <div
          v-if="
            store.registrationType === 'investor' && store.registrationTotal > 0
          "
          class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <p class="text-sm font-semibold text-amber-900">
            Tu registro como inversionista incluye 1 boleto sin costo. El
            acompañante extra tiene una cuota de recuperación de $500 MXN.
          </p>
        </div>

        <div
          v-if="store.registrationType === 'prospect'"
          class="mb-5 rounded-xl border border-purple-200 bg-purple-50 p-4"
        >
          <p class="text-sm font-semibold text-purple-900">
            Para clientes prospectos se aplicará una cuota de recuperación de
            $1,500 MXN por boleto.
          </p>
        </div>

        <div
          v-if="store.registrationType === 'family_friend'"
          class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <p class="text-sm font-semibold text-amber-900">
            Para familiares y amigos se aplicará una cuota de recuperación de
            $500 MXN por boleto.
          </p>
        </div>

        <div
          v-if="store.registrationTotal > 0"
          class="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p
                class="text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Resumen de pago
              </p>

              <p class="mt-1 text-sm font-semibold text-slate-700">
                Se generará una ficha de pago junto con tu reservación.
              </p>
            </div>

            <div
              class="rounded-xl bg-white px-4 py-3 text-right ring-1 ring-slate-200"
            >
              <p
                class="text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Total a pagar
              </p>

              <p class="text-2xl font-black text-slate-900">
                ${{ store.registrationTotal.toLocaleString("es-MX") }} MXN
              </p>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <p
                class="text-[11px] font-bold uppercase tracking-wide text-slate-500"
              >
                Boletos gratis
              </p>

              <p class="mt-1 text-lg font-black text-emerald-700">
                {{ store.freeTicketsCount }}
              </p>
            </div>

            <div class="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <p
                class="text-[11px] font-bold uppercase tracking-wide text-slate-500"
              >
                Boletos con costo
              </p>

              <p class="mt-1 text-lg font-black text-amber-700">
                {{ store.paidTicketsCount }}
              </p>
            </div>

            <div class="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <p
                class="text-[11px] font-bold uppercase tracking-wide text-slate-500"
              >
                Costo unitario
              </p>

              <p class="mt-1 text-lg font-black text-slate-900">
                ${{ store.registrationPricePerPerson.toLocaleString("es-MX") }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
          <div class="flex items-start gap-3">
            <div class="flex items-center h-5">
              <input
                type="checkbox"
                id="terminos"
                v-model="store.aceptedTerms"
                class="w-5 h-5 border-gray-300 rounded focus:ring-experience-blue focus:ring-2 cursor-pointer transition-all"
              />
            </div>

            <div class="text-sm">
              <label
                for="terminos"
                class="font-medium text-gray-700 cursor-pointer select-none"
              >
                He leído y acepto los
                <button
                  type="button"
                  @click.prevent="store.modal = !store.modal"
                  class="text-experience-blue underline font-semibold transition-colors"
                >
                  términos y condiciones
                </button>
              </label>

              <p class="text-gray-500 text-xs mt-1">
                Al continuar, confirmas que los datos ingresados son correctos.
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row-reverse gap-3 sm:gap-4 mt-6">
          <button
            :disabled="!store.canPay || loading"
            @click="startCheckout"
            class="flex-1 px-6 py-3.5 bg-experience-blue text-white font-semibold rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-experience-blue"
          >
            <template v-if="!loading">
              Reservar Ahora

              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </template>

            <template v-else>
              <svg
                class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>

                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>

              Procesando...
            </template>
          </button>

          <button
            :disabled="loading"
            class="flex-1 py-3.5 px-6 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer disabled:opacity-50"
            @click="store.prev"
          >
            Regresar
          </button>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="loading"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/75 backdrop-blur-sm"
      >
        <div
          class="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4 transform transition-all"
        >
          <div class="relative w-16 h-16 mx-auto mb-6">
            <div
              class="absolute inset-0 border-4 border-gray-100 rounded-full"
            ></div>

            <div
              class="absolute inset-0 border-4 border-experience-blue border-t-transparent rounded-full animate-spin"
            ></div>

            <div
              class="absolute inset-0 flex items-center justify-center text-experience-blue"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>

          <h4 class="font-bold text-xl text-gray-900 mb-2">
            Procesando Reservación
          </h4>

          <p class="text-sm text-gray-500">
            Estamos asegurando tus lugares. Por favor no cierres esta ventana ni
            recargues la página.
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
