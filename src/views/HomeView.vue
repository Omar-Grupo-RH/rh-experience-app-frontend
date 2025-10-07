<script setup>
import Menu from "@/components/Navigation/Menu.vue";
import { ref, computed } from "vue";
import { reset } from "@formkit/vue";
import TourAPI from "@/api/TourAPI";
import { useReservaStore } from "@/stores/reservaStore";
import BusSeatSelector from "@/components/Reservation/BusSeatSelector.vue";
import Calendar from "@/components/Reservation/Calendar.vue";

const store = useReservaStore();
const dateLocal = ref(store.date || "");
const isProcessing = ref(false);

function onDateChange() {
  if (dateLocal.value) store.setDate(dateLocal.value);
}

const totalFormatted = computed(() => {
  const total = store.total();
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(total);
});

const canProceedToPago = computed(() => {
  return (
    store.form.first_name.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(store.form.email)
  );
});

function goToPago() {
  store.next();
}

async function startCheckout() {
  isProcessing.value = true;
  try {
    // const res = await fetch("/create-checkout-session", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     date: store.date,
    //     seats: store.selectedSeats,
    //     first_name: store.form.first_name,
    //     last_name: store.form.last_name,
    //     phone: store.form.phone,
    //     email: store.form.email,
    //     unit_price: store.pricePerSeat,
    //   }),
    // });
    // const data = await res.json();
    // if (data.url) window.location.href = data.url;
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
              <div class="flex justify-between lg:gap-10">
                <div class="w-1/2">
                  <p class="xl:text-lg font-medium mb-5">Selecciona tu fecha</p>
                  <Calendar />
                </div>

                <div v-if="store.date" class="w-1/2">
                  <p class="xl:text-lg font-medium mb-5">
                    Selecciona tus asientos
                  </p>
                  <BusSeatSelector />
                  <div class="flex items-center justify-between mt-3">
                    <div>
                      <p class="text-sm">
                        Seleccionados:
                        <strong v-if="store.selectedSeats.length">{{
                          store.selectedSeats.join(", ")
                        }}</strong>
                        <span v-else class="text-gray-400">— ninguno —</span>
                      </p>
                      <p class="text-xs text-gray-500">
                        Precio por asiento: <strong>100 MXN</strong>
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-lg font-semibold">{{ totalFormatted }}</p>
                      <p class="text-xs text-gray-500">
                        {{ store.selectedSeats.length }} × 100 MXN
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-between mt-4">
                <button
                  class="px-4 py-2 rounded-md bg-experience-blue text-white disabled:opacity-50 cursor-pointer"
                  :disabled="store.selectedSeats.length === 0 || !store.date"
                  @click="store.next"
                >
                  Siguiente
                </button>
              </div>
            </div>

            <!-- Paso 2 -->

            <div
              v-else-if="store.step === 2"
              class="bg-white p-4 rounded-lg shadow-sm"
            >
              <FormKit
                type="form"
                submit-label="Siguiente"
                :actions="false"
                incomplete-message="No se pudo enviar, revisa las notificaciones"
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
                  @input="store.form.first_name = $event"
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
                  @input="store.form.last_name = $event"
                />

                <FormKit
                  type="email"
                  label="Correo electronico"
                  name="email"
                  placeholder="Ingresa tu correo electronico"
                  validation="required|email"
                  :validation-messages="{
                    required: 'El correo electronico es obligatorio',
                    email: 'Email no valido',
                  }"
                  :value="store.form.email"
                  @input="store.form.email = $event"
                />

                <FormKit
                  type="tel"
                  label="Telefono"
                  name="phone"
                  placeholder="Ingresa tu numero telefonico"
                  validation="required|matches:/^[0-9]{10}$/"
                  :validation-messages="{
                    required: 'El numero telefonico es obligatorio',
                    matches:
                      'El numero telefonico debe tener 10 digitos solamente.',
                  }"
                  :value="store.form.phone"
                  @input="store.form.phone = $event"
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
                    input-class="px-4 py-2 bg-experience-blue text-white rounded-md"
                  />
                </div>
              </FormKit>
            </div>

            <!-- Paso 3 -->
            <div
              v-else-if="store.step === 3"
              class="bg-white p-4 rounded-lg shadow-sm"
            >
              <h2 class="font-semibold mb-2">Resumen</h2>
              <div class="bg-gray-50 p-3 rounded mb-4">
                <p><strong>Fecha:</strong> {{ store.date }}</p>
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
