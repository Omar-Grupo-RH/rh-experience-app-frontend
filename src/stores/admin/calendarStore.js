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

  // Mover función de utilidad al store
  function isPast(isoDate) {
    const today = new Date().toISOString().split("T")[0];
    return isoDate < today;
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
        formData.trip_date
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
      const created = resp?.data;
      if (!created) throw new Error("Respuesta sin data");

      events.value.push({
        id: String(created.id),
        title: created.title,
        start: created.trip_date,
        allDay: true,
        total_seat: created.total_seat,
      });

      Swal.fire({
        title: `Tour Agendado`,
        text: `RH EXPERIENCE agendado para el ${formatDateToSpanish(
          created.trip_date
        )}`,
        icon: "success",
        timer: 2000,
      });
    } catch (error) {
      Swal.fire("Error", `${error.response.data.errors}`, "error");
    }
  }

  async function removeEvent(id) {
    const prev = [...events.value];
    const target = events.value.find((trip) => trip.id === id);
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

    events.value = events.value.filter((e) => e.id !== id);

    try {
      await destroyEvent(id);
      Swal.fire("Eliminado", `El Tour ha sido eliminado.`, "success");
    } catch (e) {
      console.error(e);
      events.value = prev; // rollback
      Swal.fire("Error", "No se pudo eliminar el tour.", "error");
    }
  }

  async function handleEventDrop(info) {
    const today = new Date().toISOString().split("T")[0];
    const newDate = info.event.startStr;

    if (newDate < today) {
      info.revert();
      Swal.fire(
        "No puedes reagendar el tour a una fecha pasada.",
        "",
        "warning"
      );
      return;
    }

    const { id } = info.event;
    try {
      const payload = {
        id,
        trip_date: info.event.startStr,
      };

      const resp = await updateEvent(payload);
      const updated = resp.data;

      // Actualizar el evento en el store
      const eventIndex = events.value.findIndex((event) => event.id === id);
      if (eventIndex !== -1) {
        events.value[eventIndex].start = updated.trip_date;
      }

      Swal.fire({
        title: `Tour Reagendado`,
        text: `RH EXPERIENCE agendado para el ${formatDateToSpanish(
          updated.trip_date
        )}`,
        icon: "success",
        timer: 2000,
      });
    } catch (error) {
      console.log(error);
      info.revert();
      const msg = error?.response?.data?.message || "Error inesperado";
      Swal.fire("Error", msg, "error");
    }
  }

  // NUEVO: También puedes mover handleEventClick si quieres
  async function handleEventClick(info) {
    const { id } = info.event;
    const { data: trip } = await getTrip(id);
    const { title, total_seats, trip_date, unavaible_seats } = trip;
    const soloCerrar = isPast(trip_date);

    const res = await Swal.fire({
      title: title,
      html: `
        <div style="text-align:center">
          <p><strong>Fecha:</strong> ${formatDateToSpanish(trip_date)}</p>
          <p><strong>Lugares Disponibles:</strong> ${total_seats}</p>
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
