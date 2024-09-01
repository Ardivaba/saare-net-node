<template>
  <div class="container mx-auto p-4">
    <h1 class="text-4xl font-bold mb-6 text-center">Tehase Juhtimispaneel</h1>
    
    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>
    
    <div v-if="currentWorker" class="text-2xl mb-6 text-center">
      Tere tulemast, {{ currentWorker.name }}!
      <button class="btn btn-secondary ml-4" @click="logout">Logi välja</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 class="text-2xl font-bold mb-4">Praegused Tellimused</h2>
        <ul class="space-y-2">
          <li v-for="order in currentOrders" :key="order.id" class="p-4 bg-base-200 rounded-lg">
            <div class="text-xl font-semibold">Tellimus #{{ order.id }}</div>
            <div>Retsept: {{ order.recipe ? order.recipe.code : 'Puudub' }}</div>
            <div>Kogus: {{ order.amount_ordered }}</div>
            <div>Toodetud: {{ order.amount_produced }}</div>
          </li>
        </ul>
      </div>
      
      <div>
        <h2 class="text-2xl font-bold mb-4">Masinad</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div 
            v-for="machine in machines" 
            :key="machine.id" 
            class="p-4 rounded-lg text-center cursor-pointer"
            :class="{
              'bg-success text-success-content': machine.state === 'Producing',
              'bg-error text-error-content': machine.state === 'Waiting',
              'bg-gray-500 text-white': machine.state === 'Off'
            }"
            @click="openMachineModal(machine)"
          >
            Masin #{{ machine.id }}
          </div>
        </div>
      </div>
    </div>

    <MachineModal 
      v-if="selectedMachine" 
      :machine="selectedMachine" 
      @close="selectedMachine = null"
      @load-recipe="openRecipeModal"
    />

    <RecipeModal
      v-if="showRecipeModal"
      :machine-id="selectedMachine?.id"
      @close="showRecipeModal = false"
      @recipe-loaded="handleRecipeLoaded"
    />

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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useOrdersStore } from '../stores/orders';
import { useMachinesStore } from '../stores/machines';
import { useWorkersStore } from '../stores/workers';
import MachineModal from '../components/MachineModal.vue';
import RecipeModal from '../components/RecipeModal.vue';
import VueMarkdownRender from 'vue-markdown-render';

const router = useRouter();
const ordersStore = useOrdersStore();
const machinesStore = useMachinesStore();
const workersStore = useWorkersStore();

const selectedMachine = ref(null);
const showRecipeModal = ref(false);
const showDocumentation = ref(false);
const documentationContent = ref('');

const currentWorker = computed(() => workersStore.currentWorker);
const currentOrders = computed(() => ordersStore.orders.filter(order => !order.is_finished));
const machines = computed(() => machinesStore.machines);

onMounted(async () => {
  workersStore.initializeCurrentWorker();

  if (!workersStore.currentWorker) {
    router.push('/worker-login');
    return;
  }

  await Promise.all([
    ordersStore.getOrders(),
    machinesStore.getMachines(),
  ]);

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/WorkerDashboard.generated.md');
    documentationContent.value = await response.text();
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

const openMachineModal = (machine) => {
  selectedMachine.value = machine;
};

const openRecipeModal = () => {
  showRecipeModal.value = true;
};

const handleRecipeLoaded = async () => {
  showRecipeModal.value = false;
  selectedMachine.value = null;
  await machinesStore.getMachines();
};

const logout = async () => {
  await workersStore.logoutWorker();
  router.push('/worker-login');
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