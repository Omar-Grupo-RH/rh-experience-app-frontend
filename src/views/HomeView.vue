<script setup>
import Menu from "@/components/Navigation/Menu.vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import TermsCondModal from "@/components/Reservation/TermsCondModal.vue";
import StepDate from "@/components/Reservation/StepDate.vue";
import StepFormPassengers from "@/components/Reservation/StepFormPassengers.vue";
import StepConfirm from "@/components/Reservation/StepConfirm.vue";
import StepsContainer from "@/components/Reservation/StepsContainer.vue";
import StepSeats from "@/components/Reservation/StepSeats.vue";
import StepRegistrationType from "@/components/Reservation/StepRegistrationType.vue";
import StepRegistrationValidation from "@/components/Reservation/StepRegistrationValidation.vue";

import { useAuth } from "@/composables/useAuth";
const store = useReservaStore();
const { isAuthenticated, user, adminLevel, hydrateFromToken } = useAuth();
</script>

<template>
  <main class="min-h-screen bg-white">
    <Menu v-if="isAuthenticated" />
  <section class="relative w-full">
  <div class="flex justify-center relative w-full">
    <div class="rounded-2xl relative w-full">
      <div class="max-w-7xl mx-auto w-full space-y-6 mt-5">
        <StepsContainer />

        <!-- Paso 1-->
        <div
          v-if="store.step === 1"
          class="bg-white p-3 lg:p-10 rounded-lg w-full min-h-[70dvh] space-y-4"
        >
          <StepRegistrationType />
        </div>

        <!-- Paso 2-->
        <div
          v-else-if="store.step === 2"
          class="bg-white p-3 lg:p-10 rounded-lg w-full min-h-[70dvh] space-y-4"
        >
          <StepRegistrationValidation />
        </div>

        <!-- Paso 3-->
        <div
          v-else-if="store.step === 3"
          class="bg-white p-3 lg:p-10 rounded-lg w-full min-h-[70dvh] space-y-4"
        >
          <StepDate />
        </div>

        <!-- Paso 4 -->
        <div
          v-else-if="store.step === 4"
          class="bg-white p-3 lg:p-10 rounded-lg w-full min-h-[70dvh] space-y-4"
        >
          <StepSeats />
        </div>

        <!-- Paso 5 -->
        <div
          v-else-if="store.step === 5"
          class="bg-white p-3 lg:p-10 rounded-lg w-full"
        >
          <StepFormPassengers />
        </div>

        <!-- Paso 6 -->
        <div
          v-else-if="store.step === 6"
          class="bg-white p-3 lg:p-10 rounded-lg w-full"
        >
          <StepConfirm />
        </div>
      </div>
    </div>
  </div>

  <TermsCondModal :isVisible="store.modal" />
</section>
  </main>
</template>
