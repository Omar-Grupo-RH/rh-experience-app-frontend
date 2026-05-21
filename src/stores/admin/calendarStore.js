import { useCalendarAPI } from "@/composables/useCalendar";
import { defineStore } from "pinia";
import { ref } from "vue";
import Swal from "sweetalert2";
import { formatDateToSpanish } from "@/utils/formatDate";

export const useCalendarStore = defineStore("calendar", () => {
  const { createEvent, listEvents, destroyEvent, getTrip, updateEvent } =
    useCalendarAPI();

  const events = ref([]);
  const selectedDate = ref(null);
  const isLoading = ref(false);

  function isPast(isoDate) {
    const today = new Date().toISOString().split("T")[0];
    return isoDate < today;
  }

  function normalizeTripResponse(response) {
    return response?.data?.data ?? response?.data ?? response ?? null;
  }

  function buildCalendarEvent(trip) {
    return {
      id: String(trip.id),
      title: trip.title,
      start: trip.trip_date,
      allDay: true,
      total_seats: trip.total_seats,
      total_seat: trip.total_seat,
      avaible_seats: trip.avaible_seats,
    };
  }

  async function loadEvents() {
    isLoading.value = true;

    try {
      const list = await listEvents();

      events.value = list.map((t) => ({
        id: String(t.id),
        title: t.title,
        start: t.trip_date,
        allDay: true,
        total_seats: t.total_seats,
        total_seat: t.total_seat,
        avaible_seats: t.avaible_seats,
      }));
    } catch (e) {
      Swal.fire("Error", "No se pudieron cargar los eventos", "error");
    } finally {
      isLoading.value = false;
    }
  }

  async function addEvent(evt) {
    const { dateStr } = evt;
    const today = new Date().toISOString().split("T")[0];

    if (dateStr < today) {
      Swal.fire("No puedes agendar en una fecha pasada.", "", "warning");
      return;
    }

    const formData = {
      trip_date: dateStr,
      total_seat: 15,
      title: "RH EXPERIENCE",
    };

    const result = await Swal.fire({
      title: "¿Agendar tour?",
      text: `¿Deseas agendar "RH EXPERIENCE" el ${formatDateToSpanish(
        formData.trip_date,
      )}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, agendar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d94a93",
    });

    if (!result.isConfirmed) return;

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
    const prev = [...events.value];
    const target = events.value.find((trip) => trip.id === String(id));

    if (!target) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Eliminar a ${target.title}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!isConfirmed) return;

    events.value = events.value.filter((e) => e.id !== String(id));

    try {
      await destroyEvent(id);

      Swal.fire("Eliminado", "El Tour ha sido eliminado.", "success");
    } catch (e) {
      console.error(e);

      events.value = prev;

      Swal.fire("Error", "No se pudo eliminar el tour.", "error");
    }
  }

  async function handleEventDrop(info) {
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

      /**
       * Si por alguna razón producción responde distinto,
       * no truena la UI. Recargamos calendario y usamos newDate.
       */
      const finalDate = updated?.trip_date ?? newDate;

      const eventIndex = events.value.findIndex((event) => event.id === id);

      if (eventIndex !== -1) {
        events.value[eventIndex] = {
          ...events.value[eventIndex],
          start: finalDate,
          title: updated?.title ?? events.value[eventIndex].title,
          total_seats:
            updated?.total_seats ?? events.value[eventIndex].total_seats,
          total_seat:
            updated?.total_seat ?? events.value[eventIndex].total_seat,
          avaible_seats:
            updated?.avaible_seats ?? events.value[eventIndex].avaible_seats,
        };
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

  async function handleEventClick(info) {
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

      const { title, total_seats, trip_date } = trip;
      const soloCerrar = isPast(trip_date);

      const res = await Swal.fire({
        title: title || "RH EXPERIENCE",
        html: `
          <div style="text-align:center">
            <p><strong>Fecha:</strong> ${formatDateToSpanish(trip_date)}</p>
            <p><strong>Lugares disponibles:</strong> ${total_seats ?? "No registrado"}</p>
          </div>
        `,
        icon: "info",
        showCancelButton: true,
        cancelButtonText: "Cerrar",
        confirmButtonText: soloCerrar ? "OK" : "Eliminar",
        confirmButtonColor: soloCerrar ? "#3085d6" : "#d94a93",
        focusCancel: true,
      });

      if (!res.isConfirmed || soloCerrar) return;

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
    addEvent,
    removeEvent,
    loadEvents,
    handleEventDrop,
    handleEventClick,
    isPast,
  };
});
