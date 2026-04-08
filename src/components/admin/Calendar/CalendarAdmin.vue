<script setup>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ref, onMounted, watch, onUnmounted } from "vue";
import { useCalendarStore } from "@/stores/admin/calendarStore";

const store = useCalendarStore();
const calendarRef = ref(null);

// Detectar el tamaño de pantalla
const isMobile = ref(window.innerWidth < 768);
const isTablet = ref(window.innerWidth >= 768 && window.innerWidth < 1024);

// Actualizar en resize
const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
  isTablet.value = window.innerWidth >= 768 && window.innerWidth < 1024;
};

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  eventColor: "#d94a93",
  eventTextColor: "#fff",
  fixedWeekCount: false,
  showNonCurrentDates: false,
  selectable: true,
  editable: true,
  headerToolbar: {
    left: "prev",
    center: "title",
    right: "next",
  },
  locale: "es",
  events: [],

  // Configuraciones responsive
  height: "100%",
  contentHeight: "100%",
  aspectRatio: isMobile.value ? 0.8 : 1.5,

  views: {
    dayGridMonth: {
      titleFormat: isMobile.value
        ? { year: "numeric", month: "short" }
        : { year: "numeric", month: "long" },
      dayHeaderFormat: isMobile.value
        ? { weekday: "short" }
        : { weekday: "long" },
      dayMaxEvents: isMobile.value ? 1 : 2,
    },
  },

  buttonText: {
    today: isMobile.value ? "Hoy" : "Hoy",
    month: isMobile.value ? "Mes" : "Mes",
    week: isMobile.value ? "Sem." : "Semana",
    day: isMobile.value ? "Día" : "Día",
    list: isMobile.value ? "Lista" : "Lista",
  },

  dateClick: store.addEvent,
  eventClick: store.handleEventClick,
  eventDrop: store.handleEventDrop,
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

function updateCalendarView() {
  const api = calendarRef.value?.getApi?.();
  if (!api) return;

  // Forzar actualización de la vista
  api.updateSize();
}

onMounted(async () => {
  await store.loadEvents();
  window.addEventListener("resize", handleResize);

  // Actualizar calendario cuando cambie el tamaño
  window.addEventListener("resize", updateCalendarView);

  setTimeout(() => {
    syncCalendar();
  }, 100);
});

// Limpiar event listeners
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("resize", updateCalendarView);
});

watch(
  () => store.events,
  () => syncCalendar(),
  { deep: true }
);
</script>

<template>
  <div class="calendar-container">
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
.calendar-container {
  width: 100%;
  height: 100%;
}

/* Estilos responsive para el calendario */
:deep(.fc) {
  font-size: clamp(0.75rem, 2vw, 1rem);
}

:deep(.fc .fc-toolbar) {
  flex-direction: row;
  gap: 0.5rem;
  padding: 0.5rem;
}

:deep(.fc .fc-toolbar-title) {
  font-size: clamp(1rem, 2vw, 2rem);
  text-align: center;
  text-transform: capitalize;
}

:deep(.fc .fc-toolbar-chunk) {
  display: flex;
  justify-content: center;
  width: 100%;
}

:deep(.fc .fc-button) {
  font-size: clamp(0.7rem, 1.5vw, 1rem);
  padding: 0.4rem 0.8rem;
  background-color: #d94a93 !important;
  border: none !important;
}

:deep(.fc .fc-daygrid-day-frame) {
  min-height: 60px;
  padding: 2px;
}

:deep(.fc .fc-daygrid-day-number) {
  font-size: clamp(0.7rem, 1.5vw, 1rem);
  padding: 2px 4px;
}

:deep(.fc-day-has-event) {
  cursor: pointer !important;
}

:deep(.fc .fc-col-header-cell-cushion) {
  font-size: clamp(0.5rem, 1vw, 1rem);
  padding: 4px 2px;
  font-weight: normal;
  text-transform: uppercase;
}

:deep(.fc-daygrid-day.fc-day-selected) {
  background-color: #fde2e2 !important;
  border-color: #f87171 !important;
}

:deep(.fc-dayGridMonth-view) {
  width: 100% !important;
}

:deep(.fc-day-has-event) {
  cursor: pointer !important;
}

:deep(.fc-event) {
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  padding: 1px 3px;
  margin: 1px 0;
}

:deep(.fc-event-title) {
  padding: 0 2px;
}


/* Media queries específicas */
@media (max-width: 768px) {
  .calendar-container {
    padding: 0.25rem;
  }

  :deep(.fc .fc-toolbar) {
    padding: 0.25rem;
  }

  :deep(.fc .fc-daygrid-day-frame) {
    min-height: 50px;
  }

  :deep(.fc-event) {
    min-height: 16px;
  }
  
}

@media (max-width: 480px) {
  :deep(.fc .fc-daygrid-day-frame) {
    min-height: 40px;
  }

  :deep(.fc .fc-button) {
    padding: 0.3rem 0.6rem;
  }

  :deep(.fc-event) {
    font-size: 0.6rem;
    line-height: 1.2;
  }
}

@media (min-width: 1024px) {
  :deep(.fc-event) {
    font-size: 14px;
  }

  :deep(.fc .fc-toolbar) {
    flex-direction: row;
  }

  :deep(.fc .fc-daygrid-day-frame) {
    min-height: 120px;
  }
}
</style>
