import { defineStore, storeToRefs } from "pinia";
import { ref, computed, watch, inject } from "vue";

import { useSeatsStore } from "./seatsStore";
import { useEventsStore } from "./eventsStore";

import { validatePassengers } from "@/composables/usePassengerValidation";
import CodesAPI from "@/api/CodesAPI";
import ReservationAPI from "@/api/ReservationAPI";

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

  const emailVerification = ref(null);
  const emailVerificationLoading = ref(false);

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
      description: "Primera visita gratis. Segunda visita en adelante $500.",
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
      description:
        "Para personas que han invertido en algun proyecto de Grupo RH es gratuito.",
      free: true,
      allowsExtra: false,
    },
    {
      value: "prospect",
      title: "Clientes prospectos",
      description:
        "Para personas interesadas en algún desarrollo de Grupo RH, con cuota de $1,500.00 MXN. por persona.",
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
    {
      value: "family_friend",
      title: "Invitado extra, familiares o amigos",
      description:
        "Invitado extra del inversionista, familiares o amigos con una cuota de $500.00 MXN por persona.",
      free: false,
      allowsExtra: true,
    },
  ];

  const currentRegistrationType = computed(() => {
    return registrationTypes.find(
      (type) => type.value === registrationType.value,
    );
  });

  const hasUnlimitedPassengers = computed(() => {
    return registrationType.value === "family_friend";
  });

  const requiresExtraPassenger = computed(() => {
    return ["prize", "family_friend"].includes(registrationType.value);
  });

  const maxPassengers = computed(() => {
    if (hasUnlimitedPassengers.value) return Infinity;

    if (registrationType.value === "prize") return 2;

    return 1;
  });

  const paidTicketsCount = computed(() => {
    const seatsCount = selectedSeats.value.length;

    if (registrationType.value === "prospect") {
      return seatsCount;
    }

    if (registrationType.value === "family_friend") {
      return seatsCount;
    }

    if (registrationType.value === "internal") {
      return emailVerification.value?.exists ? seatsCount : 0;
    }

    if (registrationType.value === "investor") {
      return Math.max(0, seatsCount - 1);
    }

    return 0;
  });

  const freeTicketsCount = computed(() => {
    return Math.max(0, selectedSeats.value.length - paidTicketsCount.value);
  });

  const registrationPricePerPerson = computed(() => {
    if (registrationType.value === "prospect") return 1500;

    if (registrationType.value === "family_friend") return 500;

    if (registrationType.value === "internal") {
      return emailVerification.value?.exists ? 500 : 0;
    }

    if (registrationType.value === "investor") return 500;

    return 0;
  });

  const registrationTotal = computed(() => {
    return paidTicketsCount.value * registrationPricePerPerson.value;
  });

  const requiresPayment = computed(() => {
    return registrationTotal.value > 0;
  });

  const isFreeRegistration = computed(() => {
    return !requiresPayment.value;
  });

  const canContinueRegistrationType = computed(() => {
    return Boolean(registrationType.value);
  });

  const canContinueRegistrationValidation = computed(() => {
    const data = registrationData.value;

    if (registrationType.value === "internal") {
      return Boolean(data.area_code.trim());
    }

    if (registrationType.value === "family_friend") {
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
    return [
      "internal",
      "alliance",
      "prize",
      "prospect",
      "family_friend",
    ].includes(registrationType.value);
  });

  const registrationCodeToValidate = computed(() => {
    const data = registrationData.value;

    if (
      registrationType.value === "internal" ||
      registrationType.value === "family_friend"
    ) {
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
    if (registrationType.value === "family_friend") return 5;

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

  function resetEmailVerification() {
    emailVerification.value = null;
    emailVerificationLoading.value = false;
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
    resetEmailVerification();

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
    resetEmailVerification();
  }

  function toggleReservationSeat(id) {
    const seat = String(id);
    const isAlreadySelected = selectedSeats.value.includes(seat);

    if (isAlreadySelected) {
      seats.toggleSeat(seat);
      return;
    }

    if (
      !hasUnlimitedPassengers.value &&
      selectedSeats.value.length >= maxPassengers.value
    ) {
      const max = maxPassengers.value;

      toast?.open?.({
        message: `Solo puedes seleccionar ${max} asiento${
          max > 1 ? "s" : ""
        } para este tipo de registro.`,
        type: "error",
      });

      return;
    }

    seats.toggleSeat(seat);
  }

  const _passengersValidation = validatePassengers(passengers, selectedSeats);

  const allAdults = computed(() => _passengersValidation.value.allAdults);

  const requiredFieldsFilled = computed(() => {
    return _passengersValidation.value.requiredFilled;
  });

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

  async function verifyEmailRegister(email) {
    if (!email) {
      resetEmailVerification();
      return null;
    }

    try {
      emailVerificationLoading.value = true;

      const { data } = await ReservationAPI.passengerByEmail(email);

      emailVerification.value = data;

      return data;
    } catch (error) {
      const fallback = error?.response?.data || {
        success: false,
        exists: false,
        message: "No se pudo verificar el email del pasajero.",
      };

      emailVerification.value = fallback;

      return fallback;
    } finally {
      emailVerificationLoading.value = false;
    }
  }

  const next = () => {
    if (registrationType.value === "family_friend" && step.value === 1) {
      step.value = 3;
      return;
    }

    if (step.value < 6) {
      step.value++;
    }
  };

  const prev = () => {
    if (registrationType.value === "family_friend" && step.value === 3) {
      step.value = 1;
      return;
    }

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

  watch(
    () => passengers.value?.[0]?.email,
    () => {
      if (registrationType.value === "internal") {
        resetEmailVerification();
      }
    },
  );

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
    hasUnlimitedPassengers,
    maxPassengers,
    registrationPricePerPerson,
    registrationTotal,
    paidTicketsCount,
    freeTicketsCount,

    canContinueRegistrationType,
    canContinueRegistrationValidation,
    requiresBackendCodeValidation,
    registrationCodeToValidate,
    maxStep,

    allianceCodes,
    allianceOptions,
    loadingAllianceCodes,

    emailVerification,
    emailVerificationLoading,
    verifyEmailRegister,

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
    resetEmailVerification,
  };
});
