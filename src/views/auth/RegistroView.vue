<script setup>
import { inject, ref } from "vue";
import { RouterLink } from "vue-router";
import { reset } from "@formkit/vue";
import AuthAPI from "@/api/AuthAPI";
import { useRouter } from "vue-router";

const toast = inject("toast");
const router = useRouter();

const form = ref({
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  password: "",
  allergies: [],
  born_date: "",
});

const allergiesInput = ref("");
function pushAllergies(...rawTags) {
  const existing = new Set(
    form.value.allergies.map((a) => a.trim().toLowerCase())
  );

  const toAdd = rawTags
    .flat()
    .map((t) => (t ?? "").trim())
    .filter(Boolean);

  // agrega sólo los que no existan (comparando en lower)
  for (const tag of toAdd) {
    const key = tag.toLowerCase();
    if (!existing.has(key)) {
      form.value.allergies.push(tag);
      existing.add(key);
    }
  }
}

function handleAllergiesInput(e) {
  const v = e.target.value;
  if (v.includes(",")) {
    const tags = v
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    pushAllergies(tags);
    allergiesInput.value = "";
  }
}

function commitAllergyOnBlur() {
  const v = allergiesInput.value.trim();
  if (v) {
    pushAllergies(v);
    allergiesInput.value = "";
  }
}

function removeAllergy(i) {
  form.value.allergies.splice(i, 1);
}

const handleSubmit = async (formData) => {
  const payload = {
    ...formData,
    first_name: formData.first_name.trim(),
    last_name: formData.last_name.trim(),
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim(),
    password: formData.password,
    born_date: formData.born_date,
    allergies: JSON.stringify(form.value.allergies ?? []),
  };

  try {
    // 1) Registrar
     await AuthAPI.register(payload);
    toast.open({
      message: "Registro exitoso inicia sesion",
      type: "success",
    });
    reset("registerForm");
    router.push({ name: "login" });
  } catch (error) {
    const { response } = error;
    response.data.errors.forEach((msg) => {
      toast.open({
        message: msg,
        type: "error",
      });
    });
  }
};
</script>

<template>
  <div class="grid md:grid-cols-2 h-dvh">
    <div
      class="h-full flex justify-center items-center bg-experience-green relative"
    >
      <div
        class="w-full h-full absolute inset-0 overflow-hidden pointer-events-none"
      >
        <img
          src="/images/textura2.svg"
          alt="Textura de experience"
          class="w-full h-full object-cover opacity-50 pointer-events-none"
        />
      </div>

      <div
        class="p-5 md:p-10 rounded-2xl shadow md:w-[80%] bg-experience-white relative"
      >
        <h2
          class="text-xl md:text-2xl mb-5 uppercase xl:text-3xl font-semibold text-center"
        >
          Crear cuenta
        </h2>
        <FormKit
          type="form"
          submit-label="Crear cuenta"
          id="registerForm"
          :actions="false"
          incomplete-message="No se pudo enviar, revisa las notificaciones"
          @submit="handleSubmit"
        >
          <FormKit
            type="text"
            label="Nombre(s)"
            name="first_name"
            placeholder="John"
            validation="required|length:3"
            v-model="form.first_name"
            :validation-messages="{
              required: 'El nombre es obligatorio',
            }"
          />
          <FormKit
            type="text"
            label="Apellido(s)"
            name="last_name"
            placeholder="Doe"
            v-model="form.last_name"
            validation="required|length:3"
            :validation-messages="{
              required: 'El apellido es obligatorio',
            }"
          />
          <FormKit
            type="date"
            label="Fecha de nacimiento"
            name="born_date"
            v-model="form.born_date"
            placeholder="Selecciona tu fecha de nacimiento"
            validation="required|date"
            :validation-messages="{
              required: 'La fecha de nacimiento es obligatoria',
              date: 'Fecha no valida',
            }"
          />

          <!-- Campo de alergias -->
          <div class="mb-4">
            <label
              for="allergies_input"
              class="block font-medium text-gray-700 mb-1"
            >
              Alergias (separadas por coma)
            </label>

            <input
              id="allergies_input"
              type="text"
              v-model="allergiesInput"
              @blur="commitAllergyOnBlur"
              @input="handleAllergiesInput"
              placeholder="Ej. mariscos, cacahuate, gluten"
              class="w-full outline-none border-0 bg-gray-50 rounded-md p-2 text-sm"
            />

            <!-- Chips visuales -->
            <div class="flex flex-wrap gap-2 mt-2">
              <span
                v-for="(allergy, index) in form.allergies"
                :key="index"
                class="bg-blue-100 text-experience-pink text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"
              >
                {{ allergy }}
                <button
                  type="button"
                  class="text-red-500 hover:text-red-700 cursor-pointer"
                  @click="removeAllergy(index)"
                >
                  ✕
                </button>
              </span>
            </div>
          </div>

          <FormKit
            type="email"
            label="Correo electrónico"
            name="email"
            v-model="form.email"
            placeholder="Ingresa tu correo electronico"
            validation="required|email"
            :validation-messages="{
              required: 'El correo electronico es obligatorio',
              email: 'Email no valido',
            }"
          />
          <FormKit
            type="tel"
            label="Teléfono"
            name="phone"
            v-model="form.phone"
            placeholder="Ingresa tu numero telefonico"
            validation="required|matches:/^[0-9]{10}$/"
            :validation-messages="{
              required: 'El numero telefonico es obligatorio',
              matches: 'El numero telefonico debe tener 10 digitos solamente.',
            }"
          />
          <FormKit
            type="password"
            label="Contraseña"
            v-model="form.password"
            name="password"
            placeholder="Ingresa tu contraseña - Min 8 caracteres"
            validation="required|length:8"
            :validation-messages="{
              required: 'La contraseña es obligatoria',
              length: 'La contraseña debe contener al menos 8 caracteres',
            }"
          />
          <FormKit type="submit">Crear cuenta</FormKit>
        </FormKit>

        <div class="mt-5">
          <p>
            Ya cuentas con una cuenta? Inicia sesion
            <RouterLink
              :to="{ name: 'login' }"
              class="underline text-experience-blue"
              >aquí.</RouterLink
            >
          </p>
          <p>
            No necesitas cuenta para disfrutar la experiencia, compra tus
            boletos
            <RouterLink
              :to="{ name: 'home' }"
              class="underline text-experience-blue"
              >aquí.</RouterLink
            >
          </p>
        </div>
      </div>
    </div>

    <div class="hidden md:block h-full w-full overflow-hidden relative">
      <img
        src="/images/registro-image.webp"
        class="w-full h-full object-cover"
        alt="Moises lanzodose desde la tiroleza"
      />
      <img
        src="/logos/Recurso8.svg"
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        alt=""
      />
    </div>
  </div>
</template>
