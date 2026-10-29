import { defineStore, storeToRefs } from "pinia";
import { ref, computed, watch, inject } from "vue";

import { useSeatsStore } from "./seatsStore";
import { useEventsStore } from "./eventsStore";

import { validatePassengers } from "@/composables/usePassengerValidation";
import CodesAPI from "@/api/CodesAPI";
import ReservationAPI from "@/api/ReservationAPI";

const WAIVER_VERSION = "2026-10-29-v1";

const INE_MAX_SIZE = 8 * 1024 * 1024;
const INE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const emptyRegistrationData = () => ({
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

export const useReservaStore = defineStore("reserva", () => {
  const seats = useSeatsStore();
  const evts = useEventsStore();

  const { selectedSeats, selectedTripId, date, passengers } =
    storeToRefs(seats);

  const { events } = storeToRefs(evts);

  const toast = inject("toast", null);

  // =========================================================
  // ESTADO GENERAL
  // =========================================================

  const step = ref(1);
  const aceptedTerms = ref(false);
  const modal = ref(false);

  const validationErrors = ref([]);

  // =========================================================
  // INSCRIPCIÓN
  // =========================================================

  const validatingRegistrationCode = ref(false);
  const registrationCodeValid = ref(null);
  const registrationCodeMessage = ref("");
  const registrationCodeData = ref(null);

  const allianceCodes = ref([]);
  const loadingAllianceCodes = ref(false);

  const registrationType = ref("");
  const registrationData = ref(emptyRegistrationData());

  const emailVerification = ref(null);
  const emailVerificationLoading = ref(false);

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

  const currentRegistrationType = computed(() =>
    registrationTypes.find((type) => type.value === registrationType.value),
  );

  const hasUnlimitedPassengers = computed(
    () => registrationType.value === "family_friend",
  );

  const requiresExtraPassenger = computed(() =>
    ["prize", "family_friend"].includes(registrationType.value),
  );

  const maxPassengers = computed(() => {
    if (hasUnlimitedPassengers.value) return Infinity;
    if (registrationType.value === "prize") return 2;
    return 1;
  });

  // =========================================================
  // COSTOS
  // =========================================================

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

  const freeTicketsCount = computed(() =>
    Math.max(0, selectedSeats.value.length - paidTicketsCount.value),
  );

  const registrationPricePerPerson = computed(() => {
    if (registrationType.value === "prospect") return 1500;
    if (registrationType.value === "family_friend") return 500;

    if (registrationType.value === "internal") {
      return emailVerification.value?.exists ? 500 : 0;
    }

    if (registrationType.value === "investor") return 500;

    return 0;
  });

  const registrationTotal = computed(
    () => paidTicketsCount.value * registrationPricePerPerson.value,
  );

  const requiresPayment = computed(() => registrationTotal.value > 0);

  const isFreeRegistration = computed(() => !requiresPayment.value);

  // =========================================================
  // VALIDACIÓN DE INSCRIPCIÓN
  // =========================================================

  const canContinueRegistrationType = computed(() =>
    Boolean(registrationType.value),
  );

  const canContinueRegistrationValidation = computed(() => {
    const data = registrationData.value;

    if (
      registrationType.value === "internal" ||
      registrationType.value === "family_friend"
    ) {
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

  const requiresBackendCodeValidation = computed(() =>
    ["internal", "alliance", "prize", "prospect", "family_friend"].includes(
      registrationType.value,
    ),
  );

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

  // El flujo termina siempre en el paso 7.
  // family_friend omite el paso 2.
  const maxStep = computed(() => 7);

  const allianceOptions = computed(() =>
    allianceCodes.value.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
    })),
  );

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
    registrationData.value = emptyRegistrationData();

    resetRegistrationCodeValidation();
    resetEmailVerification();

    clearAllPassengerDocuments();
    clearAllPassengerWaivers();

    seats.resetSeats();
  }

  function resetRegistration() {
    registrationType.value = "";
    registrationData.value = emptyRegistrationData();

    resetRegistrationCodeValidation();
    resetEmailVerification();
  }

  // =========================================================
  // ASIENTOS
  // =========================================================

  function toggleReservationSeat(id) {
    const seat = String(id);

    const isAlreadySelected = selectedSeats.value.map(String).includes(seat);

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

  // =========================================================
  // VALIDACIÓN DE PASAJEROS
  // =========================================================

  const _passengersValidation = validatePassengers(passengers, selectedSeats);

  const allAdults = computed(() => _passengersValidation.value.allAdults);

  const requiredFieldsFilled = computed(
    () => _passengersValidation.value.requiredFilled,
  );

  const canContinuePassengers = computed(
    () => allAdults.value && requiredFieldsFilled.value,
  );

  const validationState = computed(() => ({
    allAdults: allAdults.value,
    requiredFieldsFilled: requiredFieldsFilled.value,
    canContinuePassengers: canContinuePassengers.value,
    lastErrors: validationErrors.value.slice(),
  }));

  const canPay = computed(() => aceptedTerms.value);

  // =========================================================
  // IDENTIFICACIONES INE
  // =========================================================

  // {
  //   [seat]: {
  //     front: File | null,
  //     back: File | null
  //   }
  // }
  const passengerDocuments = ref({});

  function isValidIneFile(file) {
    return (
      typeof File !== "undefined" &&
      file instanceof File &&
      INE_TYPES.includes(file.type) &&
      file.size > 0 &&
      file.size <= INE_MAX_SIZE
    );
  }

  function setPassengerDocument(seat, side, file) {
    if (!["front", "back"].includes(side)) return;

    const key = String(seat);

    const current = passengerDocuments.value[key] || {
      front: null,
      back: null,
    };

    passengerDocuments.value = {
      ...passengerDocuments.value,
      [key]: {
        ...current,
        [side]: isValidIneFile(file) ? file : null,
      },
    };
  }

  function getPassengerDocuments(seat) {
    return (
      passengerDocuments.value[String(seat)] || {
        front: null,
        back: null,
      }
    );
  }

  function isPassengerDocumentationComplete(seat) {
    const docs = getPassengerDocuments(seat);

    return isValidIneFile(docs.front) && isValidIneFile(docs.back);
  }

  function clearPassengerDocuments(seat) {
    const updated = { ...passengerDocuments.value };
    delete updated[String(seat)];

    passengerDocuments.value = updated;
  }

  function clearAllPassengerDocuments() {
    passengerDocuments.value = {};
  }

  // =========================================================
  // CARTAS RESPONSIVAS
  // =========================================================

  // Cada firma se relaciona con un asiento y con una
  // versión específica del documento.
  const passengerWaivers = ref({});

  function getPassengerWaiver(seat) {
    return passengerWaivers.value[String(seat)] || null;
  }

  function setPassengerWaiver(seat, data) {
    const key = String(seat);

    if (!data || typeof data !== "object") {
      clearPassengerWaiver(key);
      return;
    }

    passengerWaivers.value = {
      ...passengerWaivers.value,
      [key]: {
        ...data,
      },
    };
  }

  function clearPassengerWaiver(seat) {
    const updated = { ...passengerWaivers.value };
    delete updated[String(seat)];

    passengerWaivers.value = updated;
  }

  function clearAllPassengerWaivers() {
    passengerWaivers.value = {};
  }

  function getPassengerWaiverFingerprint(passenger) {
    const code = String(passenger?.phone_country_code || "52").replace(
      /\D/g,
      "",
    );

    const number = String(passenger?.phone || "").replace(/\D/g, "");

    return JSON.stringify({
      version: WAIVER_VERSION,
      trip_id: String(selectedTripId.value ?? ""),
      seat: String(passenger?.seat ?? ""),
      full_name: [passenger?.first_name, passenger?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim(),
      email: String(passenger?.email || "")
        .trim()
        .toLowerCase(),
      phone: `+${code} ${number}`,
    });
  }

  function isPassengerWaiverComplete(passenger) {
    if (!passenger?.seat) return false;

    const waiver = getPassengerWaiver(passenger.seat);

    if (
      waiver?.version !== WAIVER_VERSION ||
      waiver?.accepted !== true ||
      typeof waiver?.signature !== "string" ||
      !waiver.signature.startsWith("data:image/png;base64,")
    ) {
      return false;
    }

    return waiver.fingerprint === getPassengerWaiverFingerprint(passenger);
  }

  // =========================================================
  // VALIDACIÓN CONJUNTA DE DOCUMENTACIÓN
  // =========================================================

  const canContinueDocuments = computed(() => {
    const list = passengers.value || [];
    const selected = selectedSeats.value.map(String);

    if (
      !canContinuePassengers.value ||
      list.length === 0 ||
      list.length !== selected.length
    ) {
      return false;
    }

    return list.every((passenger) => {
      const seat = String(passenger.seat);

      return (
        selected.includes(seat) &&
        isPassengerDocumentationComplete(seat) &&
        isPassengerWaiverComplete(passenger)
      );
    });
  });

  const pendingDocumentsCount = computed(
    () =>
      (passengers.value || []).filter(
        (passenger) =>
          !isPassengerDocumentationComplete(passenger.seat) ||
          !isPassengerWaiverComplete(passenger),
      ).length,
  );

  const completedDocumentsCount = computed(
    () => (passengers.value || []).length - pendingDocumentsCount.value,
  );

  // =========================================================
  // EVENTOS Y VALIDACIÓN DE EMAIL
  // =========================================================

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

  // =========================================================
  // NAVEGACIÓN
  // =========================================================

  function next() {
    // Invitados extra omiten la inscripción del paso 2.
    if (registrationType.value === "family_friend" && step.value === 1) {
      if (!canContinueRegistrationType.value) return;

      step.value = 3;
      return;
    }

    // Validar datos de pasajeros antes de documentación.
    if (step.value === 5 && !canContinuePassengers.value) {
      toast?.open?.({
        message: "Completa correctamente los datos de todos los pasajeros.",
        type: "error",
      });
      return;
    }

    // INE y responsiva son obligatorios.
    if (step.value === 6 && !canContinueDocuments.value) {
      toast?.open?.({
        message:
          "Cada pasajero debe subir ambos lados del INE, leer y aceptar la carta responsiva y firmarla.",
        type: "error",
      });
      return;
    }

    if (step.value < maxStep.value) {
      step.value++;
    }
  }

  function prev() {
    if (registrationType.value === "family_friend" && step.value === 3) {
      step.value = 1;
      return;
    }

    if (step.value > 1) {
      step.value--;
    }
  }

  // =========================================================
  // REINICIO
  // =========================================================

  function reset() {
    step.value = 1;
    aceptedTerms.value = false;
    modal.value = false;
    validationErrors.value = [];

    clearAllPassengerDocuments();
    clearAllPassengerWaivers();

    resetRegistration();
    resetRegistrationCodeValidation();

    seats.resetSeats();
  }

  // =========================================================
  // WATCHERS
  // =========================================================

  watch(
    _passengersValidation,
    (value) => {
      validationErrors.value = value.errors.slice();
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

  // Descartar archivos y responsivas de asientos
  // que ya no pertenecen a la reservación.
  watch(
    () => selectedSeats.value.map(String),
    (currentSeats) => {
      const allowed = new Set(currentSeats);

      const keptDocuments = Object.fromEntries(
        Object.entries(passengerDocuments.value).filter(([seat]) =>
          allowed.has(seat),
        ),
      );

      const keptWaivers = Object.fromEntries(
        Object.entries(passengerWaivers.value).filter(([seat]) =>
          allowed.has(seat),
        ),
      );

      passengerDocuments.value = keptDocuments;
      passengerWaivers.value = keptWaivers;
    },
  );

  // Invalidar una firma si cambian los datos
  // personales, asiento o viaje asociados a ella.
  const passengerFingerprints = computed(() =>
    (passengers.value || []).map((passenger) => ({
      seat: String(passenger.seat),
      fingerprint: getPassengerWaiverFingerprint(passenger),
    })),
  );

  watch(passengerFingerprints, (current) => {
    const validBySeat = new Map(
      current.map((item) => [item.seat, item.fingerprint]),
    );

    const kept = Object.fromEntries(
      Object.entries(passengerWaivers.value).filter(([seat, waiver]) => {
        return (
          validBySeat.has(seat) && waiver?.fingerprint === validBySeat.get(seat)
        );
      }),
    );

    if (
      Object.keys(kept).length !== Object.keys(passengerWaivers.value).length
    ) {
      passengerWaivers.value = kept;
    }
  });

  watch(
    () => passengers.value?.[0]?.email,
    () => {
      if (registrationType.value === "internal") {
        resetEmailVerification();
      }
    },
  );

  // =========================================================
  // PROPIEDADES Y MÉTODOS PÚBLICOS
  // =========================================================

  return {
    // Navegación
    step,
    maxStep,
    next,
    prev,
    reset,

    // Viajes y asientos
    selectedSeats,
    selectedTripId,
    date,
    passengers,
    events,
    setDate: seats.setDate,
    loadEvents,
    toggleSeat: toggleReservationSeat,
    seatsSold,

    // Confirmación
    aceptedTerms,
    modal,
    canPay,

    // Inscripción
    registrationType,
    registrationData,
    registrationTypes,
    currentRegistrationType,
    setRegistrationType,
    resetRegistration,

    // Validación de códigos
    validatingRegistrationCode,
    registrationCodeValid,
    registrationCodeMessage,
    registrationCodeData,
    canContinueRegistrationType,
    canContinueRegistrationValidation,
    requiresBackendCodeValidation,
    registrationCodeToValidate,
    validateRegistrationCode,
    validateRegistrationAndNext,
    resetRegistrationCodeValidation,

    // Alianzas
    allianceCodes,
    allianceOptions,
    loadingAllianceCodes,
    loadAllianceCodes,

    // Costos y tipos de pasajeros
    isFreeRegistration,
    requiresPayment,
    requiresExtraPassenger,
    hasUnlimitedPassengers,
    maxPassengers,
    registrationPricePerPerson,
    registrationTotal,
    paidTicketsCount,
    freeTicketsCount,

    // Validaciones de pasajeros
    canContinuePassengers,
    requiredFieldsFilled,
    validationState,
    allAdults,
    validationErrors,

    // Documentación INE
    passengerDocuments,
    setPassengerDocument,
    getPassengerDocuments,
    isPassengerDocumentationComplete,
    clearPassengerDocuments,
    clearAllPassengerDocuments,

    // Cartas responsivas
    passengerWaivers,
    setPassengerWaiver,
    getPassengerWaiver,
    clearPassengerWaiver,
    clearAllPassengerWaivers,
    getPassengerWaiverFingerprint,
    isPassengerWaiverComplete,

    // Validación conjunta
    canContinueDocuments,
    pendingDocumentsCount,
    completedDocumentsCount,

    // Validación de correo
    emailVerification,
    emailVerificationLoading,
    verifyEmailRegister,
    resetEmailVerification,
  };
});
