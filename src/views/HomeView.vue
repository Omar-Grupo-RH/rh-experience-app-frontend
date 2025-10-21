<script setup>
import Menu from "@/components/Navigation/Menu.vue";
import { ref, computed } from "vue";
import { useReservaStore } from "@/stores/reservaStore";
import BusSeatSelector from "@/components/Reservation/BusSeatSelector.vue";
import Calendar from "@/components/Reservation/Calendar.vue";
import { formatDateToSpanish } from "@/utils/formatDate";

const store = useReservaStore();
const isProcessing = ref(false);
const allergiesInput = ref("");

function pushAllergies(...rawTags) {
  const existing = new Set(
    store.form.allergies.map((a) => a.trim().toLowerCase())
  );

  const toAdd = rawTags
    .flat()
    .map((t) => (t ?? "").trim())
    .filter(Boolean);
  for (const tag of toAdd) {
    const key = tag.toLowerCase();
    if (!existing.has(key)) {
      store.form.allergies.push(tag);
      existing.add(key);
    }
  }
}

function handleAllergiesInput(e) {
  const v = e.target.value;
  if (v.includes(",")) {
    const tags = v
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    pushAllergies(tags);
    allergiesInput.value = "";
  }
}

function commitAllergyOnBlur() {
  const v = allergiesInput.value.trim();
  if (v) {
    pushAllergies(v);
    allergiesInput.value = "";
  }
}

function removeAllergy(i) {
  store.form.allergies.splice(i, 1);
}

const totalFormatted = computed(() => {
  const total = store.total();
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(total);
});

const breakdown = computed(() => store.priceBreakdown());

function goToPago() {
  store.next();
}

async function startCheckout() {
  isProcessing.value = true;
  try {
    console.log(
      JSON.stringify({
        date: store.date,
        seats: store.selectedSeats,
        first_name: store.form.first_name,
        last_name: store.form.last_name,
        phone: store.form.phone,
        email: store.form.email,
        unit_price: store.pricePerSeat,
      })
    );
  } catch (err) {
    console.error(err);
    alert("Error iniciando pago");
  } finally {
    isProcessing.value = false;
  }
}
</script>

