<script setup>
import { computed } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import { formatDateToSpanish } from "@/utils/formatDate";
import { currencyFormat } from "@/utils/formatMoney";
const store = useReservaStore();

const breakdown = computed(() => store.priceBreakdown());

const adult = ({ value }) => {
  if (!value) return false;
  const birthDate = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age >= 18;
};
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <h2 class="text-2xl font-semibold mb-6 text-balance text-center">
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
              :label="`Pasajero ${String(idx + 1).padStart(2, '0')} — Asiento ${
                p.seat
              }`"
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
                    validation="required|date|adult"
                    validation-visibility="live"
                    :validation-messages="{
                      required: 'Fecha obligatoria',
                      date: 'Fecha no válida',
                      adult: 'Debes ser mayor de edad (18 años o más)',
                    }"
                    :validation-rules="{ adult }"
                  />

                  <!-- Alergias -->
                  <div class="mb-2 md:col-span-2">
                    <label class="block font-medium text-gray-700 mb-1"
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
                            new Set([...(p.allergies || []), ...tags])
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
                <span v-else class="text-gray-400">— ninguno —</span>
              </p>

              <p
                class="text-lg font-semibold"
                v-if="store.selectedSeats.length"
              >
                Total: {{ currencyFormat(store.total) }} MXN
              </p>

              <div class="flex items-center gap-5 lg:flex-col lg:gap-2 mt-5">
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
              <p v-if="!store.allAdults" class="text-red-500 text-sm mt-2">
                Todos los pasajeros deben ser mayores de edad.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3>Ingresa los datos de la persona que recibira los boletos</h3>
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
</template>
