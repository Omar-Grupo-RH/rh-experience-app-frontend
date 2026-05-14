<script setup>
import { ref, inject } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import { formatDateToSpanish } from "@/utils/formatDate";
import PassengersItem from "@/components/Reservation/PassengersItem.vue";
import ReservationAPI, {
  clearReservationIdempotencyKey,
} from "@/api/ReservationAPI";

import router from "@/router";

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

    passengers: store.passengers.map((p) => ({
      seat_id: p.seat,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      phone: p.phone,
      born_date: p.born_date,
      allergies: p.allergies,
    })),
  };
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

  // try {
  //   console.log("Iniciando checkout con payload:", payload);
  // } catch (error) {
  //   console.error("Error al iniciar el checkout:", error);
  //   toast?.open?.({
  //     message: "Ocurrió un error al procesar tu solicitud.",
  //     type: "error",
  //   });
  // }

  try {
    loading.value = true;

    const { data } = await ReservationAPI.reserveTrip(payload);

    console.log("Respuesta del servidor:", data);

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

      <div class="p-6 sm:p-8">
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
              <p class="text-base text-gray-800">
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
              <p class="text-base text-gray-800">Oficinas de Grupo RH</p>
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
