<script setup>
import { computed, reactive, watch } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  passenger: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "save"]);

const form = reactive({
  id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone_country_code: "52",
  phone: "",
  city: "",
  born_date: "",
  allergies: [],
  health_conditions: [],
});

const phoneCountryOptions = [
  { label: "México", value: "52" },
  { label: "EUA / Canadá", value: "1" },
];

const normalizePhoneDigits = (value = "") => {
  return String(value).replace(/\D/g, "").slice(0, 10);
};

const normalizeCountryCode = (value = "") => {
  const cleanValue = String(value || "52").replace(/\D/g, "");
  return cleanValue || "52";
};

const parseArrayField = (value) => {
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const normalizeTags = (value) => {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const addTagsToForm = (
  rawValue,
  field = "allergies",
  clearInput = true,
  target = null,
) => {
  if (!rawValue?.trim()) return;

  const tags = normalizeTags(rawValue);

  form[field] = Array.from(new Set([...(form[field] || []), ...tags]));

  if (clearInput && target) {
    target.value = "";
  }
};

const handleAllergyInput = (event) => {
  const value = event.target.value;

  if (!value.includes(",")) return;

  addTagsToForm(value, "allergies", true, event.target);
};

const handleAllergyEnter = (event) => {
  event.preventDefault();

  addTagsToForm(event.target.value, "allergies", true, event.target);
};

const handleAllergyBlur = (event) => {
  addTagsToForm(event.target.value, "allergies", true, event.target);
};

const handleHealthConditionInput = (event) => {
  const value = event.target.value;

  if (!value.includes(",")) return;

  addTagsToForm(value, "health_conditions", true, event.target);
};

const handleHealthConditionEnter = (event) => {
  event.preventDefault();

  addTagsToForm(event.target.value, "health_conditions", true, event.target);
};

const handleHealthConditionBlur = (event) => {
  addTagsToForm(event.target.value, "health_conditions", true, event.target);
};

const title = computed(() => {
  if (!props.passenger) return "Editar pasajero";

  const fullName = `${props.passenger.first_name || ""} ${
    props.passenger.last_name || ""
  }`.trim();

  return fullName || "Editar pasajero";
});

const getAge = (date) => {
  if (!date) return 0;

  const birthDate = new Date(`${date}T00:00:00`);
  const today = new Date();

  if (Number.isNaN(birthDate.getTime())) return 0;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const firstNameError = computed(() => {
  const value = form.first_name.trim();

  if (!value) {
    return "El nombre es obligatorio";
  }

  if (value.length < 3) {
    return "El nombre debe tener al menos 3 caracteres";
  }

  return "";
});

const lastNameError = computed(() => {
  const value = form.last_name.trim();

  if (!value) {
    return "El apellido es obligatorio";
  }

  if (value.length < 3) {
    return "El apellido debe tener al menos 3 caracteres";
  }

  return "";
});

const emailError = computed(() => {
  const value = form.email.trim();

  if (!value) {
    return "El correo es obligatorio";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "El correo no es válido";
  }

  return "";
});

const phoneError = computed(() => {
  const phone = normalizePhoneDigits(form.phone);

  if (!phone) {
    return "El teléfono es obligatorio";
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    return "El teléfono debe tener 10 dígitos";
  }

  return "";
});

const cityError = computed(() => {
  const value = form.city.trim();

  if (!value) {
    return "La ciudad es obligatoria";
  }

  if (value.length < 3) {
    return "La ciudad debe tener al menos 3 caracteres";
  }

  return "";
});

const bornDateError = computed(() => {
  if (!form.born_date) {
    return "La fecha de nacimiento es obligatoria";
  }

  const birthDate = new Date(`${form.born_date}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return "La fecha de nacimiento no es válida";
  }

  if (getAge(form.born_date) < 18) {
    return "El pasajero debe ser mayor de 18 años";
  }

  return "";
});

const hasFormErrors = computed(() => {
  return Boolean(
    firstNameError.value ||
      lastNameError.value ||
      emailError.value ||
      phoneError.value ||
      cityError.value ||
      bornDateError.value,
  );
});

watch(
  () => props.passenger,
  (passenger) => {
    if (!passenger) return;

    form.id = passenger.id || "";
    form.first_name = passenger.first_name || "";
    form.last_name = passenger.last_name || "";
    form.email = passenger.email || "";
    form.phone_country_code = normalizeCountryCode(
      passenger.phone_country_code,
    );
    form.phone = normalizePhoneDigits(passenger.phone);
    form.city = passenger.city || "";
    form.born_date = passenger.born_date || "";
    form.allergies = parseArrayField(passenger.allergies);
    form.health_conditions = parseArrayField(passenger.health_conditions);
  },
  {
    immediate: true,
  },
);

const handlePhoneInput = (event) => {
  const cleanPhone = normalizePhoneDigits(event.target.value);

  form.phone = cleanPhone;
  event.target.value = cleanPhone;
};

const handleSubmit = () => {
  if (hasFormErrors.value) {
    return;
  }

  const payload = {
    id: form.id,
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim(),
    phone_country_code: normalizeCountryCode(form.phone_country_code),
    phone: normalizePhoneDigits(form.phone),
    city: form.city.trim(),
    born_date: form.born_date,
    allergies: form.allergies,
    health_conditions: form.health_conditions,
  };

  emit("save", payload);
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <Transition
          appear
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="translate-y-4 scale-95 opacity-0"
          enter-to-class="translate-y-0 scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 scale-100 opacity-100"
          leave-to-class="translate-y-4 scale-95 opacity-0"
        >
          <div
            class="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
          >
            <div
              class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5"
            >
              <div>
                <p
                  class="text-sm font-semibold uppercase tracking-[0.18em] text-experience-blue"
                >
                  RH Experience
                </p>

                <h3 class="mt-1 text-2xl font-black text-slate-900">
                  {{ title }}
                </h3>

                <p class="mt-1 text-sm text-slate-500">
                  Actualiza la información básica del pasajero.
                </p>
              </div>

              <button
                type="button"
                class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                aria-label="Cerrar modal"
                @click="$emit('close')"
              >
                ✕
              </button>
            </div>

            <div class="max-h-[75vh] overflow-y-auto px-6 py-6">
              <FormKit
                type="form"
                id="editPassengerForm"
                :actions="false"
                :classes="{
                  message: 'hidden',
                }"
                @submit="handleSubmit"
              >
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <FormKit
                      type="text"
                      name="first_name"
                      label="Nombre(s)"
                      v-model="form.first_name"
                      placeholder="Ej. Juan"
                    />

                    <p
                      v-if="firstNameError"
                      class="-mt-2 text-sm font-medium text-red-500"
                    >
                      {{ firstNameError }}
                    </p>
                  </div>

                  <div>
                    <FormKit
                      type="text"
                      name="last_name"
                      label="Apellido(s)"
                      v-model="form.last_name"
                      placeholder="Ej. Pérez"
                    />

                    <p
                      v-if="lastNameError"
                      class="-mt-2 text-sm font-medium text-red-500"
                    >
                      {{ lastNameError }}
                    </p>
                  </div>

                  <div>
                    <FormKit
                      type="email"
                      name="email"
                      label="Correo electrónico"
                      v-model="form.email"
                      placeholder="ejemplo@correo.com"
                    />

                    <p
                      v-if="emailError"
                      class="-mt-2 text-sm font-medium text-red-500"
                    >
                      {{ emailError }}
                    </p>
                  </div>

                  <div>
                    <label class="mb-1 block text-sm font-bold text-slate-700">
                      Teléfono
                    </label>

                    <div class="flex gap-0">
                      <div class="relative w-[92px] shrink-0">
                        <select
                          v-model="form.phone_country_code"
                          class="h-11 w-full cursor-pointer appearance-none rounded-l-lg border border-slate-300 bg-white px-3 pr-8 text-sm font-bold text-slate-700 outline-none transition focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
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

                      <div class="min-w-0 flex-1">
                        <input
                          type="tel"
                          name="phone"
                          :value="form.phone || ''"
                          inputmode="numeric"
                          pattern="[0-9]*"
                          maxlength="10"
                          autocomplete="tel-national"
                          placeholder="10 dígitos"
                          class="h-11 w-full rounded-r-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
                          :class="{
                            'border-red-400 focus:border-red-400 focus:ring-red-100':
                              phoneError,
                          }"
                          @input="handlePhoneInput"
                          @keydown="
                            [
                              'Backspace',
                              'Delete',
                              'Tab',
                              'ArrowLeft',
                              'ArrowRight',
                            ].includes($event.key) || /^[0-9]$/.test($event.key)
                              ? null
                              : $event.preventDefault()
                          "
                          @paste.prevent="
                            form.phone = normalizePhoneDigits(
                              $event.clipboardData.getData('text'),
                            )
                          "
                        />
                      </div>
                    </div>

                    <p
                      v-if="phoneError"
                      class="mt-1.5 text-sm font-medium text-red-500"
                    >
                      {{ phoneError }}
                    </p>

                    <p
                      v-else-if="form.phone.length === 10"
                      class="mt-1.5 text-xs font-medium text-slate-500"
                    >
                      Lada:
                      <span class="text-experience-blue">
                        +{{ form.phone_country_code }}
                      </span>
                      · Teléfono:
                      <span class="font-bold text-experience-blue">
                        {{ form.phone }}
                      </span>
                    </p>
                  </div>

                  <div>
                    <FormKit
                      type="date"
                      name="born_date"
                      label="Fecha de nacimiento"
                      v-model="form.born_date"
                    />

                    <p
                      v-if="bornDateError"
                      class="-mt-2 text-sm font-medium text-red-500"
                    >
                      {{ bornDateError }}
                    </p>
                  </div>

                  <div>
                    <FormKit
                      type="text"
                      name="city"
                      label="Ciudad"
                      v-model="form.city"
                      placeholder="Mérida"
                    />

                    <p
                      v-if="cityError"
                      class="-mt-2 text-sm font-medium text-red-500"
                    >
                      {{ cityError }}
                    </p>
                  </div>

                  <div class="mb-2 md:col-span-2">
                    <label class="mb-1 block font-medium text-gray-700">
                      Alergias separadas por coma
                    </label>

                    <input
                      type="text"
                      class="w-full rounded-md border border-slate-200 bg-white p-2 text-sm outline-none transition focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
                      @input="handleAllergyInput"
                      @keydown.enter="handleAllergyEnter"
                      @blur="handleAllergyBlur"
                      placeholder="Ej. mariscos, cacahuate"
                    />

                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        v-for="(tag, aidx) in form.allergies"
                        :key="aidx"
                        class="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-experience-blue"
                      >
                        {{ tag }}

                        <button
                          type="button"
                          class="cursor-pointer text-red-500 hover:text-red-700"
                          @click="form.allergies.splice(aidx, 1)"
                        >
                          ✕
                        </button>
                      </span>

                      <span
                        v-if="form.allergies.length === 0"
                        class="text-xs italic text-slate-400"
                      >
                        Sin alergias registradas
                      </span>
                    </div>
                  </div>

                  <div class="mb-2 md:col-span-2">
                    <label class="mb-1 block font-medium text-gray-700">
                      Problemas de salud separados por coma
                    </label>

                    <input
                      type="text"
                      class="w-full rounded-md border border-slate-200 bg-white p-2 text-sm outline-none transition focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
                      @input="handleHealthConditionInput"
                      @keydown.enter="handleHealthConditionEnter"
                      @blur="handleHealthConditionBlur"
                      placeholder="Ej. asma, diabetes, presión alta"
                    />

                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        v-for="(tag, hidx) in form.health_conditions"
                        :key="hidx"
                        class="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-experience-blue"
                      >
                        {{ tag }}

                        <button
                          type="button"
                          class="cursor-pointer text-red-500 hover:text-red-700"
                          @click="form.health_conditions.splice(hidx, 1)"
                        >
                          ✕
                        </button>
                      </span>

                      <span
                        v-if="form.health_conditions.length === 0"
                        class="text-xs italic text-slate-400"
                      >
                        Sin condiciones de salud registradas
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
                >
                  <button
                    type="button"
                    class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    @click="$emit('close')"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    :disabled="hasFormErrors"
                    class="inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white transition sm:w-auto"
                    :class="
                      hasFormErrors
                        ? 'cursor-not-allowed bg-slate-300 opacity-70'
                        : 'cursor-pointer bg-experience-blue hover:bg-experience-blue/90'
                    "
                  >
                    Guardar cambios
                  </button>
                </div>
              </FormKit>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>