<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">Tellimuse vaade</h1>

    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <div class="bg-base-200 p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-semibold mb-4">Tellimus #{{ order.id }}</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-medium mb-2">Üldine Info</h3>
          <p><strong>Retsepti kood:</strong> {{ order.recipe_code }}</p>
          <p><strong>Retsept:</strong> {{ order.recipe?.description || 'M/S' }}</p>
          <p><strong>Tellitud kogus:</strong> {{ order.amount_ordered }}</p>
          <p><strong>Toodetud kogus:</strong> {{ order.amount_produced }}</p>
          <p><strong>Järelejäänud kogus:</strong> {{ order.amount_ordered - order.amount_produced }}</p>
          <p><strong>Lõpetatud:</strong> {{ order.is_finished ? 'Jah' : 'Ei' }}</p>
          <p><strong>Praegune tööline:</strong> {{ order.current_worker?.name || 'Pole määratud' }}</p>
        </div>

        <div>
          <h3 class="text-lg font-medium mb-2">Lisainfo</h3>
          <p>{{ order.info || 'Lisainfo puudub' }}</p>
        </div>
      </div>

      <div class="mt-6">
        <h3 class="text-lg font-medium mb-2">Ajatemplid</h3>
        <p><strong>Loodud:</strong> {{ formatDate(order.created_at) }}</p>
        <p><strong>Viimati Muudetud:</strong> {{ order.updated_at ? formatDate(order.updated_at) : 'M/S' }}</p>
      </div>

      <div class="mt-6">
        <h3 class="text-xl font-semibold mb-4">Tööliste logid</h3>
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Tööline</th>
                <th>Kogus</th>
                <th>Viimane valmistamisaeg</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in workerLogs" :key="log.id">
                <td>{{ log.worker.name }}</td>
                <td>{{ log.amount }}</td>
                <td>{{ formatDate(log.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-6 flex space-x-2">
        <RouterLink :to="`/orders/edit/${order.id}`" class="btn btn-warning">Muuda</RouterLink>
        <button class="btn btn-error" @click="deleteOrder">Kustuta</button>
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
import { useOrdersStore } from '../stores/orders';
import { useRoute, useRouter } from 'vue-router';
import VueMarkdownRender from 'vue-markdown-render';

const ordersStore = useOrdersStore();
const route = useRoute();
const router = useRouter();

const order = computed(() => ordersStore.order);
const workerLogs = computed(() => ordersStore.workerLogs);
const showDocumentation = ref(false);
const documentationContent = ref('');

onMounted(async () => {
  if (route.params.id) {
    await ordersStore.getOrder(route.params.id);
  }

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/OrderView.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((OrderView_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('et-EE');
};

const deleteOrder = async () => {
  if (confirm('Kas olete kindel, et soovite selle tellimuse kustutada?')) {
    await ordersStore.deleteOrder(order.value.id);
    router.push('/orders');
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