<template>
  <main>
    <Menu />
    <section class="min-h-screen">
      <div
        class="min-h-screen flex justify-center items-center bg-experience-aqua relative py-5"
      >
        <div
          class="w-full h-full absolute inset-0 overflow-hidden pointer-events-none"
        >
          <img
            src="/images/textura2.svg"
            alt="Textura de experience"
            class="w-full h-full object-cover opacity-50 pointer-events-none"
          />
        </div>

        <div
          class="p-5 md:p-10 rounded-2xl shadow md:w-[80%] bg-experience-white relative"
        >
          <h2
            class="text-xl md:text-2xl mb-5 uppercase xl:text-3xl font-semibold text-center"
          >
            Reservar experiencia
          </h2>

          <div class="max-w-7xl mx-auto p-6 space-y-6">
            <div class="flex justify-between font-medium mb-4">
              <div
                :class="
                  store.step >= 1 ? 'text-experience-pink' : 'text-gray-400'
                "
              >
                1. Día & Asientos
              </div>
              <div
                :class="
                  store.step >= 2 ? 'text-experience-pink' : 'text-gray-400'
                "
              >
                2. Datos
              </div>
              <div
                :class="
                  store.step >= 3 ? 'text-experience-pink' : 'text-gray-400'
                "
              >
                3. Pago
              </div>
            </div>

            <!-- Paso 1 -->
            <div
              v-if="store.step === 1"
              class="bg-white p-4 rounded-lg w-full shadow-sm space-y-4"
            >
              <div class="flex justify-between lg:gap-5">
                <div class="lg:w-[70%]">
                  <p class="xl:text-lg font-medium mb-5">Selecciona tu fecha</p>
                  <Calendar />
                </div>

                <div v-if="store.date" class="lg:w-[25%]">
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
                        Total: {{ totalFormatted }} MXN
                      </p>
                    </div>
                  </div>
                  <button
                    class="px-4 py-2 rounded-md bg-experience-pink text-white disabled:opacity-50 cursor-pointer mt-5 w-full"
                    :disabled="store.selectedSeats.length === 0 || !store.date"
                    @click="store.next"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>

            <!-- Paso 2 -->

            <div
              v-else-if="store.step === 2"
              class="bg-white py-10 rounded-lg shadow-sm"
            >
              <div class="max-w-5xl mx-auto">
                <FormKit
                  type="form"
                  submit-label="Siguiente"
                  :actions="false"
                  incomplete-message="Hay algunos campos incompletos"
                  @submit="goToPago"
                >
                  <FormKit
                    type="text"
                    label="Nombre(s)"
                    name="first_name"
                    placeholder="John"
                    validation="required|length:3"
                    :validation-messages="{
                      required: 'El nombre es obligatorio',
                    }"
                    :value="store.form.first_name"
                    v-model="store.form.first_name"
                  />

                  <FormKit
                    type="text"
                    label="Apellido(s)"
                    name="last_name"
                    placeholder="Doe"
                    validation="required|length:3"
                    :validation-messages="{
                      required: 'El apellido es obligatorio',
                    }"
                    :value="store.form.last_name"
                    v-model="store.form.last_name"
                  />

                  <FormKit
                    type="email"
                    label="Correo electrónico"
                    name="email"
                    placeholder="Ingresa tu correo electronico"
                    validation="required|email"
                    :validation-messages="{
                      required: 'El correo electronico es obligatorio',
                      email: 'Email no valido',
                    }"
                    :value="store.form.email"
                    v-model="store.form.email"
                  />
                  <FormKit
                    type="date"
                    label="Fecha de nacimiento"
                    name="born_date"
                    v-model="store.form.born_date"
                    placeholder="Selecciona tu fecha de nacimiento"
                    validation="required|date"
                    :value="store.form.born_date"
                    :validation-messages="{
                      required: 'La fecha de nacimiento es obligatoria',
                      date: 'Fecha no valida',
                    }"
                  />

                  <div class="mb-4">
                    <label
                      for="allergies_input"
                      class="block font-medium text-gray-700 mb-1"
                    >
                      Alergias (separadas por coma)
                    </label>

                    <input
                      id="allergies_input"
                      type="text"
                      v-model="allergiesInput"
                      @blur="commitAllergyOnBlur"
                      @input="handleAllergiesInput"
                      placeholder="Ej. mariscos, cacahuate, gluten"
                      class="w-full outline-none border-0 bg-gray-50 rounded-md p-2 text-sm"
                    />

                    <!-- Chips visuales -->
                    <div class="flex flex-wrap gap-2 mt-2">
                      <span
                        v-for="(allergy, index) in store.form.allergies"
                        :key="index"
                        class="bg-blue-100 text-experience-pink text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"
                      >
                        {{ allergy }}
                        <button
                          type="button"
                          class="text-red-500 hover:text-red-700 cursor-pointer"
                          @click="removeAllergy(index)"
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  </div>

                  <FormKit
                    type="tel"
                    label="Teléfono"
                    name="phone"
                    placeholder="Ingresa tu numero telefonico"
                    validation="required|matches:/^[0-9]{10}$/"
                    :validation-messages="{
                      required: 'El numero telefonico es obligatorio',
                      matches:
                        'El numero telefonico debe tener 10 digitos solamente.',
                    }"
                    :value="store.form.phone"
                    v-model="store.form.phone"
                  />

                  <div class="flex justify-between mt-6">
                    <button
                      type="button"
                      class="w-fit h-fit py-2 px-4 rounded-md cursor-pointer bg-gray-300"
                      @click="store.prev"
                    >
                      Atrás
                    </button>

                    <FormKit
                      type="submit"
                      label="Siguiente"
                      input-class="px-4 py-2 bg-experience-pink text-white rounded-md"
                    />
                  </div>
                </FormKit>
              </div>
            </div>

            <div
              v-else-if="store.step === 3"
              class="bg-white p-4 rounded-lg shadow-sm"
            >
              <h2 class="font-semibold mb-2">Resumen</h2>
              <div class="bg-gray-50 p-3 rounded mb-4">
                <p>
                  <strong>Fecha:</strong> {{ formatDateToSpanish(store.date) }}
                </p>
                <p>
                  <strong>Asientos:</strong>
                  {{ store.selectedSeats.join(", ") }}
                </p>
                <p><strong>Nombre(s):</strong> {{ store.form.first_name }}</p>
                <p><strong>Apellido(s):</strong> {{ store.form.last_name }}</p>
                <p><strong>Email:</strong> {{ store.form.email }}</p>
                <p><strong>Telefono:</strong> {{ store.form.phone }}</p>
              </div>

              <div class="flex items-center justify-between mb-4">
                <div>
                  <p class="text-sm">Total a pagar</p>
                  <p class="text-2xl font-semibold">{{ totalFormatted }}</p>
                </div>
                <button
                  @click="startCheckout"
                  :disabled="isProcessing"
                  class="px-4 py-2 bg-green-600 text-white rounded-md cursor-pointer"
                >
                  {{ isProcessing ? "Redirigiendo..." : "Pagar con Stripe" }}
                </button>
              </div>

              <div class="mt-4 flex justify-between">
                <button
                  class="w-fit h-fit py-2 px-4 rounded-md cursor-pointer bg-gray-300"
                  @click="store.prev"
                >
                  Atrás
                </button>
                <button
                  class="w-fit h-fit py-2 px-4 rounded-md cursor-pointer bg-red-500 text-white"
                  @click="store.reset"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
