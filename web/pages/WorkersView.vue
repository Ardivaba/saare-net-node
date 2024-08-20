<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">Töötajad</h1>
    
    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <div class="mb-4">
      <RouterLink to="/workers/create" class="btn btn-primary">
        <svg
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-6 h-6 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Lisa Töötaja
      </RouterLink>
    </div>
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
        <tr>
          <th @click="sort('id')">ID {{ sortIcon('id') }}</th>
          <th @click="sort('name')">Nimi {{ sortIcon('name') }}</th>
          <th @click="sort('status')">Staatus {{ sortIcon('status') }}</th>
          <th @click="sort('code')">Kood {{ sortIcon('code') }}</th>
          <th @click="sort('phone_number')">Telefon {{ sortIcon('phone_number') }}</th>
          <th @click="sort('created_at')">Loodud {{ sortIcon('created_at') }}</th>
          <th @click="sort('updated_at')">Muudetud {{ sortIcon('updated_at') }}</th>
          <th>Tegevused</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="worker in workers" :key="worker.id">
          <td>{{ worker.id }}</td>
          <td>{{ worker.name }}</td>
          <td>
            <span :class="getStatusBadgeClass(worker.status)">
              {{ formatStatus(worker.status) }}
            </span>
          </td>
          <td>{{ worker.code }}</td>
          <td>{{ worker.phone_number }}</td>
          <td>{{ formatDate(worker.created_at) }}</td>
          <td>{{ formatDate(worker.updated_at) }}</td>
          <td>
            <div class="flex space-x-2">
              <RouterLink :to="`/workers/${worker.id}`" class="btn btn-sm btn-info">Vaata</RouterLink>
              <RouterLink :to="`/workers/edit/${worker.id}`" class="btn btn-sm btn-warning">Muuda</RouterLink>
              <button class="btn btn-sm btn-error" @click="deleteWorker(worker.id)">Kustuta</button>
            </div>
          </td>
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
import { computed, onMounted, ref, watch } from "vue";
import { useWorkersStore } from "../stores/workers.js";
import VueMarkdownRender from 'vue-markdown-render';

const workersStore = useWorkersStore();
const workers = computed(() => workersStore.workers);
const currentPage = computed(() => workersStore.currentPage);
const totalPages = computed(() => workersStore.totalPages);

const sortColumn = ref('id');
const sortDirection = ref('asc');
const showDocumentation = ref(false);
const documentationContent = ref('');

onMounted(async () => {
  workersStore.getWorkers();

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/WorkersView.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((WorkersView_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'M/S';
  const date = new Date(dateString);
  return date.toLocaleString('et-EE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatStatus = (status) => {
  return status === 'InFactory' ? 'Tehases' : 'Pole tehases';
};

const getStatusBadgeClass = (status) => {
  return status === 'InFactory' ? 'badge badge-success' : 'badge badge-warning';
};

const deleteWorker = async (id) => {
  if (confirm("Kas olete kindel, et soovite selle töötaja kustutada?")) {
    await workersStore.deleteWorker(id);
    await workersStore.getWorkers();
  }
};

const sort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
  workersStore.setSorting(sortColumn.value, sortDirection.value);
  workersStore.getWorkers();
};

const sortIcon = (column) => {
  if (sortColumn.value !== column) return '';
  return sortDirection.value === 'asc' ? '▲' : '▼';
};

watch([sortColumn, sortDirection], () => {
  workersStore.setPage(1);
  workersStore.getWorkers();
});

const changePage = (delta) => {
  workersStore.setPage(currentPage.value + delta);
  workersStore.getWorkers();
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