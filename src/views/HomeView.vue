<script setup>
import Menu from "@/components/Navigation/Menu.vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import TermsCondModal from "@/components/Reservation/TermsCondModal.vue";
import Comments from "@/components/Comments/Comments.vue";
import StepDate from "@/components/Reservation/StepDate.vue";
import StepFormPassengers from "@/components/Reservation/StepFormPassengers.vue";
import StepConfirmData from "@/components/Reservation/StepConfirmData.vue";
import StepConfirm from "@/components/Reservation/StepConfirm.vue";
import StepsContainer from "@/components/Reservation/StepsContainer.vue";
import StepSeats from "@/components/Reservation/StepSeats.vue";

const store = useReservaStore();
</script>

<template>
  <main class="min-h-screen">
    <Menu v-if="store.step === 1" />
    <section class="relative">
      <div class="flex justify-center relative">
        <div class="rounded-2xl w-[95%] xl:w-[70%] mt-10 py-5 pb-10 relative">
          <div class="max-w-7xl mx-auto space-y-6">
            <StepsContainer />

            <!-- Paso 1 -->
            <div
              v-if="store.step === 1"
              class="bg-white p-3 lg:p-10 rounded-lg w-full h-auto shadow-sm space-y-4"
            >
              <StepDate />
            </div>
            <!-- Paso 2 -->
            <div
              v-if="store.step === 2"
              class="bg-white p-3 lg:p-10 rounded-lg w-full h-auto shadow-sm space-y-4"
            >
              <StepSeats />
            </div>
            <!-- Paso 3 -->
            <div
              v-else-if="store.step === 3"
              class="bg-white p-3 lg:p-10 rounded-lg shadow-sm"
            >
              <StepFormPassengers />
            </div>

            <!-- Paso 4 -->
            <div
              v-else-if="store.step === 4"
              class="bg-white p-3 lg:p-10 rounded-lg shadow-sm"
            >
              <StepConfirmData />
            </div>

            <!-- Paso 5 -->
            <div
              v-else-if="store.step === 5"
              class="bg-white p-3 lg:p-10 rounded-lg shadow-sm"
            >
              <StepConfirm />
            </div>
          </div>
        </div>
      </div>
      <TermsCondModal :isVisible="store.modal" />
    </section>

    <div
      class="rounded-2xl w-[95%] xl:w-[70%] lg:mt-10 lg:py-5 lg:pb-10 relative mx-auto"
      v-if="store.step === 1"
    >
      <Comments />
    </div>
  </main>
</template>
