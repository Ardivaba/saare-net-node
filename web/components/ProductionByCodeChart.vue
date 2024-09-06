<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
});

const chartCanvas = ref(null);
let chart = null;

onMounted(() => {
  createChart();
});

watch(() => props.chartData, (newData) => {
  if (chart) {
    chart.data = newData;
    chart.update();
  }
}, { deep: true });

function createChart() {
  const ctx = chartCanvas.value.getContext('2d');
  chart = new Chart(ctx, {
    type: 'pie',
    data: props.chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Toodang Retsepti Koodi Järgi'
        }
      }
    }
  });
}
</script>