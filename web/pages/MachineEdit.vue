<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">{{ isEditing ? 'Muuda Masinat' : 'Lisa Uus Masin' }}</h1>

    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <form class="bg-base-200 p-6 rounded-lg shadow-lg max-w-2xl mx-auto" @submit.prevent="saveMachine">
      <div class="space-y-6">
        <div class="form-control">
          <label class="label" for="ip">
            <span class="label-text">IP Aadress</span>
          </label>
          <input id="ip" v-model="machineData.ip" type="text" class="input input-bordered w-full" required/>
        </div>

        <div class="form-control">
          <label class="label" for="name">
            <span class="label-text">Masina Nimi</span>
          </label>
          <input id="name" v-model="machineData.name" type="text" class="input input-bordered w-full" required/>
        </div>

        <div v-if="isEditing" class="form-control">
          <label class="label" for="state">
            <span class="label-text">Olek</span>
          </label>
          <input id="state" :value="translateState(machineData.state)" type="text" class="input input-bordered w-full" disabled/>
        </div>

        <div v-if="isEditing" class="form-control">
          <label class="label" for="produced_rope_length">
            <span class="label-text">Toodetud nööri pikkus (m)</span>
          </label>
          <input id="produced_rope_length" v-model="machineData.produced_rope_length" type="number" step="0.01" class="input input-bordered w-full" disabled/>
        </div>
      </div>

      <div class="mt-8 flex justify-end space-x-2">
        <button type="button" class="btn btn-ghost" @click="cancel">Tühista</button>
        <button type="submit" class="btn btn-primary">Salvesta</button>
      </div>
    </form>

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
import * as Sentry from "@sentry/vue";

const route = useRoute();
const router = useRouter();
const machinesStore = useMachinesStore();

const isEditing = computed(() => !!route.params.id);
const machineData = ref({
  ip: '',
  name: '',
  state: '',
  produced_rope_length: 0,
});

const showDocumentation = ref(false);
const documentationContent = ref('');

onMounted(async () => {
  if (isEditing.value) {
    await machinesStore.getMachine(route.params.id);
    machineData.value = { ...machinesStore.machine };
  }

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/MachineEdit.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((MachineEdit_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

const saveMachine = async () => {
  try {
    if (isEditing.value) {
      await machinesStore.updateMachine(route.params.id, machineData.value);
    } else {
      await machinesStore.createMachine(machineData.value);
    }
    await router.push('/machines');
  } catch (error) {
    Sentry.captureException({msg: 'Viga masina salvestamisel', error});
  }
};

const cancel = () => {
  router.push('/machines');
};

const translateState = (state) => {
  const stateTranslations = {
    'Producing': 'Tootmine',
    'Waiting': 'Ootel',
    'Off': 'Välja lülitatud'
  };
  return stateTranslations[state] || state;
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