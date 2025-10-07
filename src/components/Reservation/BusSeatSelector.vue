<script setup>
import { computed } from "vue";
import { useReservaStore } from "@/stores/reservaStore";

const store = useReservaStore();

// configuración
const seatSize = 50;
const seatGap = 8;
const startX = 20;
const startY = 70;
const rowHeight = seatSize + 10;

const occupied = ["A1", "A2"]; // ejemplo
const occupiedSet = new Set(occupied);

// filas del bus
const rows = ["A","B","C","D","E","F","G","H"];

// Generador de asientos según fila
const seats = computed(() => {
  const arr = [];
  rows.forEach((rowLetter, rowIndex) => {
    const y = startY + rowIndex * rowHeight;

    if (rowLetter === "H") {
      // últimas filas: 3 asientos juntos
      for (let i = 1; i <= 3; i++) {
        arr.push({
          id: `${rowLetter}${i}`,
          x: startX + i * (seatSize + seatGap) - (seatSize + seatGap), // 0,1,2
          y,
        });
      }

    }
    else if (rowLetter === "A") {
      // últimas filas: 3 asientos juntos
      for (let i = 1; i <= 2; i++) {
        arr.push({
          id: `${rowLetter}${i}`,
          x: startX + i * (seatSize + seatGap) - (seatSize + seatGap), // 0,1,2
          y,
        });
      }
    }
    else {
      // filas normales: 2 izquierda, 1 derecha (pasillo 40px)
      for (let i = 1; i <= 2; i++) {
        arr.push({ id: `${rowLetter}${i}`, x: startX + (i-1)*(seatSize + seatGap), y });
      }
      // asiento derecho
      arr.push({ id: `${rowLetter}3`, x: startX + 2*(seatSize + seatGap) + 30, y });
    }
  });
  return arr;
});

// utilidades
function isOccupied(id) { return occupiedSet.has(id); }
function isSelected(id) { return store.selectedSeats.includes(id); }
function seatFill(id) {
  if (isOccupied(id)) return "#d94a93";
  if (isSelected(id)) return "#2c5da7";
  return "#ece7e3";
}
function onClickSeat(id) {
  if (isOccupied(id)) return;
  store.toggleSeat(id);
}

// SVG tamaño
const svgWidth = 300;
const svgHeight = startY + rows.length * rowHeight + 40;
</script>

<template>
  <div class="w-full overflow-auto text-black">
    <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" width="100%" :height="svgHeight">
      <!-- fondo -->
      <rect x="0" y="0" :width="svgWidth" :height="svgHeight" rx="12" fill="#f8fafc"/>

      <!-- conductor / guía -->
      <g transform="translate(20,14)">
        <rect x="-15" y="0" width="95%" height="24" rx="6" fill="#e6f2ff"/>
        <text x="45%" y="16" font-size="14" text-anchor="middle" fill="#0f172a">Conductor</text>
      </g>

      <!-- asientos -->
      <g v-for="seat in seats" :key="seat.id" :transform="`translate(${seat.x}, ${seat.y})`">
        <g tabindex="0" @click="onClickSeat(seat.id)" :aria-label="`Asiento ${seat.id}`" role="button" cursor="pointer">
          <rect :width="seatSize" :height="seatSize" rx="6" :fill="seatFill(seat.id)" stroke="#374151" stroke-width="2"/>
          <text :x="seatSize/2" :y="seatSize/2 + 4" font-size="12" text-anchor="middle" fill="#111" style="font-weight:600">{{ seat.id }}</text>
        </g>
      </g>
    </svg>
  </div>
</template>
