<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">Masinad</h1>
    
    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <div class="mb-4">
      <RouterLink to="/machines/create" class="btn btn-primary">
        <svg
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-6 h-6 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Lisa Masin
      </RouterLink>
    </div>
    <div v-if="loading" class="text-center my-4">
      <div class="loading loading-spinner loading-lg"></div>
    </div>
    <div v-else-if="machines.length === 0" class="alert alert-info shadow-lg mb-4">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Ühtegi masinat ei leitud.</span>
      </div>
    </div>
    <div v-else class="overflow-x-auto">
      <table class="table w-full">
        <thead>
        <tr>
          <th @click="sort('id')">ID {{ sortIcon('id') }}</th>
          <th @click="sort('ip')">IP {{ sortIcon('ip') }}</th>
          <th @click="sort('name')">Nimi {{ sortIcon('name') }}</th>
          <th @click="sort('state')">Olek {{ sortIcon('state') }}</th>
          <th @click="sort('code')">Retsepti kood {{ sortIcon('code') }}</th>
          <th @click="sort('produced_rope_length')">Toodetud nööri pikkus {{ sortIcon('produced_rope_length') }}</th>
          <th>Tegevused</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="machine in machines" :key="machine.id">
          <td>{{ machine.id }}</td>
          <td>{{ machine.ip }}</td>
          <td>{{ machine.name }}</td>
          <td>
            <span :class="getStateClass(machine.state)">
              <!--{{ formatState(machine.state) }} ({{ formatTime(machine) }})-->
              {{ formatState(machine.state) }}
            </span>
          </td>
          <td>{{ machine.code || 'Puudub' }}</td>
          <td>{{ machine.produced_rope_length !== null ? machine.produced_rope_length.toFixed(2) : 'Puudub' }} m</td>
          <td>
            <div class="flex space-x-2">
              <RouterLink :to="`/machines/${machine.id}`" class="btn btn-sm btn-info">Vaata</RouterLink>
              <RouterLink :to="`/machines/edit/${machine.id}`" class="btn btn-sm btn-warning">Muuda</RouterLink>
              <button class="btn btn-sm btn-error" @click="deleteMachine(machine.id)">Kustuta</button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-if="machines.length > 0" class="mt-4 flex justify-between items-center">
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
import { useMachinesStore } from "../stores/machines.js";
import VueMarkdownRender from 'vue-markdown-render';

const machinesStore = useMachinesStore();
const machines = computed(() => machinesStore.machines || []);
const currentPage = computed(() => machinesStore.currentPage);
const totalPages = computed(() => machinesStore.totalPages);

const sortColumn = ref('id');
const sortDirection = ref('asc');
const loading = ref(true);
const showDocumentation = ref(false);
const documentationContent = ref('');

onMounted(async () => {
  loading.value = true;
  try {
    await machinesStore.getMachines();
  } catch (error) {
    console.error('Error fetching machines:', error);
  } finally {
    loading.value = false;
  }

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/MachinesView.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((MachinesView_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

const formatState = (state) => {
  const states = {
    'Producing': 'Tootmine',
    'Waiting': 'Ootel',
    'Off': 'Välja lülitatud'
  };
  return states[state] || state;
};

const getStateClass = (state) => {
  const classes = {
    'Producing': 'badge badge-success',
    'Waiting': 'badge badge-warning',
    'Off': 'badge badge-error'
  };
  return classes[state] || 'badge';
};

/*
const formatTime = (machine) => {
  let time;
  switch (machine.state) {
    case 'Producing':
      time = machine.producing_time;
      break;
    case 'Waiting':
      time = machine.idle_time;
      break;
    case 'Off':
      time = machine.off_time;
      break;
    default:
      return 'M/S';
  }
  return formatDuration(time);
};
*/

/*
const formatDuration = (durationInNanoseconds) => {
  const seconds = durationInNanoseconds / 1e9;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
*/

const deleteMachine = async (id) => {
  if (confirm("Kas olete kindel, et soovite selle masina kustutada?")) {
    await machinesStore.deleteMachine(id);
    await machinesStore.getMachines();
  }
};

const sort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
  machinesStore.setSorting(sortColumn.value, sortDirection.value);
  machinesStore.getMachines();
};

const sortIcon = (column) => {
  if (sortColumn.value !== column) return '';
  return sortDirection.value === 'asc' ? '▲' : '▼';
};

watch([sortColumn, sortDirection], () => {
  machinesStore.setPage(1);
  machinesStore.getMachines();
});

const changePage = (delta) => {
  machinesStore.setPage(currentPage.value + delta);
  machinesStore.getMachines();
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