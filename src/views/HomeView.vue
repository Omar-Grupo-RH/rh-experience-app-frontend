<script setup>
import Menu from "@/components/Navigation/Menu.vue";
import { ref, computed } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import BusSeatSelector from "@/components/Reservation/BusSeatSelector.vue";
import TermsCondModal from "@/components/Reservation/TermsCondModal.vue";
import Calendar from "@/components/Reservation/Calendar.vue";
import { formatDateToSpanish } from "@/utils/formatDate";
import { currencyFormat } from "@/utils/formatMoney";

import axios from "axios";

const store = useReservaStore();
const isProcessing = ref(false);

const breakdown = computed(() => store.priceBreakdown());

async function startCheckout() {
  isProcessing.value = true;
  try {
    const payload = {
      date: store.date,
      trip_id: store.selectedTripId,
      seats: store.selectedSeats,
      // Todos los pasajeros (incluye quien paga)
      passengers: store.passengers.map((p) => ({
        seat_id: p.seat,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        phone: p.phone,
        born_date: p.born_date,
        allergies: p.allergies,
      })),
      // Puedes tomar el email de envío del primer pasajero o pedir uno aparte:
      tickets_email: store.emailSendTickets.emailSent,
      tickets_name: store.emailSendTickets.nameSent || "Cliente",
      unit_price: store.pricePerSeat,
      total: store.total,
      couponId: store.couponId || null,
    };

    console.log(JSON.stringify(payload))
    const res = await axios.post("http://localhost:4000/api/payment", payload);
    console.log(res);
  } catch (e) {
    console.error(e);
    alert("Error iniciando pago");
  } finally {
    isProcessing.value = false;
  }
}
</script>

