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
  let paymentSucceeded = false;

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

    paymentSucceeded = true;
    loading.value = false;
    toast?.open?.({
      message: "✅ Pago procesado y reserva confirmada. Revisa tu correo 📩",
      type: "success",
    });
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
    if (paymentSucceeded) {
      // Mantener el overlay hasta recargar
      console.log("paymentSucceeded", paymentSucceeded);
    } else {
      // Hubo error: quitamos overlay
      loading.value = false;
    }
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

          <div class="md:col-span-2">
            <FormKit
              type="text"
              name="address"
              label="Domicilio"
              v-model="store.payer.address"
              placeholder="Calle 123 Interior X"
              validation="required|length:3"
              :validation-messages="{
                required: 'El domicilio es obligatorio',
                length: 'El domicilio debe tener al menos 3 caracteres',
              }"
            />
          </div>

          <div>
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

          <div>
            <FormKit
              type="text"
              name="state"
              label="Estado"
              v-model="store.payer.state"
              placeholder="Yucatán"
              validation="required|length:3"
              :validation-messages="{
                required: 'El estado es obligatorio',
                length: 'El estado debe tener al menos 3 caracteres',
              }"
            />
          </div>

          <div>
            <FormKit
              type="text"
              name="zip"
              label="Código postal"
              v-model="store.payer.zip"
              placeholder="97XXX"
              validation="required|length:3"
              :validation-messages="{
                required: 'El código postal es obligatorio',
                length: 'El código postal debe tener al menos 3 caracteres',
              }"
            />
          </div>
          <div>
            <FormKit
              type="select"
              label="País"
              name="country"
              placeholder="Seleccionar"
              v-model="store.payer.country"
              :options="[
                { label: 'Seleccionar', value: '', attrs: { disabled: true } },
                { label: 'Argentina', value: 'AR' },
                { label: 'Canadá', value: 'CA' },
                {
                  label: 'Chile',
                  value: 'CL',
                },
                {
                  label: 'Colombia',
                  value: 'CO',
                },
                {
                  label: 'Estados Unidos',
                  value: 'US',
                },
                {
                  label: 'España',
                  value: 'ES',
                },
                {
                  label: 'México',
                  value: 'MX',
                },
              ]"
              validation="required"
              validation-visibility="dirty"
              :validation-messages="{
                required: 'El país es obligatorio',
              }"
            />
          </div>
        </div>

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

    <!-- 🔒 OVERLAY DE CARGA -->
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
        <p class="font-semibold text-lg mb-1">Procesando tu pago...</p>
        <p class="text-sm text-gray-600">
          Por favor no cierres esta ventana ni recargues la página.
        </p>
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
