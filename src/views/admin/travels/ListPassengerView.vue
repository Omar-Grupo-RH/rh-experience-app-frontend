<script setup>
import { formatDateToSpanish } from "@/utils/formatDate";
import { generatePassengersPDF } from "@/utils/generatePassengersPDF";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import EditPassengerModal from "@/components/admin/Travels/EditPassengerModal.vue";
import ReschedulePassengerModal from "@/components/admin/Travels/ReschedulePassengerModal.vue";
import PassengerCard from "@/components/admin/Travels/PassengerCard.vue";
import { useTravelStore } from "@/stores/admin/travelStore";
import { useAuth } from "@/composables/useAuth";

const { adminLevel } = useAuth();

const route = useRoute();
const store = useTravelStore();

const expandedPassengerIds = ref([]);
const ticketSearch = ref("");
const openMenuPassengerId = ref(null);
const showEditPassengerModal = ref(false);
const showReschedulePassengerModal = ref(false);
const selectedPassenger = ref(null);
const isRescheduling = ref(false);

onMounted(async () => {
  try {
    await store.getPassengersByTravel(Number(route.params.id));
  } catch (error) {
    console.log(error);
  }
});

const passengers = computed(() => store.passengersByTravelArray || []);

const normalizeTicketCode = (value = "") => {
  return String(value)
    .replace(/^RH-/i, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .trim();
};

const handleTicketSearchInput = (event) => {
  ticketSearch.value = normalizeTicketCode(event.target.value);
};

const clearTicketSearch = () => {
  ticketSearch.value = "";
};

const filteredPassengers = computed(() => {
  const search = normalizeTicketCode(ticketSearch.value);

  if (!search) return passengers.value;

  return passengers.value.filter((passenger) => {
    const ticketCode = normalizeTicketCode(passenger.ticket_code || "");
    return ticketCode.includes(search);
  });
});

const displayedPassengersCount = computed(() => {
  return filteredPassengers.value.length;
});

const isPassengerExpanded = (id) => {
  return expandedPassengerIds.value.includes(id);
};

const togglePassenger = (id) => {
  if (expandedPassengerIds.value.includes(id)) {
    expandedPassengerIds.value = expandedPassengerIds.value.filter(
      (item) => item !== id,
    );
    return;
  }

  expandedPassengerIds.value.push(id);
};

const isPassengerMenuOpen = (id) => {
  return openMenuPassengerId.value === id;
};

const togglePassengerMenu = (id) => {
  openMenuPassengerId.value = openMenuPassengerId.value === id ? null : id;
};

const closePassengerMenu = () => {
  openMenuPassengerId.value = null;
};

const closeEditPassengerModal = () => {
  showEditPassengerModal.value = false;
  selectedPassenger.value = null;
};

const closeReschedulePassengerModal = () => {
  showReschedulePassengerModal.value = false;
  selectedPassenger.value = null;
};

const editPassenger = (passenger) => {
  closePassengerMenu();

  selectedPassenger.value = {
    ...passenger,
  };

  showEditPassengerModal.value = true;
};

const reschedulePassenger = (passenger) => {
  closePassengerMenu();

  selectedPassenger.value = {
    ...passenger,
  };

  showReschedulePassengerModal.value = true;
};

const handleUpdatePassenger = async (payload) => {
  const wasUpdated = await store.updatePassengerInfoStore(payload);

  if (wasUpdated) {
    closeEditPassengerModal();
  }
};

const handleReschedulePassenger = async (payload) => {
  isRescheduling.value = true;
  try {
    const wasRescheduled = await store.reschedulePassengerStore(payload);

    if (wasRescheduled) {
      closeReschedulePassengerModal();
    }
  } finally {
    isRescheduling.value = false;
  }
};

const resendPassengerEmail = async (passenger) => {
  closePassengerMenu();

  await store.resendPassengerTicketsStore(passenger.id);
};

const generatePDF = async () => {
  await generatePassengersPDF({
    passengers: filteredPassengers.value,
    travelSelected: store.travelSelected,
    ticketSearch: ticketSearch.value,
  });
};
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-8 lg:p-5">
    <div
      class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div class="space-y-1">
        <h2 class="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Listado de pasajeros
        </h2>

        <p class="text-sm font-normal text-slate-500 sm:text-base">
          Administra la información de pasajeros por RH Experience.
        </p>
      </div>

      <RouterLink
        :to="{ name: 'travels' }"
        class="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-experience-blue px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-experience-blue/90 hover:shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>

        Regresar
      </RouterLink>
    </div>

    <div
      v-if="store.hasPassengersByTravel"
      class="space-y-6 rounded-xl bg-white p-4 sm:p-6"
      @click="closePassengerMenu"
    >
      <div class="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-100">
        <div
          class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h2 class="text-3xl font-semibold text-experience-pink sm:text-4xl">
              RH EXPERIENCE
            </h2>

            <p class="mt-3 text-sm font-normal text-slate-500">
              Fecha de salida
            </p>

            <p class="text-lg font-medium text-slate-800">
              {{
                formatDateToSpanish(
                  store.travelSelected?.trip_date ||
                    store.travelSelected?.[0]?.trip_date ||
                    "",
                )
              }}
            </p>

            <button
              class="mt-3 inline-flex cursor-pointer items-center justify-center rounded-lg bg-experience-pink px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
              type="button"
              @click="generatePDF"
            >
              📥 Descargar PDF
            </button>
          </div>
        </div>
      </div>

      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h3 class="text-2xl font-semibold text-slate-900">
            Pasajeros
            <span class="font-medium text-experience-blue">
              ({{ displayedPassengersCount }})
            </span>
          </h3>

          <p
            v-if="ticketSearch"
            class="mt-1 text-sm font-medium text-slate-400"
          >
            Filtrando por código:
            <span class="text-experience-pink">RH-{{ ticketSearch }}</span>
          </p>
        </div>

        <div class="flex w-full items-center gap-2 sm:w-auto">
          <label
            class="relative block w-full sm:w-80"
            aria-label="Buscar por código de boleto"
          >
            <span
              class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                />
              </svg>
            </span>

            <span
              class="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-sm font-black text-experience-blue"
            >
              RH-
            </span>

            <input
              :value="ticketSearch"
              type="search"
              inputmode="text"
              autocomplete="off"
              placeholder="B95FFAE8"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-20 pr-4 text-sm font-bold uppercase text-slate-700 outline-none transition placeholder:font-medium placeholder:text-slate-300 focus:border-experience-pink focus:bg-white focus:ring-2 focus:ring-experience-pink/10"
              @input="handleTicketSearchInput"
            />
          </label>

          <button
            v-if="ticketSearch"
            type="button"
            class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            @click="clearTicketSearch"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div class="grid gap-4">
        <div
          v-if="!filteredPassengers.length"
          class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"
        >
          <p class="font-semibold text-slate-900">
            No se encontró ningún pasajero con ese código.
          </p>

          <p class="mt-1 text-sm text-slate-500">
            Revisa que el código sea correcto. Ejemplo:
            <span class="font-bold text-experience-pink">RH-B95FFAE8</span>
          </p>
        </div>

        <PassengerCard
          v-for="p in filteredPassengers"
          :key="p.id"
          :passenger="p"
          :admin-level="adminLevel"
          :is-expanded="isPassengerExpanded(p.id)"
          :is-menu-open="isPassengerMenuOpen(p.id)"
          @toggle="togglePassenger"
          @toggle-menu="togglePassengerMenu"
          @edit="editPassenger"
          @confirm-payment="store.tooglePayment"
          @reschedule-passenger="reschedulePassenger"
          @resend-email="resendPassengerEmail"
        />
      </div>
    </div>

    <div
      v-else
      class="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"
    >
      <p class="font-normal text-slate-500">
        No hay pasajeros registrados para este RH EXPERIENCE.
      </p>
    </div>

    <EditPassengerModal
      :show="showEditPassengerModal"
      :passenger="selectedPassenger"
      @close="closeEditPassengerModal"
      @save="handleUpdatePassenger"
    />

    <ReschedulePassengerModal
      :show="showReschedulePassengerModal"
      :passenger="selectedPassenger"
      :current-trip-id="Number(route.params.id)"
      :is-loading="isRescheduling"
      @close="closeReschedulePassengerModal"
      @save="handleReschedulePassenger"
    />
  </div>
</template>
