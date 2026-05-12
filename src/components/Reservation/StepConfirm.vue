<script setup>
import { ref, inject } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import { formatDateToSpanish } from "@/utils/formatDate";
import router from "@/router";

const store = useReservaStore();
const toast = inject("toast");

const loading = ref(false);

function buildPayload() {
  return {
    trip_data: {
      date: store.date,
      trip_id: store.selectedTripId,
      seats: store.selectedSeats,
      tickets_email: store.passengers[0]?.email,
      tickets_name: store.passengers[0]?.first_name || "Cliente",
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

  try {
    console.log("Iniciando checkout con payload:", payload);
  } catch (error) {
    console.error("Error al iniciar el checkout:", error);
    toast?.open?.({
      message: "Ocurrió un error al procesar tu solicitud.",
      type: "error",
    });
  }

  // try {
  //   loading.value = true;
  //   const res = await fetch(`${import.meta.env.VITE_API_URL}/reservation`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(payload),
  //   });
  //   const data = await res.json();
  //   console.log("Respuesta del servidor:", data);
  // } catch (error) {
  //   console.error("Error al iniciar el checkout:", error);
  //   toast?.open?.({
  //     message: "Ocurrió un error al procesar tu solicitud.",
  //     type: "error",
  //   });
  // } finally {
  //   loading.value = false;
  // }
}
</script>

<template>
  <div class="max-w-2xl mx-auto relative">
    <div
      class="rounded-lg border-gray-200 p-5 lg:p-10 border max-w-xl mx-auto lg:text-lg"
    >
      <h3 class="font-bold uppercase mb-5 lg:text-xl xl:text-2xl">
        Confirmar reservación
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
