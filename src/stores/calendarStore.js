import { useCalendarAPI } from "@/composables/useCalendar";
import { defineStore } from "pinia";
import { ref } from "vue";
import Swal from "sweetalert2";
import { formatDateToSpanish } from "@/utils/formatDate";
export const useCalendarStore = defineStore("calendar", () => {
  const { createEvent, listEvents, destroyEvent } = useCalendarAPI();

  const events = ref([]);
  const selectedDate = ref(null);
  const isLoading = ref(false);

  async function loadEvents() {
    isLoading.value = true;
    try {
      const list = await listEvents();
      // list: [{ id, title, trip_date, total_seat }]
      events.value = list.map((t) => ({
        id: String(t.id),
        title: t.title,
        start: t.trip_date,
        allDay: true,
        extendedProps: { total_seat: t.total_seat },
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
        extendedProps: { total_seat: created.total_seat },
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

  function updateEvent(id, newData) {
    const index = events.value.findIndex((e) => e.id === id);
    if (index !== -1)
      events.value[index] = { ...events.value[index], ...newData };
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

  return {
    events,
    selectedDate,
    addEvent,
    updateEvent,
    removeEvent,
    loadEvents,
  };
});
