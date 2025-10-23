<script setup>
import { useReservaStore } from "@/stores/public/reservaStore";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ref, watch, onMounted, computed } from "vue";
import esLocale from "@fullcalendar/core/locales/es";
import Swal from "sweetalert2";

const store = useReservaStore();
const selectedDate = ref(store.date);
const calendarRef = ref(null);
const events = computed(() => store.events);

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

    // Buscar el evento que coincide con la fecha
    const event = store.events.find((ev) => ev.start === clickedDate);
    if (!event) {
      Swal.fire({
        title: `Opps!`,
        text: "Solamente puedes seleccionar los dias donde hay RH EXPERIENCE",
        icon: "warning",
        timer: 3000,
      });
      return;
    }

    // Aquí tienes el id del evento
    store.selectedTripId = event.id;
    store.selectedSeats = [];

    const dayEl =
      info.dayEl || info.jsEvent?.target?.closest?.(".fc-daygrid-day");
    if (dayEl) selectDay(dayEl, clickedDate);
  },

  eventClick(info) {
    store.selectedTripId = info.event.id;
    store.selectedSeats = [];
    // info.jsEvent.target es el elemento real que recibió el click
    const clickTarget = info.jsEvent?.target || info.el || null;

    // Busca la celda de día contenedora (funciona si el usuario clickeó el título, hora, etc.)
    const dayEl = clickTarget ? clickTarget.closest(".fc-daygrid-day") : null;

    // Fallback: intenta usar info.el (dependiendo de la versión de FullCalendar)
    const usedDayEl =
      dayEl ||
      (info.el && info.el.closest ? info.el.closest(".fc-daygrid-day") : null);

    if (usedDayEl) {
      selectDay(usedDayEl, info.event.startStr);
    } else {
      // si no encontramos dayEl, aún podemos seleccionar por la fecha
      selectedDate.value = info.event.startStr;
      store.setDate(info.event.startStr);
    }
  },
});

function selectDay(dayEl, dateStr) {
  document.querySelectorAll(".fc-daygrid-day").forEach((day) => {
    day.classList.remove("fc-day-selected");
  });
  dayEl.classList.add("fc-day-selected");
  selectedDate.value = dateStr;
  store.setDate(dateStr);
}

function syncCalendar() {
  const api = calendarRef.value?.getApi?.();
  if (!api) return;

  api.removeAllEvents();
  if (events.value.length > 0) {
    events.value.forEach((ev) => api.addEvent(ev));
  }
}

onMounted(async () => {
  await store.loadEvents();

  setTimeout(() => {
    syncCalendar();
  }, 100);
});

watch(
  events,
  (newEvents) => {
    if (newEvents.length > 0) {
      setTimeout(() => {
        syncCalendar();
      }, 100);
    }
  },
  { deep: true }
);

watch(
  () => store.date,
  (newDate) => {
    if (newDate !== selectedDate.value) {
      selectedDate.value = newDate;
    }
  }
);
</script>

<template>
  <div>
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
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

.fc-day-has-event {
  cursor: pointer !important;
}

.fc-button {
  background-color: #d94a93 !important;
  border: none !important;
}
</style>
