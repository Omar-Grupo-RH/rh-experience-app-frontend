<script setup>
import { useReservaStore } from "@/stores/reservaStore";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ref, watch } from "vue";
import esLocale from "@fullcalendar/core/locales/es";

const store = useReservaStore();
const selectedDate = ref(store.date);

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
  events: [
    // Puedes cargar eventos desde tu API o dejar algunos fijos
  ],
  // 🟢 Esta función se ejecuta cuando haces clic en una fecha
  dateClick(info) {
    document.querySelectorAll(".fc-daygrid-day").forEach((day) => {
      day.classList.remove("fc-day-selected");
    });

    // marcar el nuevo día
    info.dayEl.classList.add("fc-day-selected");

    // guardar fecha en store
    const dateStr = info.dateStr;
    selectedDate.value = dateStr;
    store.setDate(dateStr);
  },
});

// Si el store cambia por otro lado (por ejemplo desde input manual), lo reflejamos:
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
.fc-dayGridMonth-view{
    width: 100% !important;
}
</style>
