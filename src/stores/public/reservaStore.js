// src/stores/public/reservaStore.js
import { defineStore, storeToRefs } from "pinia";
import { ref, computed, watch, inject } from "vue";

import { useSeatsStore } from "./seatsStore";
import { useEventsStore } from "./eventsStore";

import { validatePassengers } from "@/composables/usePassengerValidation";
import CodesAPI from "@/api/CodesAPI";

export const useReservaStore = defineStore("reserva", () => {
  const seats = useSeatsStore();
  const evts = useEventsStore();

  const { selectedSeats, selectedTripId, date, passengers } =
    storeToRefs(seats);

  const { events } = storeToRefs(evts);

  const toast = inject("toast");

  const step = ref(1);
  const aceptedTerms = ref(false);
  const modal = ref(false);

  const validationErrors = ref([]);

  const validatingRegistrationCode = ref(false);
  const registrationCodeValid = ref(null);
  const registrationCodeMessage = ref("");
  const registrationCodeData = ref(null);
  const allianceCodes = ref([]);
  const loadingAllianceCodes = ref(false);
  const registrationType = ref("");

  const registrationData = ref({
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

    return selectedSeats.value.length * registrationPricePerPerson.value;
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

  const requiresBackendCodeValidation = computed(() => {
    return ["internal", "alliance", "prize", "prospect"].includes(registrationType.value);
  });

  const registrationCodeToValidate = computed(() => {
    const data = registrationData.value;

    if (registrationType.value === "internal") {
      return {
        type: "department",
        code: data.area_code,
      };
    }

    if (registrationType.value === "alliance") {
      return {
        type: "alliance",
        code: data.alliance_code,
      };
    }

    if (registrationType.value === "prize") {
      return {
        type: "discount",
        code: data.prize_code,
      };
    }
    if (registrationType.value === "prospect") {
      return {
        type: "internal",
        code: data.advisor_code,
      };
    }

    return null;
  });

  const maxStep = computed(() => {
    return 6;
  });

  const allianceOptions = computed(() => {
    return allianceCodes.value.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
    }));
  });

  async function loadAllianceCodes() {
    try {
      loadingAllianceCodes.value = true;

      const { data } = await CodesAPI.allCodes({
        type: "alliance",
      });

      allianceCodes.value = data.data ?? [];
    } catch (error) {
      console.error("Error al cargar alianzas:", error);
      allianceCodes.value = [];

      toast?.open?.({
        message: "No se pudieron cargar las alianzas.",
        type: "error",
      });
    } finally {
      loadingAllianceCodes.value = false;
    }
  }

  function resetRegistrationCodeValidation() {
    registrationCodeValid.value = null;
    registrationCodeMessage.value = "";
    registrationCodeData.value = null;
  }

  async function validateRegistrationCode() {
    resetRegistrationCodeValidation();

    if (!canContinueRegistrationValidation.value) {
      registrationCodeValid.value = false;
      registrationCodeMessage.value =
        "Completa los campos requeridos antes de continuar.";
      return false;
    }

    if (!requiresBackendCodeValidation.value) {
      registrationCodeValid.value = true;
      registrationCodeMessage.value = "";
      return true;
    }

    const params = registrationCodeToValidate.value;

    if (!params?.type || !params?.code?.trim()) {
      registrationCodeValid.value = false;
      registrationCodeMessage.value = "Ingresa un código válido.";
      return false;
    }

    try {
      validatingRegistrationCode.value = true;

      const { data } = await CodesAPI.validateCode({
        type: params.type,
        code: params.code.trim(),
      });

      registrationCodeValid.value = Boolean(data.valid);
      registrationCodeData.value = data.data ?? null;
      registrationCodeMessage.value =
        data.message || "Código validado correctamente.";

      return registrationCodeValid.value;
    } catch (error) {
      registrationCodeValid.value = false;
      registrationCodeData.value = null;
      registrationCodeMessage.value =
        error?.response?.data?.message || "El código ingresado no es válido.";

      return false;
    } finally {
      validatingRegistrationCode.value = false;
    }
  }

  async function validateRegistrationAndNext() {
    const isValid = await validateRegistrationCode();

    if (!isValid) {
      toast?.open?.({
        message:
          registrationCodeMessage.value || "El código ingresado no es válido.",
        type: "error",
      });

      return;
    }

    toast?.open?.({
      message: requiresBackendCodeValidation.value
        ? "Código validado correctamente."
        : "Datos validados correctamente.",
      type: "success",
    });

    next();
  }

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

    resetRegistrationCodeValidation();

    seats.resetSeats();
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

    resetRegistrationCodeValidation();
  }

  function toggleReservationSeat(id) {
    const seat = String(id);
    const isAlreadySelected = selectedSeats.value.includes(seat);

    if (isAlreadySelected) {
      seats.toggleSeat(seat);
      return;
    }

    if (selectedSeats.value.length >= maxPassengers.value) {
      const max = maxPassengers.value;

      toast?.error?.(
        `Solo puedes seleccionar ${max} asiento${max > 1 ? "s" : ""} para este tipo de registro.`,
      );

      return;
    }

    seats.toggleSeat(seat);
  }

  const _passengersValidation = validatePassengers(passengers, selectedSeats);

  const allAdults = computed(() => _passengersValidation.value.allAdults);

  const requiredFieldsFilled = computed(() => {
    return _passengersValidation.value.requiredFilled;
  });

  watch(
    _passengersValidation,
    (v) => {
      validationErrors.value = v.errors.slice();
    },
    { immediate: true },
  );

  watch(
    () => [
      registrationType.value,
      registrationData.value.area_code,
      registrationData.value.alliance_code,
      registrationData.value.prize_code,
      registrationData.value.advisor_code,
    ],
    () => {
      resetRegistrationCodeValidation();
    },
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
    return aceptedTerms.value;
  });

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

  const next = () => {
    if (step.value < maxStep.value) {
      step.value++;
    }
  };

  const prev = () => {
    if (step.value > 1) {
      step.value--;
    }
  };

  function reset() {
    step.value = 1;
    aceptedTerms.value = false;
    modal.value = false;
    validationErrors.value = [];

    resetRegistration();
    resetRegistrationCodeValidation();

    seats.resetSeats();
  }

  return {
    step,
    selectedSeats,
    selectedTripId,
    date,
    passengers,
    events,
    aceptedTerms,
    modal,

    registrationType,
    registrationData,
    registrationTypes,

    validatingRegistrationCode,
    registrationCodeValid,
    registrationCodeMessage,
    registrationCodeData,

    canContinuePassengers,
    canPay,
    allAdults,
    validationErrors,

    currentRegistrationType,
    isFreeRegistration,
    requiresPayment,
    requiresExtraPassenger,
    maxPassengers,
    registrationPricePerPerson,
    registrationTotal,
    canContinueRegistrationType,
    canContinueRegistrationValidation,
    requiresBackendCodeValidation,
    registrationCodeToValidate,
    maxStep,
    allianceCodes,
    allianceOptions,
    loadingAllianceCodes,
    loadAllianceCodes,
    next,
    prev,
    reset,
    setDate: seats.setDate,
    loadEvents,
    toggleSeat: toggleReservationSeat,
    seatsSold,

    setRegistrationType,
    resetRegistration,
    validateRegistrationCode,
    validateRegistrationAndNext,
    resetRegistrationCodeValidation,
  };
});
