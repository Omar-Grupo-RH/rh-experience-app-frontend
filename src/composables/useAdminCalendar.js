import { ref } from "vue";
import Swal from "sweetalert2";
import { formatDateToSpanish } from "@/utils/formatDate";

export function useAdminCalendar(store, calendarRef) {
  const isLoading = ref(false);

  function updateCalendarEvents() {
    const calendarApi = calendarRef.value?.getApi?.();
    if (!calendarApi) return;
    calendarApi.removeAllEvents();
    store.events.forEach((ev) => calendarApi.addEvent(ev));
  }

  async function handleDateClick(info) {
    const clickedDate = info.dateStr;
    const today = new Date().toISOString().split("T")[0];
    if (clickedDate < today) {
      Swal.fire("No puedes agendar en una fecha pasada.", "", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "¿Agendar tour?",
      text: `¿Deseas agendar "RH EXPERIENCE" el ${formatDateToSpanish(
        clickedDate
      )}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, agendar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d94a93",
    });

    if (result.isConfirmed) {
      const exists = store.events.some((e) => e.start === clickedDate);
      if (!exists) {
        store.addEvent({
          id: String(Date.now()),
          title: "RH EXPERIENCE",
          start: clickedDate,
          allDay: true,
        });
        updateCalendarEvents();
        Swal.fire(
          "✅ Tour agendado",
          `Tu tour ha sido registrado para el ${formatDateToSpanish(
            clickedDate
          )}.`,
          "success"
        );
      } else {
        Swal.fire("Ya tienes un tour agendado ese día.", "", "info");
      }
    }
  }

  async function handleEventClick(info) {
    const clickedDate = info.event.startStr;
    const today = new Date().toISOString().split("T")[0];
    if (clickedDate < today) {
      Swal.fire("⚠️ No puedes eliminar un evento pasado.", "", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "¿Eliminar tour?",
      text: `¿Deseas eliminar el tour del ${formatDateToSpanish(clickedDate)}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d94a93",
    });

    if (result.isConfirmed) {
      store.removeEvent(info.event.id);
      updateCalendarEvents();
      Swal.fire(
        "🗑️ Tour eliminado",
        "El tour ha sido eliminado correctamente.",
        "success"
      );
    }
  }

  async function handleEventDrop(info) {
    const today = new Date().toISOString().split("T")[0];
    const newDate = info.event.startStr;
    if (newDate < today) {
      info.revert();
      Swal.fire(
        "⚠️ No puedes mover el evento a una fecha pasada.",
        "",
        "warning"
      );
      return;
    }

    const result = await Swal.fire({
      title: "¿Mover tour?",
      text: `¿Deseas mover el tour al ${formatDateToSpanish(newDate)}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, mover",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d94a93",
    });

    if (result.isConfirmed) {
      store.updateEvent(info.event.id, { start: newDate });
      updateCalendarEvents();
    } else {
      info.revert();
    }
  }

  return {
    handleDateClick,
    handleEventClick,
    handleEventDrop,
    updateCalendarEvents,
    isLoading,
  };
}
