<script setup>
import { computed, watch, ref, nextTick, inject, onMounted } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import { formatDateToSpanish } from "@/utils/formatDate";
import router from '@/router';

const store = useReservaStore();
const toast = inject("toast");

const loading = ref(false);

function buildPayload() {
  return {
    trip_data: {
      date: store.date,
      trip_id: store.selectedTripId,
      seats: store.selectedSeats,
      tickets_email: store.emailSendTickets.emailSent,
      tickets_name: store.emailSendTickets.nameSent || "Cliente",
    },

    passengers: store.passengers.map((p) => ({
      seat_id: p.seat,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      phone: p.phone,
      born_date: p.born_date,
      allergies: p.allergies,
    })),

    buyer: {
      full_name: store.payer.full_name,
      email: store.payer.email,
      phone: store.payer.phone,
      city: store.payer.city,
      advisor_name: store.payer.advisor_name,
      is_client: store.payer.is_client,
      is_first_visit: store.payer.is_first_visit,
    },
  };
}

async function startCheckout() {
  if (!store.canPay) {
    toast?.open?.({
      message: "Debes aceptar términos y condiciones y llenar el formulario.",
      type: "warning",
    });
    return;
  }
  if (!store.canContinuePassengers) {
    toast?.open?.({
      message: "Revisa los datos de pasajeros.",
      type: "warning",
    });
    return;
  }

  const payload = buildPayload();

  try {
    loading.value = true;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/reservation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log("Respuesta del servidor:", data);
  } catch (error) {
    console.error("Error al iniciar el checkout:", error);
    toast?.open?.({
      message: "Ocurrió un error al procesar tu solicitud.",
      type: "error",
    });
  }
  finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto relative">
    <div
      class="rounded-lg border-gray-200 p-5 lg:p-10 border max-w-xl mx-auto lg:text-lg"
    >
      <h3 class="font-bold uppercase mb-5 lg:text-xl xl:text-2xl">
        Resumen de compra
      </h3>
      <div>
        <p>
          Fecha de RH EXPERIENCE:
          <span class="font-semibold">
            {{ formatDateToSpanish(store.date) }}</span
          >
        </p>
        <p>Origen: <span class="font-semibold">Oficinas de Grupo RH</span></p>

        <p>
          Asientos seleccionados:
          <span class="font-semibold">{{
            store.selectedSeats.join(", ")
          }}</span>
        </p>

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
              términos y condiciones
            </button></label
          >
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="md:col-span-2">
            <FormKit
              type="text"
              name="full_name"
              label="Nombre completo"
              v-model="store.payer.full_name"
              placeholder="Jhon Doe"
              validation="required|length:3"
              :validation-messages="{
                required: 'El nombre es obligatorio',
                length: 'El nombre debe tener al menos 3 caracteres',
              }"
            />
          </div>

          <div>
            <FormKit
              type="email"
              name="email"
              label="Correo electrónico"
              v-model="store.payer.email"
              placeholder="ejemplo@correo.com"
              validation="required|email"
              :validation-messages="{
                required: 'Correo obligatorio',
                email: 'Email no válido',
              }"
            />
          </div>

          <div>
            <FormKit
              type="tel"
              name="phone"
              label="Teléfono"
              v-model="store.payer.phone"
              placeholder="10 dígitos"
              validation="required|matches:/^[0-9]{10}$/"
              :validation-messages="{
                required: 'Teléfono obligatorio',
                matches: 'Debe tener 10 dígitos',
              }"
            />
          </div>
          <div>
            <FormKit
              type="checkbox"
              name="is_visitor"
              label="¿Es visitante?"
              v-model="store.payer.is_client"
            />

            <FormKit
              type="checkbox"
              name="is_first_visit"
              label="¿Es su primera visita?"
              v-model="store.payer.is_first_visit"
            />
          </div>

          <div class="md:col-span-2">
            <FormKit
              type="text"
              name="city"
              label="Ciudad"
              v-model="store.payer.city"
              placeholder="Mérida"
              validation="required|length:3"
              :validation-messages="{
                required: 'La ciudad es obligatoria',
                length: 'La ciudad debe tener al menos 3 caracteres',
              }"
            />
          </div>

          <div class="md:col-span-2">
            <FormKit
              type="text"
              name="advisor_name"
              label="Nombre del asesor"
              v-model="store.payer.advisor_name"
              placeholder="Jhon Doe"
            />
          </div>
        </div>

        <div class="mt-5 flex gap-2 items-center flex-col md:flex-row-reverse">
          <button
            :disabled="!store.canPay || loading"
            @click="startCheckout"
            class="px-4 py-2 bg-experience-pink w-full text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? "Procesando..." : `Reservar` }}
          </button>
          <button
            class="py-2 px-4 rounded-md bg-gray-200 w-full cursor-pointer"
            @click="store.prev"
          >
            Regresar
          </button>
        </div>
      </div>
    </div>

    <!-- OVERLAY DE CARGA -->
    <div
      v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div
        class="bg-white rounded-lg p-6 shadow-lg text-center max-w-sm mx-auto"
      >
        <div
          class="h-10 w-10 border-4 border-gray-300 border-t-experience-pink rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="font-semibold text-lg mb-1">Realizando su reservación.</p>
        <p class="text-sm text-gray-600">
          Por favor no cierres esta ventana ni recargues la página.
        </p>
      </div>
    </div>
  </div>
</template>