<template>
  <main >
    <Menu />
    <section class="min-h-screen relative">
      <div
        class="min-h-screen flex justify-center    bg-gray-50 relative"
      >
        <div class="rounded-2xl w-[95%] xl:w-[80%]  mt-10 py-5 pb-10 relative">
          <div class="max-w-7xl mx-auto space-y-6">
            <!-- Pasos -->
            <div
              class="flex flex-col items-center lg:flex-row lg:justify-around font-medium mb-4"
            >
              <div
                :class="
                  store.step >= 1 ? 'text-experience-pink' : 'text-gray-400'
                "
              >
                Fecha y Asientos
              </div>
              <div
                :class="
                  store.step >= 2 ? 'text-experience-pink' : 'text-gray-400'
                "
              >
                Registro de Pasajeros
              </div>
              <div
                :class="
                  store.step >= 3 ? 'text-experience-pink' : 'text-gray-400'
                "
              >
                Confirmacion de datos
              </div>
              <div
                :class="
                  store.step >= 4 ? 'text-experience-pink' : 'text-gray-400'
                "
              >
                Pago
              </div>
            </div>

            <!-- Paso 1 -->
            <div
              v-if="store.step === 1"
              class="bg-white p-4  rounded-lg w-full h-auto shadow-sm space-y-4"
            >
              <div class="flex flex-col xl:flex-row justify-between xl:gap-5">
                <div class="xl:w-[70%]">
                  <p class="xl:text-lg font-medium mb-5">Selecciona tu fecha</p>
                  <div class="h-[600px] overflow-y-scroll">
                    <Calendar />
                  </div>
                </div>

                <div v-if="store.date" class="xl:w-[25%]">
                  <p class="xl:text-lg font-medium mb-5 text-center">
                    Selecciona tus asientos
                  </p>
                  <BusSeatSelector />

                  <div class="flex items-center justify-between mt-3">
                    <div class="flex flex-col gap-1.5">
                      <p class="text-sm">
                        Fecha escogida:
                        <strong>{{ formatDateToSpanish(store.date) }}</strong>
                      </p>
                      <p class="text-sm">
                        Asientos seleccionados:
                        <strong v-if="store.selectedSeats.length">{{
                          store.selectedSeats.join(", ")
                        }}</strong>
                        <span v-else class="text-gray-400">— ninguno —</span>
                      </p>
                      <div v-if="store.selectedSeats.length">
                        <p class="text-gray-500 text-sm">
                          {{ breakdown.breakdownText }}
                        </p>
                      </div>
                      <p
                        class="text-lg font-semibold"
                        v-if="store.selectedSeats.length"
                      >
                        Total: {{ currencyFormat(store.total) }} MXN
                      </p>
                    </div>
                  </div>
                  <div class="lg:flex lg:justify-end">
                    <button
                      class="px-4 py-2 rounded-md bg-experience-pink text-white disabled:opacity-50 cursor-pointer mt-5 w-full lg:w-fit"
                      :disabled="
                        store.selectedSeats.length === 0 || !store.date
                      "
                      @click="store.next"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Paso 2: N Pasajeros -->
            <div
              v-else-if="store.step === 2"
              class="bg-white p-10 rounded-lg shadow-sm"
            >
              <div class="max-w-5xl mx-auto">
                <h2
                  class="text-2xl font-semibold mb-6 text-balance text-center"
                >
                  Registro de pasajeros para RH EXPERIENCE el
                  {{ formatDateToSpanish(store.date) }}
                </h2>
                <div
                  class="w-full flex flex-col-reverse gap-5 lg:flex-row items-start lg:gap-10 relative"
                >
                  <div class="w-full lg:max-w-xl lg:flex-2">
                    <FormKit type="form" :actions="false">
                      <div class="space-y-6">
                        <FormKit
                          v-for="(p, idx) in store.passengers"
                          :key="p.seat"
                          type="group"
                          :name="`passengers[${idx}]`"
                          :label="`Pasajero ${String(idx + 1).padStart(
                            2,
                            '0'
                          )} — Asiento ${p.seat}`"
                          label-class="block font-medium text-gray-800 mb-2"
                          :value="p"
                        >
                          <div class="p-4 rounded-lg border border-gray-200">
                            <div>
                              <p class="font-semibold text-xl">
                                Pasajero
                                <span class="font-normal">{{ idx + 1 }}</span>
                              </p>
                              <div>
                                <p class="font-semibold text-xl">
                                  Asiento
                                  <span class="font-normal">{{ p.seat }}</span>
                                </p>
                              </div>
                            </div>
                            <div class="grid md:grid-cols-2 gap-4 mt-5">
                              <FormKit
                                type="text"
                                name="first_name"
                                label="Nombre(s)"
                                v-model="p.first_name"
                                placeholder="Jhon"
                                validation="required|length:3"
                                :validation-messages="{
                                  required: 'El nombre es obligatorio',
                                }"
                              />
                              <FormKit
                                type="text"
                                name="last_name"
                                label="Apellido(s)"
                                v-model="p.last_name"
                                placeholder="Doe"
                                validation="required|length:3"
                                :validation-messages="{
                                  required: 'El apellido es obligatorio',
                                }"
                              />
                              <FormKit
                                type="email"
                                name="email"
                                label="Correo electrónico"
                                v-model="p.email"
                                placeholder="ejemplo@correo.com"
                                validation="required|email"
                                :validation-messages="{
                                  required: 'Correo obligatorio',
                                  email: 'Email no válido',
                                }"
                              />
                              <FormKit
                                type="tel"
                                name="phone"
                                label="Teléfono"
                                v-model="p.phone"
                                placeholder="10 dígitos"
                                validation="required|matches:/^[0-9]{10}$/"
                                :validation-messages="{
                                  required: 'Teléfono obligatorio',
                                  matches: 'Debe tener 10 dígitos',
                                }"
                              />
                              <FormKit
                                type="date"
                                name="born_date"
                                label="Fecha de nacimiento"
                                v-model="p.born_date"
                                placeholder="AAAA-MM-DD"
                                validation="required|date"
                                :validation-messages="{
                                  required: 'Fecha obligatoria',
                                  date: 'Fecha no válida',
                                }"
                              />

                              <!-- Alergias -->
                              <div class="mb-2 md:col-span-2">
                                <label
                                  class="block font-medium text-gray-700 mb-1"
                                  >Alergias (separadas por coma)</label
                                >
                                <input
                                  type="text"
                                  class="w-full outline-none border-0 bg-white rounded-md p-2 text-sm"
                                  @keydown.enter.prevent
                                  @blur="
                                    (ev) => {
                                      const raw = ev.target.value.trim();
                                      if (!raw) return;
                                      const tags = raw
                                        .split(',')
                                        .map((t) => t.trim())
                                        .filter(Boolean);
                                      p.allergies = Array.from(
                                        new Set([
                                          ...(p.allergies || []),
                                          ...tags,
                                        ])
                                      );
                                      ev.target.value = '';
                                    }
                                  "
                                  placeholder="Ej. mariscos, cacahuate"
                                />
                                <div class="flex flex-wrap gap-2 mt-2">
                                  <span
                                    v-for="(tag, aidx) in p.allergies"
                                    :key="aidx"
                                    class="bg-blue-100 text-experience-pink text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"
                                  >
                                    {{ tag }}
                                    <button
                                      type="button"
                                      class="text-red-500 hover:text-red-700 cursor-pointer"
                                      @click="p.allergies.splice(aidx, 1)"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </FormKit>
                      </div>

                      <div class="flex justify-between mt-6"></div>
                    </FormKit>
                  </div>

                  <div class="space-y-5">
                    <div
                      class="flex w-full items-center justify-between rounded-lg border-gray-200 mt-3 lg:mt-0 border lg:flex-1"
                    >
                      <div class="flex flex-col gap-1.5 w-full p-5">
                        <div class="flex items-center gap-5 lg:gap-10">
                          <img
                            src="/logos/Recurso9.svg"
                            class="w-9 lg:w-16 invert"
                            alt=""
                          />
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

                        <div class="mt-5">
                          <p>
                            Asientos seleccionados:
                            <strong v-if="store.selectedSeats.length">{{
                              store.selectedSeats.join(", ")
                            }}</strong>
                            <span v-else class="text-gray-400"
                              >— ninguno —</span
                            >
                          </p>

                          <p
                            class="text-lg font-semibold"
                            v-if="store.selectedSeats.length"
                          >
                            Total: {{ currencyFormat(store.total) }} MXN
                          </p>

                          <div
                            class="flex items-center gap-5 lg:flex-col lg:gap-2 mt-5"
                          >
                            <button
                              class="py-2 px-4 rounded-md bg-gray-300 w-full cursor-pointer"
                              @click="store.prev"
                            >
                              Regresar
                            </button>
                            <button
                              class="px-4 py-2 bg-experience-pink w-full text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              :disabled="!store.canContinuePassengers"
                              @click="store.next"
                            >
                              Continuar
                            </button>
                          </div>
                          <p
                            v-if="!store.allAdults"
                            class="text-red-500 text-sm mt-2"
                          >
                            Todos los pasajeros deben ser mayores de edad.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3>
                        Ingresa los datos de la persona que recibira los boletos
                      </h3>
                      <div class="flex flex-col gap-1 mt-3">
                        <FormKit
                          type="text"
                          name="nameSent"
                          v-model="store.emailSendTickets.nameSent"
                          placeholder="Ingresa el nombre del destinatarios"
                          validation="required"
                          :validation-messages="{
                            required: 'Nombre obligatorio',
                          }"
                        />

                        <FormKit
                          type="email"
                          name="emailSent"
                          v-model="store.emailSendTickets.emailSent"
                          placeholder="Ingresa correo electronico"
                          validation="required|email"
                          :validation-messages="{
                            required: 'Correo obligatorio',
                            email: 'Email no válido',
                          }"
                        />
                        <FormKit
                          type="email"
                          name="confirmEmail"
                          v-model="store.emailSendTickets.confirmEmail"
                          placeholder="Confirmar correo electronico"
                          validation="required|email"
                          :validation-messages="{
                            required: 'Correo obligatorio',
                            email: 'Email no válido',
                          }"
                        />
                      </div>
                      <p v-if="!store.sameEmails" class="text-red-500 text-sm">
                        Los correos deben coincidir para continuar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Paso 3 -->
            <div
              v-else-if="store.step === 3"
              class="bg-white p-10 rounded-lg shadow-sm"
            >
              <div class="max-w-5xl mx-auto">
                <h2
                  class="text-2xl font-semibold mb-6 text-balance text-center"
                >
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
                        <img
                          src="/logos/Recurso9.svg"
                          class="w-9 lg:w-16 invert"
                          alt=""
                        />
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

                        <p
                          class="text-lg font-semibold"
                          v-if="store.selectedSeats.length"
                        >
                          Total: {{ currencyFormat(store.total) }} MXN
                        </p>

                        <div
                          class="mt-5 flex gap-5 items-center lg:flex-col lg:gap-2"
                        >
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
            </div>

            <!-- Paso 4 -->
            <div
              v-else-if="store.step === 4"
              class="bg-white p-4 rounded-lg shadow-sm"
            >
              <div class="max-w-5xl mx-auto">
                <h2
                  class="text-2xl font-semibold mb-6 text-balance text-center"
                >
                  Realizar Pago
                </h2>
                <div class="w-full lg:flex items-start lg:gap-10 relative">
                  <div class="max-w-xl lg:flex-2">
                    <form id="payment-form">
                      <div id="payment-element">
                        <!--Stripe.js injects the Payment Element-->
                      </div>
                      <button id="submit">
                        <div class="spinner hidden" id="spinner"></div>
                        <span id="button-text">Pay now</span>
                      </button>
                      <div id="payment-message" class="hidden"></div>
                    </form>
                  </div>
                  <div
                    class="flex items-center justify-between rounded-lg bg-gray-50 border-gray-200 mt-3 border lg:flex-1"
                  >
                    <div class="flex flex-col gap-1.5 w-full p-5">
                      <div class="flex items-center gap-5 lg:gap-10">
                        <img
                          src="/logos/Recurso9.svg"
                          class="w-9 lg:w-16 invert"
                          alt=""
                        />
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

                      <div class="mt-5">
                        <p>
                          Asientos seleccionados:
                          <strong v-if="store.selectedSeats.length">{{
                            store.selectedSeats.join(", ")
                          }}</strong>
                          <span v-else class="text-gray-400">— ninguno —</span>
                        </p>
                        <p
                          class="text-lg font-semibold"
                          v-if="store.discountAmount"
                        >
                          Descuento:
                          {{ currencyFormat(store.discountAmount) }} MXN
                        </p>
                        <p
                          class="text-lg font-semibold"
                          v-if="store.selectedSeats.length"
                        >
                          Total: {{ currencyFormat(store.total) }} MXN
                        </p>

                        <div class="flex my-3">
                          <input
                            type="text"
                            name="cupon"
                            id="cupon"
                            placeholder="INGRESA CODIGO DE CUPON"
                            class="w-[80%] border-0 outline-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="store.couponIsApply"
                            v-model="store.couponInput"
                          />
                          <button
                            class="bg-experience-pink text-white font-semibold w-[20%] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="!store.couponEmpy || store.couponIsApply"
                            @click="store.getCoupon(store.couponInput)"
                          >
                            {{ store.couponTextBtn }}
                          </button>
                        </div>

                        <div class="flex items-center gap-2 mt-3">
                          <input
                            type="checkbox"
                            name="terminos"
                            id="terminos"
                            v-model="store.aceptedTerms"
                          />
                          <label for="terminos" class="block"
                            >Acepto los
                            <button
                              @click="store.modal = !store.modal"
                              class="underline cursor-pointer"
                            >
                              terminos y condiciones
                            </button></label
                          >
                        </div>

                        <div class="mt-5 space-y-2">
                          <!-- <button
                            type="button"
                            class="py-2 px-4 rounded-md bg-gray-300 w-full cursor-pointer"
                            @click="store.prev"
                          >
                            Regresar
                          </button> -->
                          <button
                            :disabled="!store.aceptedTerms"
                            @click="startCheckout"
                            class="px-4 py-2 bg-experience-pink w-full text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Pagar {{ currencyFormat(store.total) }} MXN
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TermsCondModal :isVisible="store.modal" />
    </section>
  </main>
</template>
