<script setup>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ref, onMounted, watch } from "vue";
import { useCalendarStore } from "@/stores/admin/calendarStore";

const store = useCalendarStore();
const calendarRef = ref(null);

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

onMounted(async () => {
  await store.loadEvents();
  syncCalendar();
});

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