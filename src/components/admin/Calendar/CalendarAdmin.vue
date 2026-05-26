<script setup>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ref, onMounted, watch, onUnmounted, computed } from "vue";
import { useCalendarStore } from "@/stores/admin/calendarStore";
import { useAuth } from "@/composables/useAuth";

const store = useCalendarStore();
const { adminLevel } = useAuth();

const calendarRef = ref(null);

const canManageEvents = computed(() => Number(adminLevel.value) === 1);

const isMobile = () => window.innerWidth < 768;

const handleDateClick = (info) => {
  if (!canManageEvents.value) return;

  store.addEvent(info);
};

const handleEventDrop = (info) => {
  if (!canManageEvents.value) {
    info.revert();
    return;
  }

  store.handleEventDrop(info);
};

const handleEventClick = (info) => {
  store.handleEventClick(info, {
    canManage: canManageEvents.value,
  });
};

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  locale: "es",

  eventColor: "#d94a93",
  eventTextColor: "#fff",

  fixedWeekCount: false,
  showNonCurrentDates: false,

  selectable: canManageEvents.value,
  editable: canManageEvents.value,
  eventStartEditable: canManageEvents.value,
  eventDurationEditable: false,

  expandRows: true,

  height: "auto",
  contentHeight: "auto",
  aspectRatio: 1.15,

  headerToolbar: {
    left: "prev",
    center: "title",
    right: "next",
  },

  views: {
    dayGridMonth: {
      titleFormat: {
        year: "numeric",
        month: "long",
      },
      dayHeaderFormat: {
        weekday: "short",
      },
      dayMaxEvents: 2,
    },
  },

  buttonText: {
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    list: "Lista",
  },

  events: [],

  dateClick: handleDateClick,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,

  eventDidMount(info) {
    const today = new Date().toISOString().split("T")[0];

    if (info.event.startStr < today) {
      info.el.style.opacity = "0.4";
      info.el.style.pointerEvents = "none";
    }

    if (!canManageEvents.value) {
      info.el.style.cursor = "pointer";
    }
  },
});

function syncCalendar() {
  const api = calendarRef.value?.getApi?.();
  if (!api) return;

  api.removeAllEvents();
  store.events.forEach((ev) => api.addEvent(ev));
}

function updatePermissions() {
  const api = calendarRef.value?.getApi?.();
  if (!api) return;

  api.setOption("selectable", canManageEvents.value);
  api.setOption("editable", canManageEvents.value);
  api.setOption("eventStartEditable", canManageEvents.value);
  api.setOption("eventDurationEditable", false);
}

function updateResponsiveOptions() {
  const api = calendarRef.value?.getApi?.();
  if (!api) return;

  const mobile = isMobile();

  api.setOption("aspectRatio", mobile ? 0.9 : 1.15);

  api.setOption("views", {
    dayGridMonth: {
      titleFormat: mobile
        ? { year: "numeric", month: "short" }
        : { year: "numeric", month: "long" },

      dayHeaderFormat: mobile
        ? { weekday: "narrow" }
        : { weekday: "short" },

      dayMaxEvents: mobile ? 1 : 2,
    },
  });

  updatePermissions();
  api.updateSize();
}

onMounted(async () => {
  await store.loadEvents();

  setTimeout(() => {
    syncCalendar();
    updateResponsiveOptions();
    updatePermissions();
  }, 100);

  window.addEventListener("resize", updateResponsiveOptions);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateResponsiveOptions);
});

watch(
  () => store.events,
  () => syncCalendar(),
  { deep: true }
);

watch(
  () => canManageEvents.value,
  () => updatePermissions()
);
</script>

<template>
  <div class="space-y-4">
  
    <div class="calendar-container">
      <FullCalendar ref="calendarRef" :options="calendarOptions" />
    </div>
  </div>
</template>

<style>
.calendar-container {
  width: 100%;
  max-width: 100%;
  min-height: 520px;
  overflow-x: hidden;
}

.fc {
  width: 100% !important;
  max-width: 100% !important;
}

.fc-button {
  background-color: #d94a93 !important;
  border: none !important;
  box-shadow: none !important;
}

.fc-daygrid-day.fc-day-past {
  opacity: 0.4;
  pointer-events: none;
}

.fc-day-has-event {
  cursor: pointer !important;
}

.fc .fc-toolbar {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.fc .fc-toolbar-chunk {
  width: auto !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fc .fc-toolbar-title {
  font-size: clamp(1.35rem, 5vw, 2rem);
  font-weight: 600;
  line-height: 1.1;
  text-align: center;
  text-transform: capitalize;
  white-space: normal;
}

.fc .fc-button {
  width: 44px;
  height: 44px;
  padding: 0 !important;
  border-radius: 10px !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.fc .fc-icon {
  font-size: 1.3rem;
}

.fc .fc-scrollgrid,
.fc .fc-scrollgrid table {
  width: 100% !important;
}

.fc .fc-col-header-cell-cushion {
  display: block;
  width: 100%;
  padding: 0.45rem 0.15rem;
  font-size: clamp(0.65rem, 2.8vw, 0.9rem);
  font-weight: 600;
  text-transform: uppercase;
  text-align: center;
}

.fc .fc-daygrid-day-frame {
  min-height: 72px;
  padding: 2px;
}

.fc .fc-daygrid-day-number {
  font-size: clamp(0.75rem, 2.8vw, 0.95rem);
  padding: 4px;
}

.fc-event {
  font-size: clamp(0.6rem, 2.4vw, 0.8rem);
  line-height: 1.2;
  padding: 1px 3px;
  margin: 1px 0;
  border-radius: 6px;
}

.fc-event-title {
  padding: 0 2px;
}

.fc-daygrid-day.fc-day-selected {
  background-color: #fde2e2 !important;
  border-color: #f87171 !important;
}

@media (max-width: 768px) {
  .calendar-container {
    min-height: 480px;
  }

  .fc .fc-toolbar {
    grid-template-columns: 40px 1fr 40px;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .fc .fc-button {
    width: 40px;
    height: 40px;
    border-radius: 9px !important;
  }

  .fc .fc-daygrid-day-frame {
    min-height: 58px;
  }

  .fc .fc-toolbar-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .calendar-container {
    min-height: 430px;
  }

  .fc .fc-toolbar {
    grid-template-columns: 38px 1fr 38px;
  }

  .fc .fc-button {
    width: 38px;
    height: 38px;
  }

  .fc .fc-toolbar-title {
    font-size: 1.35rem;
  }

  .fc .fc-daygrid-day-frame {
    min-height: 48px;
  }

  .fc .fc-col-header-cell-cushion {
    font-size: 0.65rem;
  }

  .fc-event {
    font-size: 0.6rem;
  }
}

@media (min-width: 1024px) {
  .calendar-container {
    min-height: 720px;
  }

  .fc .fc-daygrid-day-frame {
    min-height: 110px;
  }

  .fc-event {
    font-size: 14px;
  }
}
</style>