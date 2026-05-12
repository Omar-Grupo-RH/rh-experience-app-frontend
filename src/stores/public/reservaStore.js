// src/stores/public/reservaStore.js
import { defineStore, storeToRefs } from "pinia";
import { ref, computed, watch, inject } from "vue";

import { useSeatsStore } from "./seatsStore";
import { useEventsStore } from "./eventsStore";

import {
  validatePassengers,
  validateEmails,
  validatePayer,
} from "@/composables/usePassengerValidation";

export const useReservaStore = defineStore("reserva", () => {
  const seats = useSeatsStore();
  const evts = useEventsStore();

  const { selectedSeats, selectedTripId, date, passengers, pricePerSeat } =
    storeToRefs(seats);

  const { events } = storeToRefs(evts);

  const toast = inject("toast");
  const step = ref(1);
  const aceptedTerms = ref(false);
  const modal = ref(false);
  //const subtotal = ref(0);

  const emailSendTickets = ref({
    emailSent: "",
    confirmEmail: "",
    nameSent: "",
  });

  const payer = ref({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    is_client: false,
    advisor_name: "",
    is_first_visit: false,
  });

  const validationErrors = ref([]);

  /**
   * NUEVO:
   * Tipo de inscripción
   *
   * Valores posibles:
   * internal  = Personal interno / Comunidad RH
   * alliance  = Alianzas
   * investor  = Inversionistas
   * prospect  = Clientes prospectos
   * prize     = Premios
   */
  const registrationType = ref("");

  const registrationData = ref({
    // Personal interno
    area_code: "",

    // Alianzas
    alliance_name: "",
    alliance_code: "",

    // Inversionistas
    development: "",
    stage: "",
    lot_number: "",

    // Clientes prospectos
    advisor_name: "",
    advisor_code: "",
    origin: "",
    origin_alliance_name: "",

    // Premios
    prize_code: "",
  });

  const extraPassenger = ref({
    full_name: "",
    email: "",
    phone: "",
    birthdate: "",
  });

  const registrationTypes = [
    {
      value: "internal",
      title: "Personal interno",
      description: "Para Comunidad RH con código de área.",
      free: true,
      allowsExtra: false,
    },
    {
      value: "alliance",
      title: "Alianzas",
      description: "Para aliados con código correspondiente.",
      free: true,
      allowsExtra: false,
    },
    {
      value: "investor",
      title: "Inversionistas",
      description: "Para inversionistas o propietarios de desarrollos RH.",
      free: true,
      allowsExtra: true,
    },
    {
      value: "prospect",
      title: "Clientes prospectos",
      description: "Para personas interesadas en algún desarrollo.",
      free: false,
      allowsExtra: false,
    },
    {
      value: "prize",
      title: "Premios",
      description: "Para personas con código otorgado por RH Experience.",
      free: true,
      allowsExtra: true,
    },
  ];

  const currentRegistrationType = computed(() => {
    return registrationTypes.find(
      (type) => type.value === registrationType.value,
    );
  });

  const isFreeRegistration = computed(() => {
    return ["internal", "alliance", "investor", "prize"].includes(
      registrationType.value,
    );
  });

  const requiresPayment = computed(() => {
    return registrationType.value === "prospect";
  });

  const requiresExtraPassenger = computed(() => {
    return ["investor", "prize"].includes(registrationType.value);
  });

  const maxPassengers = computed(() => {
    if (requiresExtraPassenger.value) return 2;

    return 1;
  });

  const registrationPricePerPerson = computed(() => {
    if (registrationType.value === "prospect") return 800;

    return 0;
  });

  const registrationTotal = computed(() => {
    if (!requiresPayment.value) return 0;

    const seatsCount = selectedSeats.value.length || 1;

    return seatsCount * registrationPricePerPerson.value;
  });

  const canContinueRegistrationType = computed(() => {
    return Boolean(registrationType.value);
  });

  const canContinueRegistrationValidation = computed(() => {
    const data = registrationData.value;

    if (registrationType.value === "internal") {
      return Boolean(data.area_code.trim());
    }

    if (registrationType.value === "alliance") {
      return Boolean(data.alliance_name.trim() && data.alliance_code.trim());
    }

    if (registrationType.value === "investor") {
      return Boolean(
        data.development.trim() && data.stage.trim() && data.lot_number.trim(),
      );
    }

    if (registrationType.value === "prospect") {
      const baseValid = Boolean(
        data.development.trim() &&
        data.advisor_name.trim() &&
        data.advisor_code.trim() &&
        data.origin.trim(),
      );

      if (data.origin === "alianza") {
        return Boolean(baseValid && data.origin_alliance_name.trim());
      }

      return baseValid;
    }

    if (registrationType.value === "prize") {
      return Boolean(data.prize_code.trim());
    }

    return false;
  });

  const maxStep = computed(() => {
    return 6;
  });

  function setRegistrationType(type) {
    registrationType.value = type;

    registrationData.value = {
      area_code: "",
      alliance_name: "",
      alliance_code: "",
      development: "",
      stage: "",
      lot_number: "",
      advisor_name: "",
      advisor_code: "",
      origin: "",
      origin_alliance_name: "",
      prize_code: "",
    };

    extraPassenger.value = {
      full_name: "",
      email: "",
      phone: "",
      birthdate: "",
    };
  }

  function resetRegistration() {
    registrationType.value = "";

    registrationData.value = {
      area_code: "",
      alliance_name: "",
      alliance_code: "",
      development: "",
      stage: "",
      lot_number: "",
      advisor_name: "",
      advisor_code: "",
      origin: "",
      origin_alliance_name: "",
      prize_code: "",
    };

    extraPassenger.value = {
      full_name: "",
      email: "",
      phone: "",
      birthdate: "",
    };
  }

  const _passengersValidation = validatePassengers(passengers, selectedSeats);
  const allAdults = computed(() => _passengersValidation.value.allAdults);
  const requiredFieldsFilled = computed(
    () => _passengersValidation.value.requiredFilled,
  );

  const sameEmails = validateEmails(emailSendTickets);

  const validatePayerForm = validatePayer(payer);

  // Sincroniza errores para depuración/UI
  watch(
    _passengersValidation,
    (v) => {
      validationErrors.value = v.errors.slice();
    },
    { immediate: true },
  );

  const validationState = computed(() => ({
    allAdults: allAdults.value,
    requiredFieldsFilled: requiredFieldsFilled.value,
    canContinuePassengers: false,
    lastErrors: validationErrors.value.slice(),
  }));

  const canContinuePassengers = computed(() => {
    const ok = allAdults.value && requiredFieldsFilled.value;
    validationState.value.canContinuePassengers = ok;
    return ok;
  });

  const canPay = computed(() => {
    return validatePayerForm.value && aceptedTerms.value;
  });

  // ---------- Eventos (fachada con mismos nombres)
  async function loadEvents() {
    try {
      await evts.loadEvents();
    } catch (err) {
      console.error("No se pudieron cargar los eventos", err);
    }
  }

  async function seatsSold(id) {
    return await evts.seatsSold(id);
  }

  // ---------- Navegación y reset (misma API)
  const next = () => step.value < maxStep.value && step.value++;
  const prev = () => step.value > 1 && step.value--;

  function reset() {
    step.value = 1;
    seats.resetSeats();
    resetRegistration();
  }

  // ---------- Exposición (MISMO contrato público)
  return {
    // State
    step,
    selectedSeats,
    selectedTripId,
    date,
    passengers,
    events,
    aceptedTerms,
    emailSendTickets,
    modal,
    payer,

    // Nuevo state
    registrationType,
    registrationData,
    registrationTypes,
    extraPassenger,

    // Getters
    canContinuePassengers,
    canPay,
    allAdults,
    sameEmails,
    validationErrors,

    // Nuevos getters
    currentRegistrationType,
    isFreeRegistration,
    requiresPayment,
    requiresExtraPassenger,
    maxPassengers,
    registrationPricePerPerson,
    registrationTotal,
    canContinueRegistrationType,
    canContinueRegistrationValidation,
    maxStep,

    // Actions
    next,
    prev,
    reset,
    setDate: seats.setDate,
    loadEvents,
    toggleSeat: seats.toggleSeat,
    seatsSold,

    // Nuevas actions
    setRegistrationType,
    resetRegistration,
  };
});
