<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">Tehase ülevaade</h1>

    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-2">Tehase olek</h2>
          <div class="stats stats-vertical shadow">
            <div class="stat">
              <div class="stat-title">Töötavad masinad</div>
              <div class="stat-value text-success">{{ producingMachines }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">Ootel masinad</div>
              <div class="stat-value text-warning">{{ waitingMachines }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">Peatatud masinad</div>
              <div class="stat-value text-error">{{ stoppedMachines }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">Aktiivne töötaja</div>
              <div class="stat-value text-info">{{ activeWorker ? activeWorker.name : 'Puudub' }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-2">Tootmise ülevaade</h2>
          <div class="stats stats-vertical shadow">
            <div class="stat">
              <div class="stat-title mb-2">Tellimused</div>
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="stat-value text-primary">{{ totalOrders }}</div>
                  <div class="stat-desc">Kokku</div>
                </div>
                <div class="text-center">
                  <div class="stat-value text-secondary">{{ activeOrders }}</div>
                  <div class="stat-desc">Töös</div>
                </div>
                <div class="text-center">
                  <div class="stat-value text-accent">{{ completedOrdersToday }}</div>
                  <div class="stat-desc">Täna lõpetatud</div>
                </div>
              </div>
            </div>
            <div class="stat">
              <div class="stat-title">Tänane toodang</div>
              <div class="stat-value">{{ todayProduction.toFixed(2) }} m</div>
            </div>
            <div class="stat">
              <div class="stat-title">Nädala toodang</div>
              <div class="stat-value">{{ weekProduction.toFixed(2) }} m</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-2">Viimased sündmused</h2>
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr>
                  <th>Aeg</th>
                  <th>Tüüp</th>
                  <th>Kirjeldus</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in lastEvents" :key="event.id" class="hover:bg-base-200 cursor-pointer" @click="navigateToEvent(event)">
                  <td>{{ formatDate(event.created_at) }}</td>
                  <td>{{ formatEventType(event.type) }}</td>
                  <td>{{ formatEventDescription(event) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title text-xl mb-2">Masinad</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div 
            v-for="machine in machines" 
            :key="machine.id" 
            :class="getMachineCardClass(machine.state)" 
            class="card shadow-sm cursor-pointer"
            @click="navigateToMachine(machine.id)"
          >
            <div class="card-body p-4">
              <h3 class="card-title text-lg mb-1">{{ machine.code || `Masin #${machine.id}` }}</h3>
              <div class="mb-2">
                <p class="text-sm font-bold">
                  {{ formatMachineState(machine.state) }}
                </p>
                <p class="text-sm">
                  {{ formatMachineStateTime(machine) }}
                </p>
              </div>
              <p class="text-sm">
                Toodetud: {{ machine.produced_rope_length.toFixed(2) }} m
              </p>
            </div>
          </div>
        </div>
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
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useOrdersStore } from '../stores/orders';
import { useEventsStore } from '../stores/events';
import { useMachinesStore } from '../stores/machines';
import { useProductionsStore } from '../stores/productions';
import { useWorkersStore } from '../stores/workers';
import VueMarkdownRender from 'vue-markdown-render';

const router = useRouter();
const ordersStore = useOrdersStore();
const eventsStore = useEventsStore();
const machinesStore = useMachinesStore();
const productionsStore = useProductionsStore();
const workersStore = useWorkersStore();

const lastEvents = ref([]);
const machines = ref([]);
const todayProduction = ref(0);
const weekProduction = ref(0);
const activeWorker = ref(null);
const showDocumentation = ref(false);
const documentationContent = ref('');

const producingMachines = computed(() => machines.value.filter(m => m.state === 'Producing').length);
const waitingMachines = computed(() => machines.value.filter(m => m.state === 'Waiting').length);
const stoppedMachines = computed(() => machines.value.filter(m => m.state === 'Off').length);

const totalOrders = computed(() => ordersStore.orders.length);
const activeOrders = computed(() => ordersStore.orders.filter(order => !order.is_finished).length);
const completedOrdersToday = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return ordersStore.orders.filter(order => order.is_finished && order.updated_at.startsWith(today)).length;
});

let pollInterval;

onMounted(async () => {
  await fetchData();
  pollInterval = setInterval(fetchData, 1000 * 10); // Poll every 10 seconds

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/HomeView.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((HomeView_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

onUnmounted(() => {
  clearInterval(pollInterval);
});

async function fetchData() {
  await Promise.all([
    ordersStore.getOrders(),
    fetchLastEvents(),
    machinesStore.getMachines(),
    fetchProductionData(),
    fetchActiveWorker()
  ]);
  machines.value = machinesStore.machines;
}

async function fetchLastEvents() {
  await eventsStore.getEvents({ limit: 5 });
  lastEvents.value = eventsStore.events.slice(0, 5);
}

async function fetchProductionData() {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  await productionsStore.getProductions({ startDate: weekAgo, endDate: today });
  
  todayProduction.value = productionsStore.productions
    .filter(p => p.start_date.startsWith(today))
    .reduce((sum, p) => sum + p.produced_quantity, 0);
  
  weekProduction.value = productionsStore.productions
    .reduce((sum, p) => sum + p.produced_quantity, 0);
}

async function fetchActiveWorker() {
  await workersStore.getWorkers();
  const loggedInWorkers = workersStore.workers.filter(w => w.is_logged_in);
  if (loggedInWorkers.length > 0) {
    activeWorker.value = loggedInWorkers.reduce((latest, worker) => 
      new Date(worker.last_login_at) > new Date(latest.last_login_at) ? worker : latest
    );
  } else {
    activeWorker.value = null;
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('et-EE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatEventType(type) {
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
}

function formatEventDescription(event) {
  switch (event.type) {
    case 'order_created':
    case 'order_updated':
    case 'order_completed':
      return `Tellimus #${event.data.order_id}`;
    case 'production_started':
    case 'production_completed':
      return `Tootmine #${event.data.production_id}`;
    case 'machine_status_changed':
      return `Masin #${event.data.machine_id}: ${formatMachineState(event.data.new_status)}`;
    case 'worker_logged_in':
    case 'worker_logged_out':
      return `${event.data.worker_name}`;
    default:
      return JSON.stringify(event.data);
  }
}

function formatMachineState(state) {
  const states = {
    'Producing': 'Tootmine',
    'Waiting': 'Ootel',
    'Off': 'Välja lülitatud'
  };
  return states[state] || state;
}

function getMachineCardClass(state) {
  const classes = {
    'Producing': 'bg-success text-success-content',
    'Waiting': 'bg-warning text-warning-content',
    'Off': 'bg-error text-error-content'
  };
  return classes[state] || 'bg-base-200';
}

function navigateToEvent(event) {
  switch (event.type) {
    case 'order_created':
    case 'order_updated':
    case 'order_completed':
      router.push(`/orders/${event.data.order_id}`);
      break;
    case 'production_started':
    case 'production_completed':
      router.push('/productions');
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
}

function navigateToMachine(machineId) {
  router.push(`/machines/${machineId}`);
}

function formatMachineStateTime(machine) {
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
}

function formatDuration(durationInNanoseconds) {
  const seconds = durationInNanoseconds / 1e9;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
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