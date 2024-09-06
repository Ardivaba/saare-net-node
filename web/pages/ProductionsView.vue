<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">Toodang</h1>
    
    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <div class="mb-4 flex justify-between items-center">
      <div>
        <button class="btn btn-secondary mr-2" @click="exportCSV('filtered')">
          Ekspordi filtreeritud CSV
        </button>
        <button class="btn btn-secondary" @click="exportCSV('all')">
          Ekspordi kõik CSV
        </button>
      </div>
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
            <span class="label-text">Retsepti kood</span>
          </label>
          <input v-model="filters.recipeCode" type="text" class="input input-bordered" placeholder="Filtreeri retsepti koodi järgi" />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Kogus</span>
          </label>
          <div class="flex space-x-2">
            <input v-model="filters.minQuantity" type="number" class="input input-bordered w-1/2" placeholder="Min" />
            <input v-model="filters.maxQuantity" type="number" class="input input-bordered w-1/2" placeholder="Max" />
          </div>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Masina nimi</span>
          </label>
          <input v-model="filters.machineName" type="text" class="input input-bordered" placeholder="Filtreeri masina nime järgi" />
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
          <th>Joosepi kood</th>
          <th @click="sort('start_date')">Alguskuupäev {{ sortIcon('start_date') }}</th>
          <th @click="sort('end_date')">Lõppkuupäev {{ sortIcon('end_date') }}</th>
          <th @click="sort('produced_quantity')">Kogus {{ sortIcon('produced_quantity') }}</th>
          <th>Tootmisaeg</th>
          <th @click="sort('machine_name')">Masina nimi {{ sortIcon('machine_name') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="production in productions" :key="production.id">
          <td>{{ production.id }}</td>
          <td>{{ production.recipe_code }}</td>
          <td>{{ formatDate(production.start_date) }}</td>
          <td>{{ production.end_date !== null ? formatDate(production.end_date) : 'Tootmisel' }}</td>
          <td>{{ production.produced_quantity ? production.produced_quantity.toFixed(2) : '0' }}</td>
          <td>{{ calculateProductionTime(production) }}</td>
          <td>{{ production.machine ? production.machine.name : 'M/S' }}</td>
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
import { ref, computed, onMounted } from 'vue';
import { useProductionsStore } from '../stores/productions';
import VueMarkdownRender from 'vue-markdown-render';

const productionsStore = useProductionsStore();

const productions = computed(() => productionsStore.productions);
const currentPage = computed(() => productionsStore.currentPage);
const totalPages = computed(() => productionsStore.totalPages);

const filters = ref({
  startDate: '',
  endDate: '',
  recipeCode: '',
  minQuantity: '',
  maxQuantity: '',
  machineName: '',
});

const sortColumn = ref('id');
const sortDirection = ref('desc');
const showFilters = ref(false);
const showDocumentation = ref(false);
const documentationContent = ref('');

onMounted(async () => {
  await productionsStore.getProductions();

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/ProductionsView.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((ProductionsView_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('et-EE');
};

const calculateProductionTime = (production) => {
  const startDate = new Date(production.start_date);
  const endDate = production.end_date !== null ? new Date(production.end_date) : new Date();
  const diffInMilliseconds = endDate - startDate;
  const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const applyFilters = () => {
  productionsStore.setFilters(filters.value);
  productionsStore.getProductions();
};

const resetFilters = () => {
  filters.value = {
    startDate: '',
    endDate: '',
    recipeCode: '',
    minQuantity: '',
    maxQuantity: '',
    machineName: '',
  };
  productionsStore.resetFilters();
  productionsStore.getProductions();
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
  productionsStore.setSorting(sortColumn.value, sortDirection.value);
  productionsStore.getProductions();
};

const sortIcon = (column) => {
  if (sortColumn.value !== column) return '';
  return sortDirection.value === 'asc' ? '▲' : '▼';
};

const changePage = (delta) => {
  productionsStore.setPage(productionsStore.currentPage + delta);
  productionsStore.getProductions();
};

const exportCSV = (type) => {
  productionsStore.exportCSV(type);
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