<script setup>
import { useClientStore } from "@/stores/admin/clientStore";
import { ref } from "vue";
import { useRouter } from "vue-router";

const clientStore = useClientStore();
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

// helper para evitar duplicados (case-insensitive)
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
    await clientStore.addClient(payload);
    form.value = {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
      allergies: [],
      born_date: "",
    };
    router.push({ name: "clients" });
  } catch (error) {
    console.error("Error adding client:", error);
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-5 space-y-10">
    <div class="flex flex-col gap-2">
      <div class="space-y-0.5">
        <h2 class="text-4xl font-semibold">Agregar Nuevo Cliente</h2>
        <p class="text-gray-400">
          Llena el formulario para agregar un nuevo cliente
        </p>
      </div>
      <RouterLink
        :to="{ name: 'clients' }"
        class="bg-experience-pink w-fit text-white px-4 py-2 rounded cursor-pointer shadow"
      >
        Regresar
      </RouterLink>
    </div>

    <div class="rounded-lg max-w-4xl mx-auto shadow bg-white p-10">
      <div class="max-w-2xl mx-auto">
        <FormKit
          type="form"
          submit-label="Crear cuenta"
          id="new-client-form"
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

          <FormKit type="submit">Guardar Cliente</FormKit>
        </FormKit>
      </div>
    </div>
  </div>
</template>
