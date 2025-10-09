<script setup>
import { useReservaStore } from "@/stores/reservaStore";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ref, watch, onMounted } from "vue";
import Swal from "sweetalert2";
import esLocale from "@fullcalendar/core/locales/es";
import { formatDateToSpanish } from "@/utils/formatDate";

const store = useReservaStore();
const selectedDate = ref(store.date);

// 🔹 Lista reactiva de eventos
const events = ref([
  {
    id: String(Date.now()),
    title: "RH EXPERIENCE",
    start: "2025-10-08",
    allDay: true,
  },
]);

// 🔹 Referencia al calendario (para forzar actualización si hace falta)
const calendarRef = ref(null);

// 🔹 Configuración base del calendario
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
  locale: esLocale,

  // Importante: No pasamos events.value directo aquí, lo enlazamos luego
  events: [],

  async dateClick(info) {
    const clickedDate = info.dateStr;
    const today = new Date().toISOString().split("T")[0];

    // No permitir fechas pasadas
    if (clickedDate < today) {
      Swal.fire("⚠️ No puedes agendar en una fecha pasada.", "", "warning");
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
      // Evitar duplicados
      const exists = events.value.some((e) => e.start === clickedDate);
      if (!exists) {
        events.value.push({
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
  },

  async eventClick(info) {
    const clickedDate = info.event.startStr;
    const today = new Date().toISOString().split("T")[0];

    // Evitar eliminar eventos pasados
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
      // Eliminar correctamente usando el ID del evento
      const id = info.event.id;
      events.value = events.value.filter((ev) => ev.id !== id);
      updateCalendarEvents();

      Swal.fire(
        "🗑️ Tour eliminado",
        "El tour ha sido eliminado correctamente.",
        "success"
      );
    }
  },

  async eventDrop(info) {
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
      // Actualizamos la fecha del evento en la lista reactiva
      const event = events.value.find((ev) => ev.id === info.event.id);
      if (event) event.start = newDate;
      updateCalendarEvents();
    } else {
      info.revert();
    }
  },

  eventDidMount(info) {
    const today = new Date().toISOString().split("T")[0];
    const eventDate = info.event.startStr;
    if (eventDate < today) {
      info.el.style.opacity = "0.4";
      info.el.style.pointerEvents = "none";
    }
  },
});

// 🔹 Actualizar manualmente los eventos en el calendario
function updateCalendarEvents() {
  const calendarApi = calendarRef.value?.getApi?.();
  if (calendarApi) {
    calendarApi.removeAllEvents();
    events.value.forEach((ev) => calendarApi.addEvent(ev));
  }
}

// 🔹 Inicializar correctamente el calendario una vez montado
onMounted(() => {
  calendarOptions.value.events = events.value;
  updateCalendarEvents();
});

watch(
  () => store.date,
  (newDate) => {
    if (newDate !== selectedDate.value) selectedDate.value = newDate;
  }
);
</script>

<template>
  <div>
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
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
