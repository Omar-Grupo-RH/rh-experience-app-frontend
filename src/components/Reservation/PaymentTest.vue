<script setup>
import { loadStripe } from "@stripe/stripe-js";
import { ref, onMounted } from "vue";

const stripePromise = loadStripe(import.meta.env.VITE_PUBLISHABLE_KEY_STRIPE);

const loading = ref(false);
let  cardElement, stripe;

onMounted(async () => {
  stripe = await stripePromise;
  const elementsObj = stripe.elements();
  cardElement = elementsObj.create("card");
  cardElement.mount("#card-element");
});

async function pay() {
  loading.value = true;

  // 🔹 1. Crear PaymentIntent desde backend
  const res = await fetch("http://localhost:4000/api/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 2000 }), // $20.00 USD
  });
  const data = await res.json();

  // 🔹 2. Confirmar el pago con Stripe
  const { error } = await stripe.confirmCardPayment(data.clientSecret, {
    payment_method: {
      card: cardElement,
    },
  });

  if (error) {
    console.log(error)
  } else {
    alert("✅ Pago exitoso");
  }

  loading.value = false;
}
</script>

<template>
  <div class="payment-container">
    <h2>Pagar con tarjeta</h2>
    <div id="card-element"></div>
    <button @click="pay" :disabled="loading">
      {{ loading ? "Procesando..." : "Pagar" }}
    </button>
  </div>
</template>



<style scoped>
.payment-container {
  max-width: 400px;
  margin: 50px auto;
}
#card-element {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 15px;
}
</style>
