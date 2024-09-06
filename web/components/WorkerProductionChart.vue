<template>
  <div>
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { addDays, format, parseISO } from 'date-fns';
import 'chartjs-adapter-date-fns';

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  }
});

const chartRef = ref(null);
let chart = null;

onMounted(() => {
  createChart();
});

watch(() => props.chartData, (newData) => {
  if (chart) {
    updateChartData(newData);
  } else {
    createChart();
  }
}, { deep: true });

function createChart() {
  const ctx = chartRef.value.getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: transformChartData(props.chartData),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Toodetud Kogus'
          }
        },
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MMM d'
            }
          },
          title: {
            display: true,
            text: 'Kuupäev'
          }
        }
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false
        }
      }
    }
  });
}

function updateChartData(newData) {
  chart.data = transformChartData(newData);
  chart.update();
}

function transformChartData(data) {
  const start = parseISO(props.startDate);
  const end = parseISO(props.endDate);
  const days = [];
  let current = start;

  while (current <= end) {
    days.push(format(current, 'yyyy-MM-dd'));
    current = addDays(current, 1);
  }

  const datasets = data.datasets.map(dataset => {
    const transformedData = days.map(day => {
      const dataPoint = dataset.data.find(d => d.x === day);
      return {
        x: day,
        y: dataPoint ? dataPoint.y : 0
      };
    });

    return {
      ...dataset,
      data: transformedData
    };
  });

  return {
    labels: days,
    datasets: datasets
  };
}
</script>