<script setup>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ref, onMounted, watch } from "vue";
import { useCalendarStore } from "@/stores/calendarStore";
import Swal from "sweetalert2";
import { formatDateToSpanish } from "@/utils/formatDate";
import { useCalendarAPI } from "@/composables/useCalendar";

const store = useCalendarStore();
const calendarRef = ref(null);
const { getTrip } = useCalendarAPI();

function isPast(isoDate) {
  const today = new Date().toISOString().split("T")[0];
  return isoDate < today;
}

async function handleEventClick(info) {
  const { id } = info.event;
  const trip = await getTrip(id);
  const { title, total_seats, trip_date } = trip;
  const soloCerrar = isPast(trip_date);

  const res = await Swal.fire({
    title: title || "Evento",
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

  // Confirmar eliminación
  const res2 = await Swal.fire({
    title: "¿Eliminar tour?",
    text: `Se eliminará el evento del ${formatDateToSpanish(trip_date)}.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d94a93",
  });
  if (!res2.isConfirmed) return;

  // 👉 si aún no tienes backend, usa:
  store.removeEvent(id);

  if (ok) {
    info.event.remove(); // quita de FullCalendar (además del store)
    Swal.fire("Eliminado", "El evento fue eliminado.", "success");
  } else {
    Swal.fire("Error", "No se pudo eliminar el evento.", "error");
  }
}

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  eventColor: "#d94a93",
  eventTextColor: "#fff",
  selectable: true,
  editable: true,
  headerToolbar: {
    left: "prev",
    center: "title",
    right: "next",
  },
  locale: "es",
  events: [],
  dateClick: store.addEvent,
  eventClick: handleEventClick,
  // eventDrop: handleEventDrop,
  eventDidMount(info) {
    const today = new Date().toISOString().split("T")[0];
    if (info.event.startStr < today) {
      info.el.style.opacity = "0.4";
      info.el.style.pointerEvents = "none";
    }
  },
});

function syncCalendar() {
  const api = calendarRef.value?.getApi?.();
  if (!api) return;
  api.removeAllEvents();
  store.events.forEach((ev) => api.addEvent(ev));
}

onMounted(async () => {
  await store.loadEvents(); // ← traer de la API
  syncCalendar();
});

// cada vez que cambie el array de eventos, repintamos
watch(
  () => store.events,
  () => syncCalendar(),
  { deep: true }
);
</script>

<template>
  <FullCalendar ref="calendarRef" :options="calendarOptions" />
</template>

<style>
.fc-button {
  background-color: #d94a93 !important;
  border: none !important;
}
.fc-daygrid-day.fc-day-past {
  opacity: 0.4;
  pointer-events: none;
}
</style>
