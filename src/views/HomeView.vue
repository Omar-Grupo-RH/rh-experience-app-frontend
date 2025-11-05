<script setup>
import Menu from "@/components/Navigation/Menu.vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import TermsCondModal from "@/components/Reservation/TermsCondModal.vue";
import Comments from "@/components/Comments/Comments.vue";
import StepDateVue from "@/components/Reservation/StepDateSeats.vue";
import StepFormPassengers from "@/components/Reservation/stepFormPassengers.vue";
import StepConfirmData from "@/components/Reservation/StepConfirmData.vue";
import StepPayTickets from "@/components/Reservation/StepPayTickets.vue";

const store = useReservaStore();
</script>

<template>
  <main>
    <Menu />
    <section class="relative">
      <div class="flex justify-center relative">
        <div class="rounded-2xl w-[95%] xl:w-[80%] mt-10 py-5 pb-10 relative">
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
              class="bg-white p-4 rounded-lg w-full h-auto shadow-sm space-y-4"
            >
              <StepDateVue />
            </div>

            <!-- Paso 2: N Pasajeros -->
            <div
              v-else-if="store.step === 2"
              class="bg-white p-10 rounded-lg shadow-sm"
            >
              <StepFormPassengers />
            </div>

            <!-- Paso 3 -->
            <div
              v-else-if="store.step === 3"
              class="bg-white p-10 rounded-lg shadow-sm"
            >
              <StepConfirmData />
            </div>

            <!-- Paso 4 -->
            <div
              v-else-if="store.step === 4"
              class="bg-white p-4 rounded-lg shadow-sm"
            >
              <StepPayTickets />
            </div>
          </div>
        </div>
      </div>
      <TermsCondModal :isVisible="store.modal" />
    </section>

    <div class="lg:mt-10" v-if="store.step === 1">
      <Comments />
    </div>
  </main>
</template>


