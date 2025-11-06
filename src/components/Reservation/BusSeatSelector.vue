<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";

const store = useReservaStore();

// configuración de asientos
const seatSize = 50;
const seatGap = 8;
const startX = 20;
const startY = 70;
const rowHeight = seatSize + 10;

const fixedOccupied = ["A1", "A2"]; // siempre ocupados
const dynamicOccupied = ref([]); // ocupados que vienen del backend

const rows = ["A", "B", "C", "D", "E", "F"];

// Generador de asientos
const seats = computed(() => {
  const arr = [];
  rows.forEach((rowLetter, rowIndex) => {
    const y = startY + rowIndex * rowHeight;

    if (rowLetter === "F") {
      for (let i = 1; i <= 4; i++)
        arr.push({
          id: `${rowLetter}${i}`,
          x: startX + (i - 1) * (seatSize + seatGap),
          y,
        });
    } else if (rowLetter === "A" || rowLetter === "B") {
      for (let i = 1; i <= 2; i++)
        arr.push({
          id: `${rowLetter}${i}`,
          x: startX + (i - 1) * (seatSize + seatGap),
          y,
        });
    } else {
      for (let i = 1; i <= 2; i++)
        arr.push({
          id: `${rowLetter}${i}`,
          x: startX + (i - 1) * (seatSize + seatGap),
          y,
        });
      arr.push({
        id: `${rowLetter}3`,
        x: startX + 2 * (seatSize + seatGap) + 60,
        y,
      });
    }
  });
  return arr;
});

// función que devuelve si un asiento está ocupado
function isOccupied(id) {
  return fixedOccupied.includes(id) || dynamicOccupied.value.includes(id);
}

// función para saber si el asiento está seleccionado
function isSelected(id) {
  return store.selectedSeats.includes(id);
}

// colores de los asientos
function seatFill(id) {
  if (isOccupied(id)) return "#d94a93";
  if (isSelected(id)) return "#2c5da7";
  return "#ece7e3";
}
function textFill(id) {
  if (isOccupied(id) || isSelected(id)) return "#ffffff";
  return "#000000";
}

// click en asiento
function onClickSeat(id) {
  if (isOccupied(id)) return; // nunca permitir seleccionar ocupados
  store.toggleSeat(id);
}

// tamaño del SVG
const svgWidth = 300;
const svgHeight = startY + rows.length * rowHeight + 40;

// actualizar dinámicamente los asientos ocupados al cambiar de viaje
watch(
  () => store.selectedTripId,
  async (newTripId) => {
    if (!newTripId) return;

    try {
      const data = await store.seatsSold(newTripId);
      dynamicOccupied.value = data.seats_location || [];
    } catch (error) {
      console.log(error);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <div class="text-black">
      <svg
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        width="100%"
        :height="svgHeight"
      >
        <!-- fondo -->
        <rect
          x="0"
          y="0"
          :width="svgWidth"
          :height="svgHeight"
          rx="12"
          fill="#f8fafc"
        />

        <!-- conductor / guía -->
        <g transform="translate(20,14)">
          <rect x="-15" y="0" width="95%" height="24" rx="6" fill="#e6f2ff" />
          <text
            x="45%"
            y="16"
            font-size="14"
            text-anchor="middle"
            fill="#0f172a"
          >
            Conductor
          </text>
        </g>

        <!-- asientos -->
        <g
          v-for="seat in seats"
          :key="seat.id"
          :transform="`translate(${seat.x}, ${seat.y})`"
        >
          <g
            tabindex="0"
            @click="onClickSeat(seat.id)"
            :aria-label="`Asiento ${seat.id}`"
            role="button"
            cursor="pointer"
          >
            <rect
              :width="seatSize"
              :height="seatSize"
              rx="6"
              :fill="seatFill(seat.id)"
              stroke="#374151"
              stroke-width="2"
            />
            <text
              :x="seatSize / 2"
              :y="seatSize / 2 + 4"
              font-size="12"
              text-anchor="middle"
              :fill="textFill(seat.id)"
              style="font-weight: 600"
            >
              {{ seat.id }}
            </text>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>
