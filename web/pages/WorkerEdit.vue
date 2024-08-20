<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">{{ isEditing ? 'Muuda Töötajat' : 'Lisa Uus Töötaja' }}</h1>

    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <form class="bg-base-200 p-6 rounded-lg shadow-lg max-w-2xl mx-auto" @submit.prevent="saveWorker">
      <div class="space-y-6">
        <div class="form-control">
          <label class="label" for="name">
            <span class="label-text">Nimi</span>
          </label>
          <input id="name" v-model="workerData.name" type="text" class="input input-bordered w-full" required/>
        </div>

        <div class="form-control">
          <label class="label" for="code">
            <span class="label-text">Kood</span>
          </label>
          <input id="code" v-model="workerData.code" type="number" class="input input-bordered w-full" required/>
        </div>

        <div class="form-control">
          <label class="label" for="phone_number">
            <span class="label-text">Telefon</span>
          </label>
          <input id="phone_number" v-model="workerData.phone_number" type="tel" class="input input-bordered w-full" required/>
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
import { useWorkersStore } from '../stores/workers';
import { useRoute, useRouter } from 'vue-router';
import VueMarkdownRender from 'vue-markdown-render';
import * as Sentry from "@sentry/vue";

const route = useRoute();
const router = useRouter();
const workersStore = useWorkersStore();

const isEditing = computed(() => !!route.params.id);
const workerData = ref({ name: '', code: '', phone_number: '' });
const showDocumentation = ref(false);
const documentationContent = ref('');

onMounted(async () => {
  if (isEditing.value) {
    await workersStore.getWorker(route.params.id);
    workerData.value = { 
      name: workersStore.worker.name,
      code: workersStore.worker.code,
      phone_number: workersStore.worker.phone_number
    };
  }

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/WorkerEdit.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((WorkerEdit_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

const saveWorker = async () => {
  try {
    if (isEditing.value) {
      await workersStore.updateWorker(route.params.id, workerData.value);
    } else {
      await workersStore.createWorker(workerData.value);
    }
    await router.push('/workers');
  } catch (error) {
    Sentry.captureException({msg: 'Viga töötaja salvestamisel', error});
  }
};

const cancel = async () => {
  await router.push('/workers');
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