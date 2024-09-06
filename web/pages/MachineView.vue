<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">Masina vaade</h1>

    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>

    <div v-if="loading" class="text-center my-4">
      <div class="loading loading-spinner loading-lg"></div>
    </div>
    <div v-else-if="!machine.id" class="alert alert-error shadow-lg mb-4">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Masinat ei leitud.</span>
      </div>
    </div>
    <div v-else class="bg-base-200 p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-semibold mb-4">Masin #{{ machine.id }}</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-medium mb-2">Üldine Info</h3>
          <p><strong>IP:</strong> {{ machine.ip }}</p>
          <p><strong>Nimi:</strong> {{ machine.name }}</p>
          <p><strong>Olek:</strong> <span :class="getStateClass(machine.state)">{{ formatState(machine.state) }}</span></p>
          <p><strong>Toodetud nööri pikkus:</strong> {{ machine.produced_rope_length.toFixed(2) }} m</p>
        </div>

        <div>
          <h3 class="text-lg font-medium mb-2">Retsepti Info</h3>
          <p><strong>Retsepti kood:</strong> {{ machine.recipe_code || 'M/S' }}</p>
          <p><strong>Ujuki pikkus:</strong> {{ machine.float_length?.toFixed(2) || 'M/S' }} mm</p>
          <p><strong>Ujuki vahe:</strong> {{ machine.float_gap?.toFixed(2) || 'M/S' }} mm</p>
          <p><strong>Nööri pikkus:</strong> {{ machine.rope_length?.toFixed(2) || 'M/S' }} m</p>
        </div>
      </div>

      <div class="mt-6">
        <h3 class="text-lg font-medium mb-2">Töötaja Info</h3>
        <p><strong>Töötaja ID:</strong> {{ machine.worker?.id || 'M/S' }}</p>
        <p><strong>Töötaja nimi:</strong> {{ machine.worker?.name || 'M/S' }}</p>
      </div>

      <!----
      <div class="mt-6">
        <h3 class="text-lg font-medium mb-2">Ajad</h3>
        <p><strong>Tootmise aeg:</strong> {{ formatDuration(machine.producing_time) }}</p>
        <p><strong>Ooteaeg:</strong> {{ formatDuration(machine.idle_time) }}</p>
        <p><strong>Väljalülitatud aeg:</strong> {{ formatDuration(machine.off_time) }}</p>
      </div>
      -->

      <div class="mt-6 flex space-x-2">
        <RouterLink :to="`/machines/edit/${machine.id}`" class="btn btn-warning">Muuda</RouterLink>
        <button class="btn btn-error" @click="deleteMachine">Kustuta</button>
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
import { computed, onMounted, ref } from 'vue';
import { useMachinesStore } from '../stores/machines';
import { useRoute, useRouter } from 'vue-router';
import VueMarkdownRender from 'vue-markdown-render';

const machinesStore = useMachinesStore();
const route = useRoute();
const router = useRouter();
const loading = ref(true);

const machine = computed(() => machinesStore.machine);
const showDocumentation = ref(false);
const documentationContent = ref('');

onMounted(async () => {
  if (route.params.id) {
    loading.value = true;
    await machinesStore.getMachine(route.params.id);
    loading.value = false;
  }

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/MachineView.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((MachineView_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
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
const formatDuration = (durationInNanoseconds) => {
  const seconds = durationInNanoseconds / 1e9;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
*/

const deleteMachine = async () => {
  if (confirm('Kas olete kindel, et soovite selle masina kustutada?')) {
    await machinesStore.deleteMachine(machine.value.id);
    router.push('/machines');
  }
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