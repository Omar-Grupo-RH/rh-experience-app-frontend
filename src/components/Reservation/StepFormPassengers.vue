<script setup>
import { ref, watch } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import ResumeCard from "@/components/Reservation/ResumeCard.vue";

const store = useReservaStore();
const openPassengers = ref([0]);

const phoneCountryOptions = [
  { label: "México", value: "52" },
  { label: "EUA / Canadá", value: "1" }
];

const normalizePhoneDigits = (value = "") => {
  return String(value).replace(/\D/g, "").slice(0, 10);
};

const normalizePhoneCountryCode = (value = "") => {
  return String(value || "52").replace(/\D/g, "");
};

const syncPassengerPhone = (passenger) => {
  passenger.phone_country_code = normalizePhoneCountryCode(
    passenger.phone_country_code,
  );

  passenger.phone = normalizePhoneDigits(passenger.phone);
};

const handlePhoneInput = (event, passenger) => {
  const cleanPhone = normalizePhoneDigits(event.target.value);

  passenger.phone = cleanPhone;
  event.target.value = cleanPhone;
};

const handlePhoneCountryChange = (event, passenger) => {
  passenger.phone_touched = true;
  passenger.phone_country_code = normalizePhoneCountryCode(event.target.value);
};

const markPhoneTouched = (passenger) => {
  passenger.phone_touched = true;
};

const getPhoneError = (passenger) => {
  const phone = normalizePhoneDigits(passenger.phone);

  if (!phone) {
    return "Teléfono obligatorio";
  }

  if (phone.length !== 10) {
    return "Debe tener 10 dígitos";
  }

  return "";
};

const hasPhoneError = (passenger) => {
  return Boolean(getPhoneError(passenger));
};

watch(
  () => store.passengers,
  (passengers) => {
    passengers.forEach((passenger) => {
      syncPassengerPhone(passenger);
    });
  },
  {
    immediate: true,
    deep: true,
  },
);

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
  field = "allergies",
  clearInput = true,
  target = null,
) => {
  if (!rawValue?.trim()) return;

  const tags = normalizeTags(rawValue);

  passenger[field] = Array.from(
    new Set([...(passenger[field] || []), ...tags]),
  );

  if (clearInput && target) {
    target.value = "";
  }
};

const handleAllergyInput = (event, passenger) => {
  const value = event.target.value;

  if (!value.includes(",")) return;

  addTagsToPassenger(passenger, value, "allergies", true, event.target);
};

const handleAllergyEnter = (event, passenger) => {
  event.preventDefault();

  addTagsToPassenger(
    passenger,
    event.target.value,
    "allergies",
    true,
    event.target,
  );
};

const handleAllergyBlur = (event, passenger) => {
  addTagsToPassenger(
    passenger,
    event.target.value,
    "allergies",
    true,
    event.target,
  );
};

const handleHealthConditionInput = (event, passenger) => {
  const value = event.target.value;

  if (!value.includes(",")) return;

  addTagsToPassenger(passenger, value, "health_conditions", true, event.target);
};

const handleHealthConditionEnter = (event, passenger) => {
  event.preventDefault();

  addTagsToPassenger(
    passenger,
    event.target.value,
    "health_conditions",
    true,
    event.target,
  );
};

const handleHealthConditionBlur = (event, passenger) => {
  addTagsToPassenger(
    passenger,
    event.target.value,
    "health_conditions",
    true,
    event.target,
  );
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
                  class="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer bg-white transition hover:bg-slate-50"
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

                    <div class="w-full">
                      <label
                        class="mb-1 block text-sm font-bold text-slate-700"
                      >
                        Teléfono
                      </label>

                      <div class="flex gap-0">
                        <!-- Lada -->
                        <div class="relative w-[92px] shrink-0">
                          <select
                            :value="p.phone_country_code || '52'"
                            class="h-11 w-full cursor-pointer appearance-none rounded-l-lg border border-slate-300 bg-white px-3 pr-8 text-sm font-bold text-slate-700 outline-none transition focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
                            @change="handlePhoneCountryChange($event, p)"
                          >
                            <option
                              v-for="option in phoneCountryOptions"
                              :key="`${option.label}-${option.value}`"
                              :value="option.value"
                            >
                              +{{ option.value }}
                            </option>
                          </select>
                        </div>

                        <!-- Teléfono -->
                        <div class="min-w-0 flex-1">
                          <input
                            type="tel"
                            name="phone"
                            :value="p.phone || ''"
                            inputmode="numeric"
                            pattern="[0-9]*"
                            maxlength="10"
                            autocomplete="tel-national"
                            placeholder="10 dígitos"
                            class="h-11 w-full rounded-r-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
                            :class="{
                              'border-rose-400 focus:border-rose-400 focus:ring-rose-100':
                                p.phone_touched && hasPhoneError(p),
                            }"
                            @input="handlePhoneInput($event, p)"
                            @keydown="
                              [
                                'Backspace',
                                'Delete',
                                'Tab',
                                'ArrowLeft',
                                'ArrowRight',
                              ].includes($event.key) ||
                              /^[0-9]$/.test($event.key)
                                ? null
                                : $event.preventDefault()
                            "
                            @paste.prevent="
                              p.phone = normalizePhoneDigits(
                                $event.clipboardData.getData('text'),
                              )
                            "
                            @blur="markPhoneTouched(p)"
                          />
                        </div>
                      </div>

                      <p
                        v-if="p.phone_touched && hasPhoneError(p)"
                        class="mt-1.5 text-sm text-red-500"
                      >
                        {{ getPhoneError(p) }}
                      </p>

                      <p
                        v-else-if="p.phone && p.phone.length === 10"
                        class="mt-1.5 text-xs font-medium text-slate-500"
                      >
                        Lada:
                        <span class=" text-experience-blue">
                          +{{ p.phone_country_code || "52" }}
                        </span>
                        · Teléfono:
                        <span class="font-bold text-experience-blue">
                          {{ p.phone }}
                        </span>
                      </p>
                    </div>

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
                      <label class="block font-medium text-gray-700 mb-1">
                        Alergias separadas por coma
                      </label>

                      <input
                        type="text"
                        class="w-full outline-none border border-slate-200 bg-white rounded-md p-2 text-sm transition focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
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

                    <div class="mb-2 md:col-span-2">
                      <label class="block font-medium text-gray-700 mb-1">
                        Problemas de salud separados por coma
                      </label>

                      <input
                        type="text"
                        class="w-full outline-none border border-slate-200 bg-white rounded-md p-2 text-sm transition focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
                        @input="handleHealthConditionInput($event, p)"
                        @keydown.enter="handleHealthConditionEnter($event, p)"
                        @blur="handleHealthConditionBlur($event, p)"
                        placeholder="Ej. asma, diabetes, presión alta"
                      />

                      <div class="flex flex-wrap gap-2 mt-2">
                        <span
                          v-for="(tag, hidx) in p.health_conditions"
                          :key="hidx"
                          class="bg-blue-100 text-experience-blue text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"
                        >
                          {{ tag }}

                          <button
                            type="button"
                            class="text-red-500 hover:text-red-700 cursor-pointer"
                            @click="p.health_conditions.splice(hidx, 1)"
                          >
                            ✕
                          </button>
                        </span>
                      </div>
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
