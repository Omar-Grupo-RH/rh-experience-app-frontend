import { useReservation } from "@/composables/useReservation";
import { defineStore } from "pinia";
import { ref, watch, computed, inject } from "vue";

export const useReservaStore = defineStore("reserva", () => {
  const { listEvents, getSeatsByTrip, getCouponDiscount, setReverse } =
    useReservation();

  // --- STATE ---
  const toast = inject("toast");
  const step = ref(1);
  const selectedSeats = ref([]);
  const selectedTripId = ref(null);
  const date = ref(null);
  const aceptedTerms = ref(false);
  const pricePerSeat = ref(2100);
  const events = ref([]);
  const modal = ref(false);

  const couponInput = ref("");
  const couponTextBtn = ref("Canjear");
  const discountPercent = ref(0);
  const discountAmount = ref(0);
  const couponId = ref(null);

  const total = ref(0);

  const emailSendTickets = ref({
    emailSent: "",
    confirmEmail: "",
    nameSent: "",
  });

  // --- PASAJEROS ---
  const passengers = ref([]);
  const normSeat = (s) => String(s);

  // --- HELPERS PRIVADOS (no exportados) ---
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function isValidDateStr(s) {
    if (typeof s !== "string" || !s.trim()) return false;
    const d = new Date(s);
    return !isNaN(d.getTime());
  }

  function getAgeFromISO(iso) {
    if (!isValidDateStr(iso)) return -1;
    const b = new Date(iso + "T00:00:00"); // fija medianoche local
    const t = new Date();
    let age = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
    return age;
  }

  // Sincroniza pasajeros con asientos seleccionados
  function syncPassengersToSeats() {
    const seats = selectedSeats.value.map(normSeat);
    const prev = new Map(passengers.value.map((p) => [normSeat(p.seat), p]));
    passengers.value = seats.map(
      (seat) =>
        prev.get(seat) || {
          seat,
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          born_date: "",
          allergies: [],
        }
    );
  }

  // Usamos deep:true para reaccionar a push/splice sobre el mismo array
  watch(selectedSeats, syncPassengersToSeats, { immediate: true, deep: true });

  // --- VALIDACIONES ---

  // 🔎 Depuración: lista de errores (NO cambia API pública)
  const validationErrors = ref([]);

  const allAdults = computed(() => {
    const errs = [];
    const ok = passengers.value.every((p, i) => {
      if (!p.born_date || !isValidDateStr(p.born_date)) {
        errs.push(`Pasajero ${i + 1} (${p.seat}): born_date vacío/ inválido`);
        return false;
      }
      const age = getAgeFromISO(p.born_date);
      if (age < 18) {
        errs.push(`Pasajero ${i + 1} (${p.seat}): es menor de edad (${age})`);
        return false;
      }
      return true;
    });
    // No asignamos aquí errs para no interferir con otros cálculos
    return ok;
  });

  const sameEmails = computed(() => {
    const a = (emailSendTickets.value.emailSent || "").trim();
    const b = (emailSendTickets.value.confirmEmail || "").trim();
    return a !== "" && a === b;
  });

  const requiredFieldsFilled = computed(() => {
    const required = ["first_name", "last_name", "email", "phone", "born_date"];
    const errs = [];

    if (selectedSeats.value.length === 0) {
      errs.push("No hay asientos seleccionados.");
      validationErrors.value = errs;
      return false;
    }

    if (passengers.value.length !== selectedSeats.value.length) {
      errs.push(
        `Desfase: pasajeros (${passengers.value.length}) != asientos (${selectedSeats.value.length}).`
      );
      validationErrors.value = errs;
      return false;
    }

    passengers.value.forEach((p, i) => {
      required.forEach((k) => {
        const v = p[k] ?? "";
        const ok = typeof v === "string" ? v.trim().length > 0 : Boolean(v);
        if (!ok) errs.push(`Pasajero ${i + 1} (${p.seat}): "${k}" vacío.`);
      });
      if (
        p.email &&
        typeof p.email === "string" &&
        !EMAIL_RE.test(p.email.trim())
      ) {
        errs.push(`Pasajero ${i + 1} (${p.seat}): email con formato inválido.`);
      }
      if (p.born_date && !isValidDateStr(p.born_date)) {
        errs.push(`Pasajero ${i + 1} (${p.seat}): born_date inválido.`);
      }
    });

    validationErrors.value = errs;
    return errs.length === 0;
  });

  const validationState = computed(() => ({
    sameEmails: sameEmails.value,
    allAdults: allAdults.value,
    requiredFieldsFilled: requiredFieldsFilled.value,
    canContinuePassengers: false,
    lastErrors: validationErrors.value.slice(),
  }));

  const canContinuePassengers = computed(() => {
    const ok =
      sameEmails.value && allAdults.value && requiredFieldsFilled.value;
    validationState.value.canContinuePassengers = ok;
    return ok;
  });

  const couponEmpy = computed(() => couponInput.value !== "");
  const couponIsApply = computed(() => discountAmount.value !== 0);

  // --- PRECIOS ---
  function priceBreakdown() {
    const count = selectedSeats.value.length;
    const standardPrice = 2100;
    const discountedPrice = 1900;

    if (count === 0) {
      return {
        discountedCount: 0,
        standardCount: 0,
        total: 0,
        breakdownText: "Sin asientos seleccionados",
      };
    }

    const isEven = count % 2 === 0;
    const discountedCount = isEven ? count : count - 1;
    const standardCount = isEven ? 0 : 1;
    const baseTotal =
      discountedCount * discountedPrice + standardCount * standardPrice;

    let breakdownText = "";
    if (count === 1) {
      breakdownText = `1 x $${standardPrice.toLocaleString("es-MX")} MXN`;
    } else if (standardCount === 0) {
      breakdownText = `${discountedCount} x $${discountedPrice.toLocaleString(
        "es-MX"
      )} MXN`;
    } else {
      breakdownText = `${discountedCount} x $${discountedPrice.toLocaleString(
        "es-MX"
      )} MXN | ${standardCount} x $${standardPrice.toLocaleString(
        "es-MX"
      )} MXN`;
    }

    return { discountedCount, standardCount, total: baseTotal, breakdownText };
  }

  // 🔁 Actualiza total/discountAmount automáticamente
  function updateTotal() {
    const baseTotal = priceBreakdown().total;
    const discount = baseTotal * discountPercent.value;
    discountAmount.value = Number(discount.toFixed(2));
    total.value = baseTotal - discount;
  }

  watch([selectedSeats, discountPercent], updateTotal, {
    immediate: true,
    deep: true,
  });

  // --- CUPONES ---
  async function getCoupon(code) {
    couponTextBtn.value = "Buscando...";
    try {
      const { discount, id } = await getCouponDiscount(code);
      discountPercent.value = Number(discount) || 0;

      // Recalcula totales con el nuevo porcentaje
      updateTotal();
      couponId.value = id;

      toast?.open?.({
        message: `Cupón aplicado del ${
          discountPercent.value * 100
        }% de descuento`,
        type: "success",
      });

      couponTextBtn.value = "Canjeado";
    } catch (e) {
      toast?.open?.({
        message: e?.response?.data?.message || "Cupón inválido",
        type: "error",
      });
      couponTextBtn.value = "Canjear";
      discountPercent.value = 0;
      updateTotal();
    }
  }

  // --- EVENTOS Y ASIENTOS ---
  async function loadEvents() {
    try {
      const list = await listEvents();
      events.value = list.map((t) => ({
        id: String(t.id),
        title: t.title,
        start: t.trip_date,
        allDay: true,
      }));
    } catch (err) {
      console.error("No se pudieron cargar los eventos", err);
    }
  }

  async function seatsSold(id) {
    try {
      return await getSeatsByTrip(id);
    } catch {
      return [];
    }
  }

  // --- NAVEGACIÓN DE PASOS ---
  const next = () => step.value < 4 && step.value++;
  const prev = () => step.value > 1 && step.value--;

  // --- MUTADORES ---
  function reset() {
    step.value = 1;
    selectedSeats.value = [];
    date.value = null;
    passengers.value = [];
    discountPercent.value = 0;
    discountAmount.value = 0;
    couponInput.value = "";
    couponTextBtn.value = "Canjear";
    total.value = 0;
  }

  function setDate(d) {
    date.value = d;
  }

  function toggleSeat(id) {
    const seat = normSeat(id);
    const i = selectedSeats.value.indexOf(seat);
    if (i >= 0) selectedSeats.value.splice(i, 1);
    else selectedSeats.value.push(seat);
  }

  async function startCheckout() {
    try {
      const payload = {
        date: date.value,
        trip_id: selectedTripId.value,
        seats: selectedSeats.value,
        // Todos los pasajeros (incluye quien paga)
        passengers: passengers.value.map((p) => ({
          seat_id: p.seat,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
          phone: p.phone,
          born_date: p.born_date,
          allergies: p.allergies,
        })),
        // Puedes tomar el email de envío del primer pasajero o pedir uno aparte:
        tickets_email: emailSendTickets.value.emailSent,
        tickets_name: emailSendTickets.value.nameSent || "Cliente",
        unit_price: pricePerSeat.value,
        total: total.value,
        couponId: couponId.value || null,
      };

      await setReverse(payload);

      toast?.open?.({
        message: "Reservacion exitosa, revisa tu correo electronico.",
        type: "success",
      });
      setTimeout(() => {
        reset();
        window.location.reload();
      }, 5100);
    } catch (e) {
      console.error(e);
      toast?.open?.({
        message: e?.response?.data?.message || "Error al realizar el pago",
        type: "error",
      });
    }
  }

  // --- RETURN ---
  return {
    // State
    step,
    selectedSeats,
    selectedTripId,
    date,
    passengers,
    pricePerSeat,
    events,
    aceptedTerms,
    emailSendTickets,
    couponInput,
    couponTextBtn,
    discountPercent,
    discountAmount,
    total,
    couponId,

    // Getters
    priceBreakdown,
    canContinuePassengers,
    allAdults,
    sameEmails,
    couponEmpy,
    couponIsApply,

    // Actions
    next,
    prev,
    reset,
    setDate,
    loadEvents,
    toggleSeat,
    seatsSold,
    getCoupon,
    modal,
    startCheckout,
  };
});
