<script setup>
import { useReservaStore } from "@/stores/public/reservaStore";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ref, watch, onMounted, computed, onUnmounted } from "vue";
import esLocale from "@fullcalendar/core/locales/es";
import Swal from "sweetalert2";
import { formatDateToSpanish } from "@/utils/formatDate";
import SkeletonCalendar from "@/components/ui/SkeletonCalendar.vue";

const store = useReservaStore();
const selectedDate = ref(store.date);
const calendarRef = ref(null);
const events = computed(() => store.events);

const loading = ref(true);

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
  selectable: true,
  editable: false,
  fixedWeekCount: false,
  showNonCurrentDates: false,
  headerToolbar: {
    left: "prev",
    center: "title",
    right: "next",
  },
  locale: esLocale,
  events: events.value,

  height: "auto",
  contentHeight: "auto",
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

  // Botones responsive
  buttonText: {
    today: isMobile.value ? "Hoy" : "Hoy",
    month: isMobile.value ? "Mes" : "Mes",
    week: isMobile.value ? "Sem." : "Semana",
    day: isMobile.value ? "Día" : "Día",
    list: isMobile.value ? "Lista" : "Lista",
  },

  eventDidMount(info) {
    const today = new Date().toISOString().split("T")[0];
    if (info.event.startStr < today) {
      info.el.style.opacity = "0.4";
      info.el.style.pointerEvents = "none";
    }

    // Ajustar contenido de eventos para móvil
    if (isMobile.value) {
      info.el.style.fontSize = "0.7rem";
      info.el.style.padding = "1px 2px";
    }
  },

  dateClick(info) {
    const clickedDate = info.dateStr;
    const event = store.events.find((ev) => ev.start === clickedDate);

    if (!event) {
      Swal.fire({
        title: `Opps!`,
        text: "Solamente puedes seleccionar los días donde hay RH EXPERIENCE",
        icon: "warning",
        timer: 3000,
      });
      return;
    }

    if (event.start < new Date().toISOString().split("T")[0]) {
      Swal.fire({
        title: `Opps!`,
        text: "No puedes seleccionar una fecha pasada.",
        icon: "warning",
        timer: 3000,
      });
      return;
    }

    store.selectedTripId = event.id;
    store.selectedSeats = [];

    const dayEl =
      info.dayEl || info.jsEvent?.target?.closest?.(".fc-daygrid-day");
    if (dayEl) selectDay(dayEl, clickedDate, event);
  },

  eventClick(info) {
    store.selectedTripId = info.event.id;
    store.selectedSeats = [];
    const clickedDate = info.event.startStr;
    const event = store.events.find((ev) => ev.start === clickedDate);

    const clickTarget = info.jsEvent?.target || info.el || null;
    const dayEl = clickTarget ? clickTarget.closest(".fc-daygrid-day") : null;
    const usedDayEl =
      dayEl ||
      (info.el && info.el.closest ? info.el.closest(".fc-daygrid-day") : null);

    if (usedDayEl) {
      selectDay(usedDayEl, info.event.startStr, event);
    } else {
      selectedDate.value = info.event.startStr;
      Swal.fire({
        title: `¿Reservar para el ${formatDateToSpanish(info.event.startStr)}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#d94a93",
        cancelButtonColor: "#adadad",
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          store.setDate(info.event.startStr);
          store.step++;
        }
      });
    }
  },
});

function selectDay(dayEl, dateStr, eventInfo) {
  const { total_seats } = eventInfo;
  const hasSeats = total_seats >= 1; // validación directa

  // Quitar selección previa
  document.querySelectorAll(".fc-daygrid-day").forEach((day) => {
    day.classList.remove("fc-day-selected");
  });

  // Seleccionar el día actual
  dayEl.classList.add("fc-day-selected");
  selectedDate.value = dateStr;

  // Si NO hay lugares disponibles → mostrar Swal de alerta y salir
  if (!hasSeats) {
    Swal.fire({
      title: "Sin lugares disponibles",
      text: "Ya no hay asientos disponibles para esta fecha.",
      icon: "warning",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#d94a93",
    });
    return; // detener el flujo
  }

  // Si SÍ hay lugares → mostrar Swal normal de confirmación
  Swal.fire({
    title: `¿Reservar para el ${formatDateToSpanish(dateStr)}?`,
    text: `Lugares disponibles: ${total_seats}`,
    icon: "question",
    confirmButtonText: "Confirmar",
    showCancelButton: true,
    cancelButtonColor: "#adadad",
    confirmButtonColor: "#d94a93",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      store.setDate(dateStr);
      store.step++;
    }
  });
}

function syncCalendar() {
  const api = calendarRef.value?.getApi?.();
  if (!api) return;

  api.removeAllEvents();
  if (events.value.length > 0) {
    events.value.forEach((ev) => api.addEvent(ev));
  }
}

function updateCalendarView() {
  const api = calendarRef.value?.getApi?.();
  if (!api) return;

  // Forzar actualización de la vista
  api.updateSize();
}

onMounted(async () => {
  await store.loadEvents();
  loading.value = false;

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

// Watch para cambios en responsive
watch([isMobile, isTablet], () => {
  setTimeout(updateCalendarView, 100);
});
</script>

<template>
  <div class="calendar-container">
    <SkeletonCalendar v-if="loading" />
    <FullCalendar v-else ref="calendarRef" :options="calendarOptions" />
  </div>
</template>

<style scoped>
.calendar-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  padding: 0.5rem;
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
