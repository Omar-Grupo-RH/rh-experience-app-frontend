import { useCalendarAPI } from "@/composables/useCalendar";
import { useAuth } from "@/composables/useAuth";
import { defineStore } from "pinia";
import { ref } from "vue";
import Swal from "sweetalert2";
import { formatDateToSpanish } from "@/utils/formatDate";
import { BUS_CAPACITIES, DEFAULT_BUS_CAPACITY } from "@/utils/busLayout";

export const useCalendarStore = defineStore("calendar", () => {
  const { createEvent, listEvents, destroyEvent, getTrip, updateEvent } =
    useCalendarAPI();

  const { adminLevel } = useAuth();

  const events = ref([]);
  const selectedDate = ref(null);
  const isLoading = ref(false);

  const MAX_SEATS_PER_TRIP = DEFAULT_BUS_CAPACITY;

  function canManageEvents() {
    return Number(adminLevel.value) === 1;
  }

  function showReadOnlyAlert(action = "realizar esta acción") {
    Swal.fire({
      title: "Modo lectura",
      text: `No tienes permisos para ${action}.`,
      icon: "info",
      confirmButtonColor: "#315fa8",
    });
  }

  function isPast(isoDate) {
    const today = new Date().toISOString().split("T")[0];
    return isoDate < today;
  }

  function normalizeTripResponse(response) {
    return response?.data?.data ?? response?.data ?? response ?? null;
  }

  function normalizeSeatsInfo(trip) {
    const totalSeats = Number(
      trip?.total_seats ?? trip?.total_seat ?? MAX_SEATS_PER_TRIP,
    );

    const reservedSeats = Number(
      trip?.unavaible_seats ?? trip?.passengers_count ?? 0,
    );

    const availableSeats = Number(
      trip?.avaible_seats ?? Math.max(0, totalSeats - reservedSeats),
    );

    return {
      totalSeats,
      reservedSeats,
      availableSeats,
    };
  }

  function buildCalendarEvent(trip) {
    const { totalSeats, reservedSeats, availableSeats } =
      normalizeSeatsInfo(trip);

    return {
      id: String(trip.id),
      title: trip.title || "RH EXPERIENCE",
      start: trip.trip_date,
      allDay: true,

      total_seats: totalSeats,
      total_seat: totalSeats,
      unavaible_seats: reservedSeats,
      passengers_count: reservedSeats,
      avaible_seats: availableSeats,
    };
  }

  async function loadEvents() {
    isLoading.value = true;

    try {
      const list = await listEvents();

      events.value = list.map((trip) => buildCalendarEvent(trip));
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudieron cargar los eventos", "error");
    } finally {
      isLoading.value = false;
    }
  }

  async function addEvent(evt) {
    if (!canManageEvents()) {
      showReadOnlyAlert("crear RH Experience");
      return;
    }

    const { dateStr } = evt;
    const today = new Date().toISOString().split("T")[0];

    if (dateStr < today) {
      Swal.fire("No puedes agendar en una fecha pasada.", "", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "¿Agendar tour?",
      html: `¿Deseas agendar "RH EXPERIENCE" el ${formatDateToSpanish(
        dateStr,
      )}?<br><br><strong>Selecciona el número de pasajeros de la unidad:</strong>`,
      icon: "question",
      input: "radio",
      inputOptions: Object.fromEntries(
        BUS_CAPACITIES.map((capacity) => [
          String(capacity),
          `${capacity} pasajeros`,
        ]),
      ),
      inputValue: String(DEFAULT_BUS_CAPACITY),
      inputValidator: (value) =>
        BUS_CAPACITIES.includes(Number(value))
          ? undefined
          : "Selecciona el número de pasajeros.",
      showCancelButton: true,
      confirmButtonText: "Sí, agendar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d94a93",
    });

    if (!result.isConfirmed) return;

    const formData = {
      trip_date: dateStr,
      total_seats: Number(result.value),
      title: "RH EXPERIENCE",
    };

    try {
      const resp = await createEvent(formData);
      const created = normalizeTripResponse(resp);

      if (!created?.id || !created?.trip_date) {
        await loadEvents();

        Swal.fire({
          title: "Tour agendado",
          text: "RH EXPERIENCE agendado correctamente.",
          icon: "success",
          timer: 2000,
        });

        return;
      }

      events.value.push(buildCalendarEvent(created));

      Swal.fire({
        title: "Tour agendado",
        text: `RH EXPERIENCE agendado para el ${formatDateToSpanish(
          created.trip_date,
        )}`,
        icon: "success",
        timer: 2000,
      });
    } catch (error) {
      const msg =
        error?.response?.data?.errors ||
        error?.response?.data?.message ||
        "No se pudo agendar el RH EXPERIENCE";

      Swal.fire("Error", msg, "error");
    }
  }

  async function removeEvent(id) {
    if (!canManageEvents()) {
      showReadOnlyAlert("eliminar RH Experience");
      return;
    }

    const prev = [...events.value];
    const target = events.value.find((trip) => trip.id === String(id));

    if (!target) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Eliminar ${target.title}?`,
      text: "Se notificará por correo a los pasajeros registrados en este tour.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!isConfirmed) return;

    try {
      Swal.fire({
        title: "Eliminando RH Experience...",
        text: "Estamos notificando a los pasajeros registrados. Esto puede tardar unos segundos.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await destroyEvent(id);

      events.value = events.value.filter((e) => e.id !== String(id));

      const notifications = response?.data?.notifications;

      await Swal.fire({
        title: "Eliminado",
        text: "RH EXPERIENCE eliminado correctamente.",
        icon: "success",
        confirmButtonColor: "#315fa8",
        confirmButtonText: "Entendido",
      });
    } catch (e) {
      console.error(e);

      events.value = prev;

      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el tour.",
        icon: "error",
        confirmButtonColor: "#315fa8",
      });
    }
  }

  async function handleEventDrop(info) {
    if (!canManageEvents()) {
      info.revert();
      showReadOnlyAlert("reagendar RH Experience");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const newDate = info.event.startStr;
    const id = String(info.event.id);

    if (newDate < today) {
      info.revert();

      Swal.fire(
        "No puedes reagendar el tour a una fecha pasada.",
        "",
        "warning",
      );

      return;
    }

    const previousEvents = [...events.value];

    try {
      const payload = {
        id,
        trip_date: newDate,
      };

      const resp = await updateEvent(payload);
      const updated = normalizeTripResponse(resp);

      const finalDate = updated?.trip_date ?? newDate;

      const eventIndex = events.value.findIndex((event) => event.id === id);

      if (eventIndex !== -1) {
        const currentEvent = events.value[eventIndex];
        const mergedTrip = {
          ...currentEvent,
          ...updated,
          id,
          trip_date: finalDate,
          title: updated?.title ?? currentEvent.title,
        };

        events.value[eventIndex] = buildCalendarEvent(mergedTrip);
      }

      await loadEvents();

      const notifications = resp?.data?.notifications ?? resp?.notifications;

      let notificationText = `RH EXPERIENCE reagendado para el ${formatDateToSpanish(
        finalDate,
      )}`;

      if (notifications) {
        notificationText += `\nCorreos enviados: ${
          notifications.emails_sent ?? 0
        }`;

        if (Number(notifications.emails_failed ?? 0) > 0) {
          notificationText += `\nCorreos fallidos: ${notifications.emails_failed}`;
        }
      }

      Swal.fire({
        title: "Tour reagendado",
        text: notificationText,
        icon: "success",
        timer: 3000,
      });
    } catch (error) {
      console.error(error);

      info.revert();
      events.value = previousEvents;

      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.errors ||
        error?.message ||
        "Error inesperado al reagendar el RH Experience";

      Swal.fire("Error", msg, "error");
    }
  }

  async function handleEventClick(info, options = {}) {
    const { canManage = canManageEvents() } = options;
    const { id } = info.event;

    try {
      const response = await getTrip(id);
      const trip = normalizeTripResponse(response);

      if (!trip) {
        Swal.fire(
          "Error",
          "No se pudo obtener la información del tour.",
          "error",
        );
        return;
      }

      const { title, trip_date } = trip;
      const { totalSeats, reservedSeats, availableSeats } =
        normalizeSeatsInfo(trip);

      const soloCerrar = isPast(trip_date);

      const res = await Swal.fire({
        title: title || "RH EXPERIENCE",
        html: `
          <div style="text-align:center">
            <p><strong>Fecha:</strong> ${formatDateToSpanish(trip_date)}</p>
            <p><strong>Capacidad de la unidad:</strong> ${totalSeats} pasajeros</p>
            <p><strong>Lugares disponibles:</strong> ${availableSeats}</p>
            <p><strong>Lugares reservados:</strong> ${reservedSeats}</p>
          </div>
        `,
        icon: "info",
        showCancelButton: canManage && !soloCerrar,
        cancelButtonText: "Cerrar",
        confirmButtonText: canManage && !soloCerrar ? "Eliminar" : "OK",
        confirmButtonColor: canManage && !soloCerrar ? "#d94a93" : "#3085d6",
        focusCancel: true,
      });

      if (!canManage || !res.isConfirmed || soloCerrar) return;

      await removeEvent(id);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "No se pudo cargar la información del RH Experience";

      Swal.fire("Error", msg, "error");
    }
  }

  return {
    events,
    selectedDate,
    isLoading,

    canManageEvents,
    addEvent,
    removeEvent,
    loadEvents,
    handleEventDrop,
    handleEventClick,
    isPast,
  };
});
