<script setup>
import { computed } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import { formatDateToSpanish } from "@/utils/formatDate";
import { currencyFormat } from "@/utils/formatMoney";
const store = useReservaStore();

const breakdown = computed(() => store.priceBreakdown());

</script>

<template>
  <div class="max-w-5xl mx-auto">
    <h2 class="text-2xl font-semibold mb-6 text-balance text-center">
      Confirmacion de datos
    </h2>
    <div
      class="w-full flex flex-col-reverse lg:flex-row lg:items-start lg:gap-10 relative"
    >
      <div class="lg:max-w-xl lg:flex-2 mt-5 lg:mt-3">
        <ul class="space-y-5">
          <li
            v-for="(p, idx) in store.passengers"
            :key="p.seat"
            class="bg-gray-50 rounded border border-gray-200 flex"
          >
            <div
              class="flex flex-col justify-center items-center p-4 gap-2 border-gray-300 border-r-2"
            >
              <p class="lg:text-xl">
                <strong>Pasajero {{ idx + 1 }}</strong>
              </p>

              <div>
                <img
                  src="/svg/seat.svg"
                  alt="Icono de un asiento"
                  class="w-5 xl:w-7"
                />
              </div>

              <p class="text-sm">Asiento {{ p.seat }}</p>
            </div>

            <div class="p-4">
              <p class="xl:text-lg uppercase font-semibold">
                {{ p.first_name }} {{ p.last_name }}
              </p>
              <p class="xl:text-lg">
                {{ formatDateToSpanish(p.born_date) }}
              </p>
              <p class="xl:text-lg">{{ p.phone || "—" }}</p>
              <p class="xl:text-lg">{{ p.email || "—" }}</p>
              <p class="xl:text-lg" v-if="p.allergies?.length">
                Alergias: {{ p.allergies.join(", ") }}
              </p>
            </div>
          </li>
        </ul>

        <div class="mt-5">
          <p class="text-gray-400 italic">
            Los boletos se enviaran al correo
            <span class="font-semibold">{{
              store.emailSendTickets.emailSent
            }}</span>
            a nombre de
            <span class="font-semibold">{{
              store.emailSendTickets.nameSent
            }}</span>
          </p>
        </div>
      </div>

      <div
        class="flex items-center justify-between rounded-lg bg-gray-50 border-gray-200 mt-3 border lg:flex-1"
      >
        <div class="flex flex-col gap-1.5 w-full p-5">
          <div class="flex items-center gap-5 lg:gap-10">
            <img src="/logos/Recurso9.svg" class="w-9 lg:w-16 invert" alt="" />
            <div>
              <p class="font-semibold">
                {{ formatDateToSpanish(store.date) }}
              </p>
              <p class="font-semibold">
                Origen: <span>Oficinas de Grupo RH</span>
              </p>
              <div v-if="store.selectedSeats.length">
                <p class="font-semibold">
                  {{ breakdown.breakdownText }}
                </p>
              </div>
            </div>
          </div>

          <div class="lg:mt-5">
            <p>
              Asientos seleccionados:
              <strong v-if="store.selectedSeats.length">{{
                store.selectedSeats.join(", ")
              }}</strong>
              <span v-else class="text-gray-400">— ninguno —</span>
            </p>

            <p class="text-lg font-semibold" v-if="store.selectedSeats.length">
              Total: {{ currencyFormat(store.total) }} MXN
            </p>

            <div class="mt-5 flex gap-5 items-center lg:flex-col lg:gap-2">
              <button
                class="py-2 px-4 rounded-md bg-gray-300 w-full cursor-pointer"
                @click="store.prev"
              >
                Regresar
              </button>
              <button
                class="px-4 py-2 bg-experience-pink w-full text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                @click="store.next"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
