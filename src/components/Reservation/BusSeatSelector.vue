<script setup>
import { ref, computed, watch } from "vue";
import { useReservaStore } from "@/stores/public/reservaStore";
import api from "@/lib/axios";
import {
  DEFAULT_BUS_CAPACITY,
  STAFF_SEATS,
  getBusRows,
  normalizeBusCapacity,
} from "@/utils/busLayout";

const props = defineProps({
  selectedTripId: {
    type: Number,
    default: null,
  },
});

const store = useReservaStore();

// configuración de asientos
const seatSize = 50;
const seatGap = 8;
const startX = 20;
const startY = 70;
const rowHeight = seatSize + 10;

const fixedOccupied = STAFF_SEATS; // siempre ocupados
const dynamicOccupied = ref([]); // ocupados que vienen del backend
const selectedSeatForModal = ref(null); // asiento seleccionado en modo modal
const capacity = ref(DEFAULT_BUS_CAPACITY); // 8 o 15 según el viaje

const rows = computed(() => getBusRows(capacity.value));

const emit = defineEmits(["seat-selected"]);

// Generador de asientos
const seats = computed(() => {
  const arr = [];
  rows.value.forEach(({ row: rowLetter, seats: count }, rowIndex) => {
    const y = startY + rowIndex * rowHeight;

    if (count === 3) {
      // 2 asientos + pasillo + 1 asiento
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
    } else {
      for (let i = 1; i <= count; i++)
        arr.push({
          id: `${rowLetter}${i}`,
          x: startX + (i - 1) * (seatSize + seatGap),
          y,
        });
    }
  });
  return arr;
});

function applyTripData(trip) {
  dynamicOccupied.value = trip?.seats_location || [];
  capacity.value = normalizeBusCapacity(trip?.total_seats);
}

// función que devuelve si un asiento está ocupado
function isOccupied(id) {
  return fixedOccupied.includes(id) || dynamicOccupied.value.includes(id);
}

// función para saber si el asiento está seleccionado
function isSelected(id) {
  // Si estamos en modo modal de reagendamiento
  if (props.selectedTripId && !store.selectedTripId) {
    return selectedSeatForModal.value === id;
  }

  // Modo normal en reserva
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

  if (props.selectedTripId && !store.selectedTripId) {
    // Cuando se usa en el modal de reagendamiento
    if (selectedSeatForModal.value === id) {
      selectedSeatForModal.value = null;
      emit("seat-selected", null);
    } else {
      selectedSeatForModal.value = id;
      emit("seat-selected", id);
    }
  } else {
    // Comportamiento normal en reserva
    store.toggleSeat(id);
  }
}

// Cargar asientos ocupados del backend
const loadOccupiedSeats = async (tripId) => {
  if (!tripId) {
    applyTripData(null);
    return;
  }

  try {
    const { data } = await api.get("/trip", { params: { id: tripId } });

    applyTripData(data?.data);
  } catch (error) {
    console.error("Error cargando asientos:", error);
    applyTripData(null);
  }
};

// tamaño del SVG
const svgWidth = 300;
const svgHeight = computed(
  () => startY + rows.value.length * rowHeight + 40,
);

// actualizar dinámicamente los asientos ocupados
watch(
  () => props.selectedTripId,
  (newTripId) => {
    // Si hay un tripId en prop (modo modal), cargar de la prop
    if (newTripId) {
      loadOccupiedSeats(newTripId);
    }
  },
  { immediate: true },
);

// También monitorear store.selectedTripId para el modo normal
watch(
  () => store.selectedTripId,
  async (newTripId) => {
    // Solo si NO estamos en modo modal
    if (!props.selectedTripId && newTripId) {
      try {
        const data = await store.seatsSold(newTripId);
        applyTripData(data);
      } catch (error) {
        console.log(error);
      }
    }
  },
  { immediate: true },
);

// Resetear asiento seleccionado cuando cambia el tour en modo modal
watch(
  () => props.selectedTripId,
  () => {
    selectedSeatForModal.value = null;
  },
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
