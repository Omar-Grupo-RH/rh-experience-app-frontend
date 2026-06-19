<script setup>
import { computed, onMounted } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";

const store = useReservaStore();

const developments = [
  "RHEVO",
  "PLAYAR",
  "Gran Verona",
  "Cal & Canto",
  "Playa Clara",
];

const title = computed(() => {
  const titles = {
    internal: "Validación de personal interno",
    alliance: "Validación de alianza",
    investor: "Datos de inversionista",
    prospect: "Datos de cliente prospecto",
    prize: "Validación de premio",
    family_friend: "Validación de datos",
  };

  return titles[store.registrationType] || "Validación";
});

const description = computed(() => {
  const descriptions = {
    internal: "Ingresa el código de área otorgado por tu líder o jefx de área.",
    alliance:
      "Selecciona la alianza correspondiente e ingresa el código asignado.",
    investor:
      "Completa los datos de tu desarrollo, etapa y lote para continuar.",
    prospect:
      "Completa los datos del desarrollo de interés y del asesor que te atiende.",
    prize:
      "Ingresa el código otorgado por RH Experience para validar tu premio.",
    family_friend: "Ingresa el código de área de tu familiar o amigo.",
  };

  return descriptions[store.registrationType] || "";
});

const handleNext = async () => {
  if (!store.canContinueRegistrationValidation) return;

  await store.validateRegistrationAndNext();
};

onMounted(async () => {
  if (!store.allianceOptions.length) {
    await store.loadAllianceCodes();
  }
});
</script>

