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
  aspectRatio:  1.45,

  views: {
    dayGridMonth: {
      titleFormat: isMobile.value
        ? { year: "numeric", month: "short" }
        : { year: "numeric", month: "short" },
      dayHeaderFormat: isMobile.value
        ? { weekday: "short" }
        : { weekday: "short" },
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
  <div class="calendar-wrapper">
    <div class="calendar-container">
      <SkeletonCalendar v-if="loading" />
      <FullCalendar v-else ref="calendarRef" :options="calendarOptions" />
      <div class="mt-8 flex flex-col md:flex-row gap-3 justify-between">
      <button
        type="button"
        class="px-6 py-3 rounded-md cursor-pointer bg-gray-200 text-gray-800 font-medium w-full md:w-auto"
        @click="store.prev"
      >
        Regresar
      </button>
    </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0.75rem;
}

.calendar-container {
  width: 100%;
  max-width: 860px;
  min-height: 360px;
  padding: 0.75rem;
  border-radius: 1rem;
  background: #ffffff;
}

/* FullCalendar base */
:deep(.fc) {
  width: 100%;
  font-size: clamp(0.75rem, 1.2vw, 0.95rem);
}

/* Header */
:deep(.fc .fc-toolbar) {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0 0.75rem;
  margin-bottom: 0 !important;
}

:deep(.fc .fc-toolbar-chunk) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
}

:deep(.fc .fc-toolbar-title) {
  font-size: clamp(1rem, 2vw, 1.45rem);
  font-weight: 700;
  text-align: center;
  text-transform: capitalize;
}

/* Botones */
:deep(.fc .fc-button) {
  width: 38px;
  height: 38px;
  padding: 0 !important;
  border-radius: 999px !important;
  background-color: #d94a93 !important;
  border: none !important;
  box-shadow: none !important;
}

:deep(.fc .fc-button:hover) {
  background-color: #c43f83 !important;
}

:deep(.fc .fc-button:focus) {
  box-shadow: none !important;
}

/* Tabla */
:deep(.fc-scrollgrid) {
  border-radius: 0.75rem;
  overflow: hidden;
  border-color: #e5e7eb !important;
}

:deep(.fc-theme-standard td),
:deep(.fc-theme-standard th) {
  border-color: #e5e7eb !important;
}

/* Días de la semana */
:deep(.fc .fc-col-header-cell) {
  background-color: #f8fafc;
}

:deep(.fc .fc-col-header-cell-cushion) {
  padding: 0.5rem 0.25rem;
  font-size: clamp(0.65rem, 1vw, 0.8rem);
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
}

/* Celdas */
:deep(.fc .fc-daygrid-day-frame) {
  min-height: 72px;
  padding: 0.25rem;
}

:deep(.fc .fc-daygrid-day-number) {
  padding: 0.25rem;
  font-size: clamp(0.75rem, 1vw, 0.9rem);
  font-weight: 600;
  color: #334155;
}

/* Eventos */
:deep(.fc-event) {
  margin-top: 0.15rem;
  padding: 0.15rem 0.25rem;
  border-radius: 0.35rem;
  font-size: clamp(0.62rem, 0.9vw, 0.78rem);
  line-height: 1.15;
}

:deep(.fc-event-title) {
  padding: 0;
  white-space: normal;
}

/* Día con evento */
:deep(.fc-day-has-event) {
  cursor: pointer !important;
}

/* Día seleccionado */
:deep(.fc-daygrid-day.fc-day-selected) {
  background-color: #fde2e2 !important;
  border-color: #f87171 !important;
}

/* Mobile */
@media (max-width: 640px) {
  .calendar-wrapper {
    padding: 0.25rem;
  }

  .calendar-container {
    max-width: 100%;
    padding: 0.35rem;
    min-height: 320px;
  }

  :deep(.fc .fc-toolbar) {
    grid-template-columns: 36px 1fr 36px;
    gap: 0.25rem;
    padding-bottom: 0.5rem;
  }

  :deep(.fc .fc-toolbar-title) {
    font-size: 1rem;
  }

  :deep(.fc .fc-button) {
    width: 32px;
    height: 32px;
  }

  :deep(.fc .fc-daygrid-day-frame) {
    min-height: 48px;
    padding: 0.15rem;
  }

  :deep(.fc .fc-daygrid-day-number) {
    font-size: 0.7rem;
    padding: 0.15rem;
  }

  :deep(.fc .fc-col-header-cell-cushion) {
    font-size: 0.62rem;
    padding: 0.35rem 0.1rem;
  }

  :deep(.fc-event) {
    font-size: 0.58rem;
    padding: 0.08rem 0.15rem;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1023px) {
  .calendar-container {
    max-width: 760px;
  }

  :deep(.fc .fc-daygrid-day-frame) {
    min-height: 64px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .calendar-container {
    max-width: 820px;
  }

  :deep(.fc .fc-daygrid-day-frame) {
    min-height: 76px;
  }
}
</style>