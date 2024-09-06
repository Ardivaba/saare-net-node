<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">Sündmused</h1>

    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <div class="mb-4 flex flex-wrap gap-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Alguskuupäev</span>
        </label>
        <input v-model="filters.startDate" type="date" class="input input-bordered"/>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Lõppkuupäev</span>
        </label>
        <input v-model="filters.endDate" type="date" class="input input-bordered"/>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Sündmuse tüüp</span>
        </label>
        <select v-model="filters.type" class="select select-bordered">
          <option value="">Kõik</option>
          <option v-for="type in eventTypes" :key="type" :value="type">
            {{ formatEventType(type) }}
          </option>
        </select>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">&nbsp;</span>
        </label>
        <button class="btn btn-primary" @click="applyFilters">Otsi</button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th @click="sort('id')">ID {{ sortIcon('id') }}</th>
            <th @click="sort('created_at')">Aeg {{ sortIcon('created_at') }}</th>
            <th @click="sort('type')">Sündmuse tüüp {{ sortIcon('type') }}</th>
            <th>Kirjeldus</th>
            <th>Tegevused</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in events" :key="event.id">
            <td>{{ event.id }}</td>
            <td>{{ formatDate(event.created_at) }}</td>
            <td>{{ formatEventType(event.type) }}</td>
            <td>{{ formatEventDescription(event) }}</td>
            <td>
              <button class="btn btn-sm btn-info" @click="viewEventDetails(event)">Vaata</button>
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
import { ref, computed, onMounted } from 'vue';
import { useEventsStore } from '../stores/events';
import { useRouter } from 'vue-router';
import VueMarkdownRender from 'vue-markdown-render';

const eventsStore = useEventsStore();
const router = useRouter();

const events = computed(() => eventsStore.events);
const currentPage = computed(() => eventsStore.currentPage);
const totalPages = computed(() => eventsStore.totalPages);

const filters = ref({
  startDate: '',
  endDate: '',
  type: '',
});

const sortColumn = ref('id');
const sortDirection = ref('asc');

const eventTypes = [
  'order_created',
  'order_updated',
  'order_completed',
  'production_started',
  'production_completed',
  'machine_status_changed',
  'worker_logged_in',
  'worker_logged_out',
];

const showDocumentation = ref(false);
const documentationContent = ref('');

onMounted(async () => {
  await eventsStore.getEvents();

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/EventsView.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((EventsView_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('et-EE');
};

const formatEventType = (type) => {
  const types = {
    order_created: 'Tellimus loodud',
    order_updated: 'Tellimus uuendatud',
    order_completed: 'Tellimus lõpetatud',
    production_started: 'Tootmine alustatud',
    production_completed: 'Tootmine lõpetatud',
    machine_status_changed: 'Masina olek muutunud',
    worker_logged_in: 'Töötaja sisenes',
    worker_logged_out: 'Töötaja väljus',
  };
  return types[type] || type;
};

const formatMachineStatus = (status) => {
  if (status === 'Producing') return 'Toodab';
  if (status === 'Waiting') return 'Ootel';
  return 'Väljas';
};

const formatEventDescription = (event) => {
  switch (event.type) {
    case 'order_created':
    case 'order_updated':
    case 'order_completed':
      return `Tellimus #${event.data.order_id}`;
    case 'production_started':
    case 'production_completed':
      return `Tootmine #${event.data.production_id}`;
    case 'machine_status_changed':
      return `Masin ${event.data.machine_id}: ${formatMachineStatus(event.data.new_status)}`;
    case 'worker_logged_in':
    case 'worker_logged_out':
      return `Töötaja: ${event.data.worker_name}`;
    default:
      return JSON.stringify(event.data);
  }
};

const applyFilters = () => {
  eventsStore.setFilters(filters.value);
  eventsStore.getEvents();
};

const changePage = (delta) => {
  eventsStore.setPage(eventsStore.currentPage + delta);
  eventsStore.getEvents();
};

const sort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
  eventsStore.setSorting(sortColumn.value, sortDirection.value);
  eventsStore.getEvents();
};

const sortIcon = (column) => {
  if (sortColumn.value !== column) return '';
  return sortDirection.value === 'asc' ? '▲' : '▼';
};

const viewEventDetails = (event) => {
  switch (event.type) {
    case 'order_created':
    case 'order_updated':
    case 'order_completed':
      router.push(`/orders/${event.data.order_id}`);
      break;
    case 'production_started':
    case 'production_completed':
      router.push(`/productions/${event.data.production_id}`);
      break;
    case 'machine_status_changed':
      router.push(`/machines/${event.data.machine_id}`);
      break;
    case 'worker_logged_in':
    case 'worker_logged_out':
      router.push(`/workers/${event.data.worker_id}`);
      break;
    default:
      console.log('No specific view for this event type');
  }
};
</script>