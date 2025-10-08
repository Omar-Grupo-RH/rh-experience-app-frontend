<script setup>
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

// 🧮 Supongamos que cada persona paga $1500
const pricePerPerson = 2100;

// Datos semanales (número de personas por tour)
const weeklyData = [12, 15, 10, 8, 14, 15, 9]; // 7 semanas de ejemplo

// Calculamos ingresos por semana
const weeklyIncome = weeklyData.map((count) => count * pricePerPerson);

// Etiquetas (nombres de las semanas)
const labels = [
  "Semana 1",
  "Semana 2",
  "Semana 3",
  "Semana 4",
  "Semana 5",
  "Semana 6",
  "Semana 7",
];

// Configuración del gráfico
const data = {
  labels,
  datasets: [
    {
      label: "Ingresos Semanales (MXN)",
      data: weeklyIncome,
      borderColor: "#d94a93", // verde Tailwind (emerald)
      backgroundColor: "#d94a93",
      tension: 0.3,
      fill: true,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: "top",
    },
    title: {
      display: true,
      text: "Ingreso Semanal",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => "$" + value.toLocaleString(),
      },
    },
  },
};
</script>

<template>
  <div class="bg-white p-5 rounded-lg shadow">
    <Line :data="data" :options="options" />
  </div>
</template>
