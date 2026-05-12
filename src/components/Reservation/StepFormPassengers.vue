<script setup>
import { ref } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import ResumeCard from "@/components/Reservation/ResumeCard.vue";
import { formatDateToSpanish } from "@/utils/formatDate";

const store = useReservaStore();
const openPassengers = ref([0]);

const togglePassenger = (idx) => {
  if (openPassengers.value.includes(idx)) {
    openPassengers.value = openPassengers.value.filter((i) => i !== idx);
  } else {
    openPassengers.value.push(idx);
  }
};

const adult = ({ value }) => {
  if (!value) return false;
  const birthDate = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age >= 18;
};

const normalizeTags = (value) => {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const addTagsToPassenger = (
  passenger,
  rawValue,
  clearInput = true,
  target = null,
) => {
  if (!rawValue?.trim()) return;

  const tags = normalizeTags(rawValue);

  passenger.allergies = Array.from(
    new Set([...(passenger.allergies || []), ...tags]),
  );

  if (clearInput && target) {
    target.value = "";
  }
};

const handleAllergyInput = (event, passenger) => {
  const value = event.target.value;

  if (!value.includes(",")) return;

  addTagsToPassenger(passenger, value, true, event.target);
};

const handleAllergyEnter = (event, passenger) => {
  event.preventDefault();
  addTagsToPassenger(passenger, event.target.value, true, event.target);
};

const handleAllergyBlur = (event, passenger) => {
  addTagsToPassenger(passenger, event.target.value, true, event.target);
};
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="w-full flex flex-col gap-5 lg:flex-row items-start lg:gap-10">
      <div class="w-full lg:max-w-xl lg:flex-2">
        <FormKit type="form" :actions="false">
          <div class="space-y-6">
            <FormKit
              v-for="(p, idx) in store.passengers"
              :key="p.seat"
              type="group"
              :name="`passengers[${idx}]`"
              :label="`Pasajero ${String(idx + 1).padStart(2, '0')} — Asiento ${
                p.seat
              }`"
              label-class="block font-medium text-gray-800 mb-2"
              :value="p"
            >
              <div class="rounded-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  class="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer bg-white"
                  @click="togglePassenger(idx)"
                >
                  <div class="min-w-0">
                    <p class="font-semibold text-2xl">
                      Pasajero
                      <span class="font-normal">{{ idx + 1 }}</span>
                    </p>

                    <p class="font-semibold text-xl">
                      Asiento
                      <span class="font-normal">{{ p.seat }}</span>
                    </p>
                  </div>

                  <span
                    class="w-8 h-8 flex items-center justify-center shrink-0 text-2xl leading-none transition-transform duration-200"
                    :class="{ 'rotate-180': openPassengers.includes(idx) }"
                  >
                    ⌄
                  </span>
                </button>

                <div v-show="openPassengers.includes(idx)" class="p-4 pt-0">
                  <div class="grid md:grid-cols-2 gap-4 mt-5">
                    <FormKit
                      type="text"
                      name="first_name"
                      label="Nombre(s)"
                      v-model="p.first_name"
                      placeholder="Jhon"
                      validation="required|length:3"
                      :validation-messages="{
                        required: 'El nombre es obligatorio',
                        length: 'El nombre debe tener al menos 3 caracteres',
                      }"
                    />
                    <FormKit
                      type="text"
                      name="last_name"
                      label="Apellido(s)"
                      v-model="p.last_name"
                      placeholder="Doe"
                      validation="required|length:3"
                      :validation-messages="{
                        required: 'El apellido es obligatorio',
                        length: 'El apellido debe tener al menos 3 caracteres',
                      }"
                    />
                    <FormKit
                      type="email"
                      name="email"
                      label="Correo electrónico"
                      v-model="p.email"
                      placeholder="ejemplo@correo.com"
                      validation="required|email"
                      :validation-messages="{
                        required: 'Correo obligatorio',
                        email: 'Email no válido',
                      }"
                    />
                    <FormKit
                      type="tel"
                      name="phone"
                      label="Teléfono"
                      v-model="p.phone"
                      placeholder="10 dígitos"
                      validation="required|matches:/^[0-9]{10}$/"
                      :validation-messages="{
                        required: 'Teléfono obligatorio',
                        matches: 'Debe tener 10 dígitos',
                      }"
                    />
                    <FormKit
                      type="date"
                      name="born_date"
                      label="Fecha de nacimiento"
                      v-model="p.born_date"
                      placeholder="AAAA-MM-DD"
                      validation="required|date|adult"
                      validation-visibility="live"
                      :validation-messages="{
                        required: 'Fecha obligatoria',
                        date: 'Fecha no válida',
                        adult: 'Debes ser mayor de edad (18 años o más)',
                      }"
                      :validation-rules="{ adult }"
                    />
                    <FormKit
                      type="text"
                      name="city"
                      label="Ciudad"
                      v-model="p.city"
                      placeholder="Mérida"
                      validation="required|length:3"
                      :validation-messages="{
                        required: 'La ciudad es obligatoria',
                        length: 'La ciudad debe tener al menos 3 caracteres',
                      }"
                    />
                    <div class="mb-2 md:col-span-2">
                      <label class="block font-medium text-gray-700 mb-1"
                        >Alergias (separadas por coma)</label
                      >
                      <input
                        type="text"
                        class="w-full outline-none border-0 bg-white rounded-md p-2 text-sm"
                        @input="handleAllergyInput($event, p)"
                        @keydown.enter="handleAllergyEnter($event, p)"
                        @blur="handleAllergyBlur($event, p)"
                        placeholder="Ej. mariscos, cacahuate"
                      />
                      <div class="flex flex-wrap gap-2 mt-2">
                        <span
                          v-for="(tag, aidx) in p.allergies"
                          :key="aidx"
                          class="bg-blue-100 text-experience-blue text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"
                        >
                          {{ tag }}
                          <button
                            type="button"
                            class="text-red-500 hover:text-red-700 cursor-pointer"
                            @click="p.allergies.splice(aidx, 1)"
                          >
                            ✕
                          </button>
                        </span>
                      </div>
                    </div>

                    <FormKit
                      type="checkbox"
                      name="is_visitor"
                      label="¿Es cliente de Grupo RH?"
                      v-model="p.is_client"
                    />

                    <FormKit
                      type="checkbox"
                      name="is_first_visit"
                      label="¿Es su primera visita?"
                      v-model="p.is_first_visit"
                    />

                    <div class="md:col-span-2">
                      <FormKit
                        type="text"
                        name="advisor_name"
                        label="Nombre del asesor"
                        v-model="p.advisor_name"
                        placeholder="Jhon Doe"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FormKit>
          </div>

          <div class="flex justify-between mt-6"></div>
        </FormKit>
      </div>

      <ResumeCard
        next-label="Continuar"
        :disabled-next="!store.canContinuePassengers"
        :show-adult-error="true"
      />
    </div>
  </div>
</template>
