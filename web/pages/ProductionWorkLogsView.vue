<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">Tootmistöö logid</h1>
    
    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <div class="mb-4 flex justify-between items-center">
      <button class="btn btn-secondary" @click="toggleFilters">
        {{ showFilters ? 'Peida filtrid' : 'Filtreeri' }}
      </button>
    </div>

    <!-- Filters -->
    <div v-if="showFilters" class="mb-4 bg-base-200 p-4 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Alguskuupäev</span>
          </label>
          <input v-model="filters.startDate" type="date" class="input input-bordered" />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Lõppkuupäev</span>
          </label>
          <input v-model="filters.endDate" type="date" class="input input-bordered" />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Töötaja nimi</span>
          </label>
          <input v-model="filters.workerName" type="text" class="input input-bordered" placeholder="Filtreeri töötaja nime järgi" />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Retsepti kood</span>
          </label>
          <input v-model="filters.recipeCode" type="text" class="input input-bordered" placeholder="Filtreeri retsepti koodi järgi" />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Toodetud kogus</span>
          </label>
          <div class="flex space-x-2">
            <input v-model="filters.minProducedQuantity" type="number" class="input input-bordered w-1/2" placeholder="Min" />
            <input v-model="filters.maxProducedQuantity" type="number" class="input input-bordered w-1/2" placeholder="Max" />
          </div>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Tootmise ID</span>
          </label>
          <input v-model="filters.productionId" type="number" class="input input-bordered" placeholder="Filtreeri tootmise ID järgi" />
        </div>
      </div>
      <div class="mt-4 flex justify-end space-x-2">
        <button class="btn btn-error" @click="resetFilters">Lähtesta</button>
        <button class="btn btn-primary" @click="applyFilters">Rakenda filtrid</button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
        <tr>
          <th @click="sort('id')">ID {{ sortIcon('id') }}</th>
          <th @click="sort('production.id')">Tootmise ID {{ sortIcon('production.id') }}</th>
          <th @click="sort('production.recipe_code')">Retsepti kood {{ sortIcon('production.recipe_code') }}</th>
          <th @click="sort('worker.name')">Töötaja nimi {{ sortIcon('worker.name') }}</th>
          <th @click="sort('duration_seconds')">Kestus (s) {{ sortIcon('duration_seconds') }}</th>
          <th @click="sort('produced_quantity')">Toodetud kogus {{ sortIcon('produced_quantity') }}</th>
          <th @click="sort('created_at')">Loodud {{ sortIcon('created_at') }}</th>
          <th @click="sort('updated_at')">Uuendatud {{ sortIcon('updated_at') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="workLog in workLogs" :key="workLog.id">
          <td>{{ workLog.id }}</td>
          <td>{{ workLog.production_id }}</td>
          <td>
            <router-link 
              :to="{ name: 'productions', query: { recipeCode: workLog.production?.recipe_code } }" 
              class="text-blue-500 hover:underline"
            >
              {{ workLog.production ? workLog.production.recipe_code : 'M/S' }}
            </router-link>
          </td>
          <td>{{ workLog.worker ? workLog.worker.name : 'M/S' }}</td>
          <td>{{ formatDuration(workLog.duration_seconds) }}</td>
          <td>{{ workLog.produced_quantity.toFixed(2) }}</td>
          <td>{{ formatDate(workLog.created_at) }}</td>
          <td>{{ formatDate(workLog.updated_at) }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 flex justify-between items-center">
      <div>
        Lehekülg {{ currentPage }} / {{ totalPages }}
      </div>
      <div>
        <button
            :disabled="currentPage === 1"
            class="btn btn-sm mr-2"
            @click="changePage(-1)"
        >
          Eelmine
        </button>
        <button
            :disabled="currentPage === totalPages"
            class="btn btn-sm"
            @click="changePage(1)"
        >
          Järgmine
        </button>
      </div>
    </div>

    <!-- Documentation modal -->
    <div v-if="showDocumentation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 z-50" @click.self="showDocumentation = false">
      <div class="bg-base-100 p-8 rounded-lg max-w-4xl w-full h-5/6 overflow-auto">
        <h2 class="text-2xl font-bold mb-6">Dokumentatsioon</h2>
        <vue-markdown-render :source="documentationContent" class="prose max-w-none"/>
        <button class="mt-6 btn btn-primary" @click="showDocumentation = false">Sulge</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProductionWorkLogStore } from '../stores/productionWorkLogs';
import VueMarkdownRender from 'vue-markdown-render';
import { useRoute, useRouter } from 'vue-router';

const productionWorkLogStore = useProductionWorkLogStore();
const route = useRoute();
const router = useRouter();

const workLogs = computed(() => productionWorkLogStore.workLogs);
const currentPage = computed(() => productionWorkLogStore.currentPage);
const totalPages = computed(() => productionWorkLogStore.totalPages);

const filters = ref({
  startDate: '',
  endDate: '',
  workerName: '',
  recipeCode: '',
  minProducedQuantity: '',
  maxProducedQuantity: '',
  productionId: '',
});

const sortColumn = ref('id');
const sortDirection = ref('desc');
const showFilters = ref(false);
const showDocumentation = ref(false);
const documentationContent = ref('');

onMounted(async () => {
  initializeFiltersFromURL();
  await productionWorkLogStore.getProductionWorkLogs();

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/ProductionWorkLogsView.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((ProductionWorkLogsView_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

watch(() => route.query, () => {
  initializeFiltersFromURL();
  productionWorkLogStore.getProductionWorkLogs();
}, { deep: true });

const initializeFiltersFromURL = () => {
  const query = route.query;
  filters.value = {
    startDate: query.startDate || '',
    endDate: query.endDate || '',
    workerName: query.workerName || '',
    recipeCode: query.recipeCode || '',
    minProducedQuantity: query.minProducedQuantity || '',
    maxProducedQuantity: query.maxProducedQuantity || '',
    productionId: query.productionId || '',
  };
  productionWorkLogStore.setFilters(filters.value);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('et-EE');
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const applyFilters = () => {
  productionWorkLogStore.setFilters(filters.value);
  updateURLParams();
  productionWorkLogStore.getProductionWorkLogs();
};

const resetFilters = () => {
  filters.value = {
    startDate: '',
    endDate: '',
    workerName: '',
    recipeCode: '',
    minProducedQuantity: '',
    maxProducedQuantity: '',
    productionId: '',
  };
  productionWorkLogStore.resetFilters();
  updateURLParams();
  productionWorkLogStore.getProductionWorkLogs();
};

const updateURLParams = () => {
  router.push({ query: { ...filters.value } });
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const sort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
  productionWorkLogStore.setSorting(sortColumn.value, sortDirection.value);
  productionWorkLogStore.getProductionWorkLogs();
};

const sortIcon = (column) => {
  if (sortColumn.value !== column) return '';
  return sortDirection.value === 'asc' ? '▲' : '▼';
};

const changePage = (delta) => {
  productionWorkLogStore.setPage(productionWorkLogStore.currentPage + delta);
  productionWorkLogStore.getProductionWorkLogs();
};
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