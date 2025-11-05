<script setup>
import { computed, watch, ref, nextTick, inject, onMounted } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import { formatDateToSpanish } from "@/utils/formatDate";
import { currencyFormat } from "@/utils/formatMoney";
import { loadStripe } from "@stripe/stripe-js";

const store = useReservaStore();
const toast = inject("toast");

const stripePromise = loadStripe(import.meta.env.VITE_PUBLISHABLE_KEY_STRIPE);
const cardMounted = ref(false);
const loading = ref(false);
let stripe, elements, cardElement;

onMounted(async () => {
  stripe = await stripePromise;
  elements = stripe.elements();
});

watch(
  () => store.step,
  async (step) => {
    if (step === 4 && !cardMounted.value) {
      await nextTick();
      await new Promise((r) => requestAnimationFrame(r));

      const mountTarget = document.getElementById("card-element");
      if (!mountTarget) return;

      try {
        cardElement?.unmount?.();
        cardElement?.destroy?.();
      } catch {}

      cardElement = elements.create("card", { hidePostalCode: true });
      cardElement.mount(mountTarget);
      cardMounted.value = true;
    } else if (step !== 4 && cardMounted.value) {
      try {
        cardElement?.unmount?.();
        cardElement?.destroy?.();
      } finally {
        cardElement = undefined;
        cardMounted.value = false;
      }
    }
  },
  { immediate: true }
);

const breakdown = computed(() => store.priceBreakdown());

function buildCheckoutPayload() {
  return {
    date: store.date,
    trip_id: store.selectedTripId,
    seats: store.selectedSeats,
    passengers: store.passengers.map((p) => ({
      seat_id: p.seat,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      phone: p.phone,
      born_date: p.born_date,
      allergies: p.allergies,
    })),
    tickets_email: store.emailSendTickets.emailSent,
    tickets_name: store.emailSendTickets.nameSent || "Cliente",
    unit_price: store.pricePerSeat,
    total: store.total,
    couponId: store.couponId || null,
    currency: "mxn",
  };
}

async function startCheckout() {
  if (!store.aceptedTerms) {
    toast?.open?.({
      message: "Debes aceptar términos y condiciones.",
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
  if (!stripe || !cardElement) {
    toast?.open?.({ message: "Stripe no cargó correctamente.", type: "error" });
    return;
  }

  loading.value = true;
  try {
    const payload = buildCheckoutPayload();
    const res = await fetch("http://localhost:4000/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data?.success || !data?.clientSecret) {
      throw new Error(data?.message || "No se pudo iniciar el pago");
    }

    // 2) Confirmar pago con la tarjeta
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      data.clientSecret,
      { payment_method: { card: cardElement } }
    );

    if (error) {
      // El webhook marcará failed y liberará locks
      toast?.open?.({
        message: error.message || "Pago rechazado",
        type: "error",
      });
      return;
    }
    toast?.open?.({
      message: "✅ Pago procesado, confirmando reserva...",
      type: "success",
    });
    setTimeout(() => {
      store.reset();
      window.location.reload();
    }, 5100);
  } catch (e) {
    console.error(e);
    toast?.open?.({
      message: e?.message || "Error al procesar el pago",
      type: "error",
    });
  } finally {
    loading.value = false;
  }
}

</script>

<template>
  <div class="max-w-5xl mx-auto">
    <h2 class="text-2xl font-semibold mb-6 text-balance text-center">
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

          <div class="mt-5">
            <p>
              Asientos seleccionados:
              <strong v-if="store.selectedSeats.length">{{
                store.selectedSeats.join(", ")
              }}</strong>
              <span v-else class="text-gray-400">— ninguno —</span>
            </p>
            <p class="text-lg font-semibold" v-if="store.discountAmount">
              Descuento:
              {{ currencyFormat(store.discountAmount) }} MXN
            </p>
            <p class="text-lg font-semibold" v-if="store.selectedSeats.length">
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
              <button
                class="py-2 px-4 rounded-md bg-gray-300 w-full cursor-pointer"
                @click="store.prev"
              >
                Regresar
              </button>
              <div class="payment-container">
                <div id="card-element"></div>
                <button
                  :disabled="!store.aceptedTerms || loading"
                  @click="startCheckout"
                  class="px-4 py-2 bg-experience-pink w-full text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{
                    loading
                      ? "Procesando..."
                      : `Pagar ${currencyFormat(store.total)} MXN`
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-container {
  max-width: 400px;
  margin: 0 auto;
}
#card-element {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 15px;
}
</style>