<template>
  <div class="w-full max-w-3xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-2xl lg:text-4xl font-bold uppercase">
        {{ title }}
      </h1>

      <p class="text-gray-500 mt-3 max-w-2xl mx-auto">
        {{ description }}
      </p>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-5 lg:p-8">
      <!-- Personal interno -->
      <div v-if="store.registrationType === 'internal'" class="space-y-5">
        <label class="block">
          <span class="font-semibold text-gray-800"> Código de área </span>

          <input
            v-model="store.registrationData.area_code"
            type="text"
            class="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20 uppercase"
            placeholder="Ej. RH-MKT-2026"
          />
        </label>

        <div class="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
          La primera visita es gratis, a partir de la segunda tendrá un costo de
          $500 MXN.
        </div>
      </div>

      <!-- Alianzas -->
      <div v-if="store.registrationType === 'alliance'">
        <div class="space-y-5" v-if="store.allianceOptions.length >= 1">
          <label class="block">
            <span class="font-semibold text-gray-800">
              Nombre de la alianza
            </span>

            <select
              v-model="store.registrationData.alliance_name"
              class="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
              :disabled="store.loadingAllianceCodes"
            >
              <option value="">
                {{
                  store.loadingAllianceCodes
                    ? "Cargando alianzas..."
                    : "Selecciona una alianza"
                }}
              </option>

              <option
                v-for="alliance in store.allianceOptions"
                :key="alliance.id"
                :value="alliance.name"
              >
                {{ alliance.name }}
              </option>
            </select>
          </label>

          <label class="block">
            <span class="font-semibold text-gray-800"> Código de alianza </span>

            <input
              v-model="store.registrationData.alliance_code"
              type="text"
              class="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
              placeholder="Ingresa el código correspondiente"
            />
          </label>

          <div class="rounded-xl bg-green-50 p-4 text-sm text-green-700">
            Esta inscripción no tiene costo.
          </div>
        </div>
        <div v-else>
          <p class="text-center text-gray-400 text-sm">
            No existen alianzas registradas aún
          </p>
        </div>
      </div>

      <!-- Inversionistas -->
      <div v-if="store.registrationType === 'investor'" class="space-y-5">
        <label class="block">
          <span class="font-semibold text-gray-800"> Desarrollo </span>

          <select
            v-model="store.registrationData.development"
            class="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
          >
            <option value="">Selecciona un desarrollo</option>
            <option
              v-for="development in developments"
              :key="development"
              :value="development"
            >
              {{ development }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="font-semibold text-gray-800"> Etapa </span>

          <input
            v-model="store.registrationData.stage"
            type="text"
            class="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
            placeholder="Ej. Etapa 1"
          />
        </label>

        <label class="block">
          <span class="font-semibold text-gray-800"> Número de lote </span>

          <input
            v-model="store.registrationData.lot_number"
            type="text"
            class="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
            placeholder="Ej. Lote 24"
          />
        </label>

        <div class="rounded-xl bg-green-50 p-4 text-sm text-green-700">
          Esta inscripción no tiene costo e incluye hasta 2 personas.
        </div>
      </div>

      <!-- Clientes prospectos -->
      <div v-if="store.registrationType === 'prospect'" class="space-y-5">
        <label class="block">
          <span class="font-semibold text-gray-800">
            Desarrollo de interés
          </span>

          <select
            v-model="store.registrationData.development"
            class="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
          >
            <option value="">Selecciona un desarrollo</option>
            <option
              v-for="development in developments"
              :key="development"
              :value="development"
            >
              {{ development }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="font-semibold text-gray-800">
            Asesor/a que te atiende
          </span>

          <input
            v-model="store.registrationData.advisor_name"
            type="text"
            class="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
            placeholder="Nombre del asesor o asesora"
          />
        </label>

        <label class="block">
          <span class="font-semibold text-gray-800"> Código del asesor/a </span>

          <input
            v-model="store.registrationData.advisor_code"
            type="text"
            class="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
            placeholder="Código del asesor"
          />
        </label>

        <label class="block">
          <span class="font-semibold text-gray-800">
            ¿Cómo llegaste a RH Experience?
          </span>

          <select
            v-model="store.registrationData.origin"
            class="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
          >
            <option value="">Selecciona una opción</option>
            <option value="alianza">Vengo de una alianza</option>
            <option value="directo_rh">Vengo directo de RH</option>
          </select>
        </label>

        <label v-if="store.registrationData.origin === 'alianza'" class="block">
          <span class="font-semibold text-gray-800">
            Nombre de la alianza
          </span>

          <select
            v-model="store.registrationData.origin_alliance_name"
            class="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
            :disabled="store.loadingAllianceCodes"
          >
            <option value="">
              {{
                store.loadingAllianceCodes
                  ? "Cargando alianzas..."
                  : "Selecciona una alianza"
              }}
            </option>

            <option
              v-for="alliance in store.allianceOptions"
              :key="alliance.id"
              :value="alliance.name"
            >
              {{ alliance.name }}
            </option>
          </select>
        </label>

        <div class="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
          Esta inscripción tiene un costo de $1,500 MXN por persona. Al
          finalizar se generará una ficha de pago.
        </div>
      </div>

      <!-- Premios -->
      <div v-if="store.registrationType === 'prize'" class="space-y-5">
        <label class="block">
          <span class="font-semibold text-gray-800"> Código de premio </span>

          <input
            v-model="store.registrationData.prize_code"
            type="text"
            class="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20"
            placeholder="Ingresa el código otorgado por RH Experience"
          />
        </label>

        <div class="rounded-xl bg-green-50 p-4 text-sm text-green-700">
          Esta inscripción no tiene costo e incluye hasta 2 personas.
        </div>
      </div>

      <!--Familiares o amigos-->
      <div v-if="store.registrationType === 'family_friend'" class="space-y-5">
        <label class="block">
          <span class="font-semibold text-gray-800"> Código de área </span>

          <input
            v-model="store.registrationData.area_code"
            type="text"
            class="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/20 uppercase"
            placeholder="Ej. RH-MKT-2026"
          />
        </label>

        <div class="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
          Esta inscripción tiene un costo de $500 MXN por persona. Al finalizar
          se generará una ficha de pago.
        </div>
      </div>
    </div>

    <div class="mt-8 flex flex-col md:flex-row gap-3 justify-between">
      <button
        type="button"
        class="px-6 py-3 rounded-md cursor-pointer bg-gray-200 text-gray-800 font-medium w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="store.validatingRegistrationCode"
        @click="store.prev"
      >
        Regresar
      </button>

      <button
        type="button"
        class="px-6 py-3 rounded-md cursor-pointer bg-experience-blue text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
        :disabled="
          !store.canContinueRegistrationValidation ||
          store.validatingRegistrationCode
        "
        @click="handleNext"
      >
        <span v-if="store.validatingRegistrationCode"> Validando... </span>

        <span v-else> Siguiente </span>
      </button>
    </div>
  </div>
</template>
