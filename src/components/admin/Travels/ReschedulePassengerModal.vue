<script setup>
import { computed, reactive, watch, ref } from "vue";
import { formatDateToSpanish } from "@/utils/formatDate";
import { useTravel } from "@/composables/useTravel";
import BusSeatSelector from "@/components/Reservation/BusSeatSelector.vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  passenger: {
    type: Object,
    default: null,
  },
  currentTripId: {
    type: Number,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "save"]);

const { listTravels } = useTravel();

const trips = ref([]);
const selectedTripId = ref(null);
const selectedSeatId = ref(null);
const isLoadingTrips = ref(false);

const form = reactive({
  passenger_id: "",
  current_trip_id: "",
  new_trip_id: "",
  new_seat_id: "",
});

const title = computed(() => {
  if (!props.passenger) return "Reagendar pasajero";

  const fullName = `${props.passenger.first_name || ""} ${
    props.passenger.last_name || ""
  }`.trim();

  return fullName || "Reagendar pasajero";
});

const availableTrips = computed(() => {
  return trips.value.filter((trip) => {
    // No mostrar el viaje actual
    if (Number(trip.id) === Number(props.currentTripId)) {
      return false;
    }

    // Solo mostrar viajes futuros con espacio disponible
    return trip.avaible_seats > 0;
  });
});

const selectedTrip = computed(() => {
  return trips.value.find((t) => Number(t.id) === Number(selectedTripId.value));
});

const hasFormErrors = computed(() => {
  return !selectedTripId.value || !selectedSeatId.value || props.isLoading;
});

watch(
  () => props.passenger,
  (passenger) => {
    if (!passenger) return;

    form.passenger_id = passenger.id || "";
    form.current_trip_id = props.currentTripId || "";
    form.new_trip_id = "";
    form.new_seat_id = "";
    selectedTripId.value = null;
    selectedSeatId.value = null;
  },
  {
    immediate: true,
  },
);

watch(selectedTripId, (newTripId) => {
  form.new_trip_id = Number(newTripId) || "";
  selectedSeatId.value = null; // Resetear asiento cuando cambia el tour
});

watch(selectedSeatId, (newSeatId) => {
  form.new_seat_id = newSeatId || "";
});

const loadTrips = async () => {
  isLoadingTrips.value = true;
  try {
    const data = await listTravels();
    trips.value = data || [];
  } catch (error) {
    console.error(error);
  } finally {
    isLoadingTrips.value = false;
  }
};

watch(
  () => props.show,
  (isShowing) => {
    if (isShowing && trips.value.length === 0) {
      loadTrips();
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  if (hasFormErrors.value) {
    return;
  }

  const payload = {
    passenger_id: form.passenger_id,
    current_trip_id: form.current_trip_id,
    new_trip_id: form.new_trip_id,
    new_seat_id: form.new_seat_id,
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
            class="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 relative"
          >
            <!-- Overlay de carga -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-if="isLoading"
                class="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-white/95 backdrop-blur-sm"
              >
                <div class="flex flex-col items-center gap-4">
                  <svg
                    class="animate-spin h-12 w-12 text-experience-blue"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>

                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>

                  <div class="text-center">
                    <p class="text-lg font-semibold text-slate-900">
                      Procesando reagendado...
                    </p>

                    <p class="mt-2 text-sm text-slate-600">
                      Estamos actualizando la reservación y notificando al
                      cliente
                    </p>
                  </div>
                </div>
              </div>
            </Transition>

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
                  Selecciona un nuevo tour y un asiento disponible.
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
              <div class="space-y-6">
                <!-- Tours disponibles -->
                <div>
                  <label class="mb-3 block text-sm font-bold text-slate-700">
                    Tours disponibles
                  </label>

                  <div class="grid gap-3">
                    <div
                      v-if="isLoadingTrips"
                      class="rounded-lg bg-slate-50 p-4 text-center text-slate-500"
                    >
                      Cargando tours...
                    </div>

                    <div
                      v-else-if="availableTrips.length === 0"
                      class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-slate-500"
                    >
                      No hay tours disponibles para reagendar
                    </div>

                    <button
                      v-for="trip in availableTrips"
                      :key="trip.id"
                      type="button"
                      class="flex items-center justify-between rounded-lg border-2 p-4 text-left transition"
                      :class="
                        selectedTripId === trip.id
                          ? 'border-experience-blue bg-experience-blue/5'
                          : 'border-slate-200 hover:border-experience-blue/50 hover:bg-slate-50'
                      "
                      @click="selectedTripId = Number(trip.id)"
                    >
                      <div>
                        <p class="font-semibold text-slate-900">
                          {{ trip.title }}
                        </p>

                        <p class="mt-1 text-sm text-slate-500">
                          Fecha:
                          <span class="font-medium text-slate-900">
                            {{ formatDateToSpanish(trip.trip_date) }}
                          </span>
                        </p>

                        <p class="mt-1 text-sm text-slate-500">
                          Asientos disponibles:
                          <span
                            class="font-bold"
                            :class="
                              trip.avaible_seats > 0
                                ? 'text-experience-green'
                                : 'text-red-500'
                            "
                          >
                            {{ trip.avaible_seats }}
                          </span>
                          /{{ trip.total_seats }}
                        </p>
                      </div>

                      <div
                        v-if="selectedTripId === trip.id"
                        class="ml-4 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-experience-blue text-white"
                      >
                        ✓
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Selector de asientos -->
                <div v-if="selectedTrip" class="space-y-3">
                  <label class="block text-sm font-bold text-slate-700">
                    Selecciona un asiento
                  </label>

                  <div
                    class="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div class="overflow-x-auto">
                      <BusSeatSelector
                        :selected-trip-id="Number(selectedTripId)"
                        @seat-selected="selectedSeatId = $event"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4"
            >
              <button
                type="button"
                class="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-100 focus:ring-2 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isLoading"
                @click="$emit('close')"
              >
                Cancelar
              </button>

              <button
                type="button"
                class="rounded-lg px-5 py-2.5 text-sm font-medium text-white outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                :class="
                  hasFormErrors
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-experience-blue hover:bg-experience-blue/90'
                "
                :disabled="hasFormErrors"
                @click="handleSubmit"
              >
                Reagendar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
html,
body,
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Edge viejo / IE */
}

html::-webkit-scrollbar,
body::-webkit-scrollbar,
*::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}
</style>
