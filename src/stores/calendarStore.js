import { defineStore } from "pinia";
import { ref } from "vue";

export const useCalendarStore = defineStore("calendar", () => {
    
  const events = ref([
    {
      id: String(Date.now()),
      title: "RH EXPERIENCE",
      start: "2025-10-08",
      allDay: true,
    },
  ]);
  const selectedDate = ref(null);

  function setEvents(newEvents) {
    events.value = newEvents;
  }

  function addEvent(event) {
    events.value.push(event);
  }

  function updateEvent(id, newData) {
    const index = events.value.findIndex((e) => e.id === id);
    if (index !== -1)
      events.value[index] = { ...events.value[index], ...newData };
  }

  function removeEvent(id) {
    events.value = events.value.filter((e) => e.id !== id);
  }

  return {
    events,
    selectedDate,
    setEvents,
    addEvent,
    updateEvent,
    removeEvent,
  };
});
