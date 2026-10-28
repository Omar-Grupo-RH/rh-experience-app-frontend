<script setup>
import { computed, ref, watch } from "vue";
import { useTravelStore } from "@/stores/admin/travelStore";
import PassengerIdentityModal from "./PassengerIdentityModal.vue";
import IdentityAdminAPI from "@/api/IdentityAdminAPI";

const props = defineProps({
  travels: {
    type: Array,
    required: true,
  },
});

const store = useTravelStore();

const selectedTravelId = ref("");
const selectedPassenger = ref(null);
const loading = ref(false);
const loadingStatuses = ref(false);
const error = ref("");
const documentStatuses = ref({});

const passengers = computed(() => store.passengersByTravelArray || []);

const completedCount = computed(
  () =>
    passengers.value.filter((p) => documentStatuses.value[p.id]?.has_identity)
      .length,
);

const getStatus = (passengerId) => {
  return documentStatuses.value[passengerId] || null;
};

const statusLabel = (passengerId) => {
  const doc = getStatus(passengerId);

  if (!doc) return "Sin consultar";
  if (!doc.has_identity) return "Sin INE";

  switch (doc.verification_status) {
    case "verified":
      return "Verificado";
    case "rejected":
      return "Rechazado";
    default:
      return "Pendiente de revisión";
  }
};

let loadVersion = 0;

async function loadPassengers() {
  const version = ++loadVersion;

  selectedPassenger.value = null;
  documentStatuses.value = {};
  error.value = "";

  if (!selectedTravelId.value) return;

  loading.value = true;

  try {
    await store.getPassengersByTravel(selectedTravelId.value);

    if (version !== loadVersion) return;

    loading.value = false;
    loadingStatuses.value = true;

    const results = await Promise.allSettled(
      passengers.value.map((passenger) =>
        IdentityAdminAPI.getDocument(passenger.id),
      ),
    );

    if (version !== loadVersion) return;

    const statuses = {};

    results.forEach((result, index) => {
      const passenger = passengers.value[index];

      if (result.status === "fulfilled") {
        statuses[passenger.id] = result.value;
      } else {
        statuses[passenger.id] = null;
      }
    });

    documentStatuses.value = statuses;
  } catch (err) {
    if (version !== loadVersion) return;

    error.value =
      err.response?.data?.message || "No se pudieron consultar los pasajeros.";
  } finally {
    if (version === loadVersion) {
      loading.value = false;
      loadingStatuses.value = false;
    }
  }
}

function handleUpdated(result) {
  const current = documentStatuses.value[result.passenger_id];

  if (!current) return;

  documentStatuses.value = {
    ...documentStatuses.value,
    [result.passenger_id]: {
      ...current,
      verification_status: result.verification_status,
    },
  };
}

watch(selectedTravelId, loadPassengers);
</script>

<template>
  <section
    class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
  >
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-slate-900">
        Identificaciones de pasajeros
      </h2>

      <p class="mt-1 text-sm text-slate-500">
        Consulta y verifica los INE registrados para cada RH Experience.
      </p>
    </div>

    <label
      for="identity-travel-select"
      class="mb-2 block text-sm font-bold text-slate-700"
    >
      Seleccionar viaje
    </label>

    <select
      id="identity-travel-select"
      v-model="selectedTravelId"
      class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-experience-blue sm:max-w-md"
    >
      <option value="">Selecciona un viaje</option>

      <option
        v-for="travel in travels"
        :key="travel.id"
        :value="String(travel.id)"
      >
        {{ travel.title }} — {{ travel.trip_date }}
      </option>
    </select>

    <div
      v-if="!selectedTravelId"
      class="mt-6 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500"
    >
      Selecciona un viaje para consultar sus identificaciones.
    </div>

    <div
      v-else-if="loading || loadingStatuses"
      class="mt-6 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500"
    >
      Cargando pasajeros y documentación...
    </div>

    <div v-else-if="error" class="mt-6 rounded-xl bg-red-50 p-5 text-red-700">
      {{ error }}

      <button
        class="ml-3 font-bold underline"
        type="button"
        @click="loadPassengers"
      >
        Reintentar
      </button>
    </div>

    <div v-else-if="selectedTravelId" class="mt-6">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm font-semibold text-slate-700">
          {{ completedCount }} de {{ passengers.length }}
          pasajeros con INE registrado
        </p>

        <button
          type="button"
          class="text-sm font-semibold text-experience-blue hover:underline"
          @click="loadPassengers"
        >
          Actualizar
        </button>
      </div>

      <div
        v-if="!passengers.length"
        class="rounded-xl bg-slate-50 p-8 text-center text-slate-500"
      >
        Este viaje todavía no tiene pasajeros registrados.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr class="text-left text-xs uppercase text-slate-500">
              <th class="px-4 py-3">Pasajero</th>
              <th class="px-4 py-3">Asiento</th>
              <th class="px-4 py-3">Estado INE</th>
              <th class="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            <tr v-for="passenger in passengers" :key="passenger.id">
              <td class="px-4 py-4">
                <p class="text-sm font-semibold text-slate-900">
                  {{ passenger.first_name }}
                  {{ passenger.last_name }}
                </p>

                <p class="text-xs text-slate-500">
                  {{ passenger.ticket_code }}
                </p>
              </td>

              <td class="px-4 py-4 text-sm text-slate-700">
                {{ passenger.seat_id }}
              </td>

              <td class="px-4 py-4">
                <span
                  class="rounded-full px-3 py-1 text-xs font-bold"
                  :class="{
                    'bg-green-100 text-green-700':
                      getStatus(passenger.id)?.verification_status ===
                      'verified',
                    'bg-red-100 text-red-700':
                      getStatus(passenger.id)?.verification_status ===
                      'rejected',
                    'bg-amber-100 text-amber-700':
                      getStatus(passenger.id)?.has_identity &&
                      getStatus(passenger.id)?.verification_status ===
                        'pending',
                    'bg-slate-100 text-slate-600': !getStatus(passenger.id)
                      ?.has_identity,
                  }"
                >
                  {{ statusLabel(passenger.id) }}
                </span>
              </td>

              <td class="px-4 py-4 text-right">
                <button
                  type="button"
                  class="rounded-lg border border-experience-blue px-4 py-2 text-xs font-bold text-experience-blue hover:bg-experience-blue hover:text-white"
                  @click="selectedPassenger = passenger"
                >
                  Ver documentación
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <PassengerIdentityModal
      v-if="selectedPassenger"
      :passenger="selectedPassenger"
      @close="selectedPassenger = null"
      @updated="handleUpdated"
    />
  </section>
</template>
