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
    if (step === 5 && !cardMounted.value) {
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
    } else if (step !== 5 && cardMounted.value) {
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
    trip_data: {
      date: store.date,
      trip_id: store.selectedTripId,
      seats: store.selectedSeats,
      tickets_email: store.emailSendTickets.emailSent,
      tickets_name: store.emailSendTickets.nameSent || "Cliente",
    },

    price_data: {
      unit_price: store.pricePerSeat,
      total: store.total,
      subtotal: store.subtotal,
      discount: store.discountAmount,
      couponId: store.couponId || null,
      currency: "mxn",
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
      address: store.payer.address,
      city: store.payer.city,
      state: store.payer.state,
      zip: store.payer.zip,
      country: store.payer.country,
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
  if (!stripe || !cardElement) {
    toast?.open?.({
      message: "Stripe no cargó correctamente.",
      type: "error",
    });
    return;
  }

  loading.value = true;
  let orderId = null;
  let ticketId = null;

  try {
    // 1) Crear PaymentIntent + guardar en BD (ticket, pasajeros, buyer, order pending)
    const payload = buildCheckoutPayload();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok || !data?.success || !data?.clientSecret) {
      throw new Error(data?.message || "No se pudo iniciar el pago");
    }

    // IDs para poder cancelar si algo sale mal
    const clientSecret = data.clientSecret;
    orderId = data.order_id ?? null;
    ticketId = data.ticket_id ?? null;

    // 2) Confirmar el pago con Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: store.payer.full_name,
            email: store.payer.email,
            phone: store.payer.phone,
            address: {
              line1: store.payer.address,
              city: store.payer.city,
              state: store.payer.state,
              postal_code: store.payer.zip,
              country: store.payer.country,
            },
          },
        },
      }
    );

    // Si hubo error en Stripe → cancelar reserva en backend
    if (error || paymentIntent?.status !== "succeeded") {
      try {
        if (orderId || ticketId) {
          await fetch(`${import.meta.env.VITE_API_URL}/payment/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: orderId,
              ticket_id: ticketId,
            }),
          });
        }
      } catch (cancelErr) {
        console.error("Error limpiando intento fallido:", cancelErr);
      }

      toast?.open?.({
        message: error?.message || "Pago rechazado. Tu lugar fue liberado.",
        type: "error",
      });
      return;
    }

    // 3) Avisar a tu backend que el pago fue OK para marcar la orden como paid y enviar PDF
    const confirmRes = await fetch(
      `${import.meta.env.VITE_API_URL}/payment/confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_intent_id: paymentIntent.id,
        }),
      }
    );

    const confirmData = await confirmRes.json();

    if (!confirmRes.ok || !confirmData?.success) {
      // Aquí el pago YA se cobró en Stripe, pero algo falló en tu backend.
      // No cancelamos nada, solo avisamos.
      toast?.open?.({
        message:
          confirmData?.message ||
          "El pago se cobró, pero hubo un problema al confirmar la reserva. Contáctanos.",
        type: "warning",
      });
      return;
    }

    toast?.open?.({
      message: "✅ Pago procesado y reserva confirmada. Revisa tu correo 📩",
      type: "success",
    });

    setTimeout(() => {
      store.reset();
      window.location.reload();
    }, 5100);
  } catch (e) {
    console.error(e);

    // Si el error ocurrió DESPUÉS de crear la reserva pero ANTES de confirmar Stripe,
    // y tenemos IDs, intentamos limpiar.
    if (orderId || ticketId) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/payment/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            ticket_id: ticketId,
          }),
        });
      } catch (cancelErr) {
        console.error("Error limpiando tras excepción:", cancelErr);
      }
    }

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
        <div v-if="store.selectedSeats.length">
          <p>
            Boletos:
            <span class="font-semibold">{{ breakdown.breakdownText }}</span>
          </p>
        </div>
        <p>
          Asientos seleccionados:
          <span class="font-semibold">{{
            store.selectedSeats.join(", ")
          }}</span>
        </p>

        <div class="mt-5 space-y-2">
          <p
            class="text-xl font-bold uppercase"
            v-if="store.selectedSeats.length"
          >
            Subtotal: {{ currencyFormat(store.subtotal) }} MXN
          </p>
          <p
            class="text-xl font-bold uppercase"
            v-if="store.selectedSeats.length"
          >
            Descuento:
            {{ currencyFormat(store.discountAmount) }} MXN
          </p>
          <p
            class="text-xl font-bold uppercase"
            v-if="store.selectedSeats.length"
          >
            Total: {{ currencyFormat(store.total) }} MXN
          </p>
        </div>

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
              términos y condiciones
            </button></label
          >
        </div>

        <!-- ...dentro de tu <template> -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium">Nombre completo</label>
            <input
              v-model="store.payer.full_name"
              type="text"
              class="w-full border rounded-md p-2"
              placeholder="Nombre en el recibo"
            />
          </div>

          <div>
            <label class="block text-sm font-medium">Email</label>
            <input
              v-model="store.payer.email"
              type="email"
              class="w-full border rounded-md p-2"
              placeholder="correo@dominio.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium">Teléfono</label>
            <input
              v-model="store.payer.phone"
              type="tel"
              class="w-full border rounded-md p-2"
              placeholder="10 dígitos"
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium">Calle y número</label>
            <input
              v-model="store.payer.address"
              type="text"
              class="w-full border rounded-md p-2"
              placeholder="Calle 123 Interior X"
            />
          </div>

          <div>
            <label class="block text-sm font-medium">Ciudad</label>
            <input
              v-model="store.payer.city"
              type="text"
              class="w-full border rounded-md p-2"
              placeholder="Mérida"
            />
          </div>

          <div>
            <label class="block text-sm font-medium">Estado</label>
            <input
              v-model="store.payer.state"
              type="text"
              class="w-full border rounded-md p-2"
              placeholder="Yucatán"
            />
          </div>

          <div>
            <label class="block text-sm font-medium">Código postal</label>
            <input
              v-model="store.payer.zip"
              type="text"
              class="w-full border rounded-md p-2"
              placeholder="97XXX"
            />
          </div>

          <div>
            <label class="block text-sm font-medium">País (ISO2)</label>
            <input
              v-model="store.payer.country"
              maxlength="2"
              class="w-full border rounded-md p-2 uppercase"
              placeholder="MX"
            />
          </div>
        </div>

        <!-- Elemento de tarjeta -->
        <div class="payment-container !mt-5">
          <div id="card-element"></div>
        </div>

        <div class="mt-5 flex gap-2 items-center flex-col md:flex-row-reverse">
          <button
            :disabled="!store.canPay || loading"
            @click="startCheckout"
            class="px-4 py-2 bg-experience-pink w-full text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{
              loading
                ? "Procesando..."
                : `Pagar ${currencyFormat(store.total)} MXN`
            }}
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
  </div>
</template>

<style scoped>
.payment-container {
  max-width: 100%;
  margin: 0 auto;
}
#card-element {
  border: 1px solid #ccc;
  padding: 15px;
  margin-bottom: 15px;
}
</style>
