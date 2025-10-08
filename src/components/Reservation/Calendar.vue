<script setup>
import { useReservaStore } from "@/stores/reservaStore";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ref, watch, onMounted } from "vue";
import esLocale from "@fullcalendar/core/locales/es";

const store = useReservaStore();
const selectedDate = ref(store.date);

// 🔹 Tus eventos
const events = ref([
  { title: "Tour disponible", start: "2025-10-10" },
  { title: "Tour disponible", start: "2025-10-17" },
  { title: "Tour disponible", start: "2025-10-24" },
]);

// Configuración del calendario
const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  selectable: true,
  editable: false,
  headerToolbar: {
    left: "prev",
    center: "title",
    right: "next",
  },
  locale: esLocale,
  events: events.value,

  dateClick(info) {
    const clickedDate = info.dateStr;
    const hasEvent = events.value.some((event) => event.start === clickedDate);
    if (!hasEvent) return;

    selectDay(info.dayEl, clickedDate);
  },
});

// 🔹 Función reutilizable para marcar y guardar fecha
function selectDay(dayEl, dateStr) {
  document.querySelectorAll(".fc-daygrid-day").forEach((day) => {
    day.classList.remove("fc-day-selected");
  });
  dayEl.classList.add("fc-day-selected");
  selectedDate.value = dateStr;
  store.setDate(dateStr);
}

// 🔹 Detectar clics en eventos también
onMounted(() => {
  // Esperamos un tick para que el calendario esté montado
  setTimeout(() => {
    document.addEventListener("click", (e) => {
      const eventEl = e.target.closest(".fc-event");
      if (eventEl) {
        const cell = eventEl.closest(".fc-daygrid-day");
        const dateStr = cell?.dataset?.date;
        const hasEvent = events.value.some((ev) => ev.start === dateStr);
        if (hasEvent && cell) {
          selectDay(cell, dateStr);
        }
      }
    });
  }, 500);
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
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<style>
.fc-daygrid-day.fc-day-selected {
  background-color: #fde2e2 !important;
  border-color: #f87171 !important;
}

.fc-dayGridMonth-view {
  width: 100% !important;
}

/* 🔹 Mejora visual opcional: marcar los días con evento */
.fc-day-has-event {
  cursor: pointer !important;
}

.fc-button {
  background-color: #d94a93 !important;
  border: none !important;
}
</style>
