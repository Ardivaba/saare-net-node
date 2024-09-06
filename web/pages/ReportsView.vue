<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">Raportid</h1>

    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <div class="mb-4 flex space-x-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Algus</span>
        </label>
        <input v-model="startDate" type="date" class="input input-bordered" @change="fetchData" />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Lõpp</span>
        </label>
        <input v-model="endDate" type="date" class="input input-bordered" @change="fetchData" />
      </div>
    </div>

    <div v-if="reportsStore.loading" class="text-center my-4">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <div v-else-if="reportsStore.error" class="alert alert-error shadow-lg mb-4">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ reportsStore.error }}</span>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Kogu Toodang</h2>
          <TotalProductionChart :chartData="totalProductionChartData" />
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Toodetud Tooted</h2>
          <ProductionByCodeChart :chartData="productionByCodeChartData" />
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl col-span-2">
        <div class="card-body">
          <h2 class="card-title">Töötajate Toodang</h2>
          <div class="mb-4">
            <WorkerDropdown
              :workers="reportsStore.workers"
              v-model="selectedWorkers"
              @update:modelValue="fetchWorkerProduction"
            />
          </div>
          <WorkerProductionChart 
            :chartData="workerProductionChartData" 
            :startDate="startDate"
            :endDate="endDate"
          />
        </div>
      </div>
    </div>

    <div v-if="showDocumentation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 z-50" @click.self="showDocumentation = false">
      <div class="bg-base-100 p-8 rounded-lg max-w-4xl w-full h-5/6 overflow-auto">
        <h2 class="text-2xl font-bold mb-6">Documentation</h2>
        <vue-markdown-render :source="documentationContent" class="prose max-w-none"/>
        <button class="mt-6 btn btn-primary" @click="showDocumentation = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useReportsStore } from '../stores/reports';
import TotalProductionChart from '../components/TotalProductionChart.vue';
import ProductionByCodeChart from '../components/ProductionByCodeChart.vue';
import WorkerProductionChart from '../components/WorkerProductionChart.vue';
import WorkerDropdown from '../components/WorkerDropdown.vue';
import VueMarkdownRender from 'vue-markdown-render';

const reportsStore = useReportsStore();

const startDate = ref(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);
const showDocumentation = ref(false);
const documentationContent = ref('');
const selectedWorkers = ref([]);

const totalProductionChartData = computed(() => ({
  labels: reportsStore.totalProduction.map(item => item.date),
  datasets: [{
    label: 'Toodetud Toodang',
    data: reportsStore.totalProduction.map(item => item.total),
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
}));

const productionByCodeChartData = computed(() => ({
  labels: reportsStore.productionByCode.map(item => item.code),
  datasets: [{
    label: 'Tootmine Joosepi Koodi Järgi',
    data: reportsStore.productionByCode.map(item => item.total),
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
    ],
    borderColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
    ],
    borderWidth: 1
  }]
}));

const workerProductionChartData = computed(() => ({
  datasets: reportsStore.workerProduction.map(worker => ({
    label: worker.name,
    data: worker.data.map(item => ({
      x: item.date,
      y: item.total
    })),
    borderColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
    tension: 0.1
  }))
}));

onMounted(async () => {
  await fetchData();
  await reportsStore.fetchWorkers();

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/ReportsView.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((ReportsView_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

async function fetchData() {
  try {
    await Promise.all([
      reportsStore.fetchTotalProduction(startDate.value, endDate.value),
      reportsStore.fetchProductionByCode(startDate.value, endDate.value)
    ]);
  } catch (error) {
    console.error('Error fetching report data:', error);
    reportsStore.error = 'Failed to load report data. Please try again.';
  }
}

async function fetchWorkerProduction() {
  if (selectedWorkers.value.length > 0) {
    try {
      await reportsStore.fetchWorkerProduction(startDate.value, endDate.value, selectedWorkers.value);
    } catch (error) {
      console.error('Error fetching worker production data:', error);
      reportsStore.error = 'Failed to load worker production data. Please try again.';
    }
  }
}
</script>

<style scoped>
.prose {
  max-width: none;
}
.prose img {
  max-width: 100%;
  height: auto;
}
</style>