<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">Tellimused</h1>
    
    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <div class="mb-4 flex justify-between items-center">
      <RouterLink to="/orders/create" class="btn btn-primary">
        <svg
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-6 h-6 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Lisa Tellimus
      </RouterLink>
      <button class="btn btn-secondary" @click="toggleFilters">
        {{ showFilters ? 'Peida filtrid' : 'Filtreeri' }}
      </button>
    </div>

    <!-- Filters -->
    <div v-if="showFilters" class="mb-4 bg-base-200 p-4 rounded-lg relative">
      <button class="btn btn-sm btn-circle absolute right-2 top-2" @click="closeFilters">✕</button>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">ID</span>
          </label>
          <input v-model="filters.id" type="number" class="input input-bordered" placeholder="Filtreeri ID järgi"/>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Retsepti kood</span>
          </label>
          <input v-model="filters.recipeCode" type="text" class="input input-bordered" placeholder="Filtreeri retsepti koodi järgi"/>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Retsepti kirjeldus</span>
          </label>
          <input v-model="filters.recipeDescription" type="text" class="input input-bordered" placeholder="Filtreeri retsepti kirjelduse järgi"/>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Info</span>
          </label>
          <input v-model="filters.info" type="text" class="input input-bordered" placeholder="Filtreeri info järgi"/>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Tellitud kogus</span>
          </label>
          <div class="flex space-x-2">
            <input v-model="filters.amountOrderedMin" type="number" class="input input-bordered w-1/2" placeholder="Min"/>
            <input v-model="filters.amountOrderedMax" type="number" class="input input-bordered w-1/2" placeholder="Max"/>
          </div>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Toodetud kogus</span>
          </label>
          <div class="flex space-x-2">
            <input v-model="filters.amountProducedMin" type="number" class="input input-bordered w-1/2" placeholder="Min"/>
            <input v-model="filters.amountProducedMax" type="number" class="input input-bordered w-1/2" placeholder="Max"/>
          </div>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Lõpetatud</span>
          </label>
          <select v-model="filters.isFinished" class="select select-bordered">
            <option value="">Kõik</option>
            <option value="true">Jah</option>
            <option value="false">Ei</option>
          </select>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Loodud</span>
          </label>
          <div class="flex flex-col space-y-2">
            <input v-model="filters.createdAtStart" type="date" class="input input-bordered" placeholder="Algus"/>
            <input v-model="filters.createdAtEnd" type="date" class="input input-bordered" placeholder="Lõpp"/>
          </div>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Uuendatud</span>
          </label>
          <div class="flex flex-col space-y-2">
            <input v-model="filters.updatedAtStart" type="date" class="input input-bordered" placeholder="Algus"/>
            <input v-model="filters.updatedAtEnd" type="date" class="input input-bordered" placeholder="Lõpp"/>
          </div>
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
          <th @click="sort('recipe.code')">Retsepti kood {{ sortIcon('recipe.code') }}</th>
          <th>Retsepti kirjeldus</th>
          <th>Info</th>
          <th @click="sort('amount_ordered')">Tellitud kogus {{ sortIcon('amount_ordered') }}</th>
          <th @click="sort('amount_produced')">Toodetud kogus {{ sortIcon('amount_produced') }}</th>
          <th @click="sort('is_finished')">Lõpetatud {{ sortIcon('is_finished') }}</th>
          <th @click="sort('created_at')">Loodud {{ sortIcon('created_at') }}</th>
          <th @click="sort('updated_at')">Uuendatud {{ sortIcon('updated_at') }}</th>
          <th>Tegevused</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>{{ order.id }}</td>
          <td>
            <RouterLink 
              v-if="order.recipe" 
              :to="`/recipes/${order.recipe.id}`" 
              :class="{'text-red-500': order.recipe.deleted_at}"
            >
              {{ order.recipe.code }}
            </RouterLink>
            <span v-else>M/S</span>
          </td>
          <td>{{ order.recipe ? order.recipe.description : 'M/S' }}</td>
          <td>{{ order.info }}</td>
          <td>{{ order.amount_ordered }}</td>
          <td>{{ order.amount_produced }}</td>
          <td>
            <span :class="{'badge badge-success': order.is_finished, 'badge badge-warning': !order.is_finished}">
              {{ order.is_finished ? 'Jah' : 'Ei' }}
            </span>
          </td>
          <td>{{ formatDate(order.created_at) }}</td>
          <td>{{ formatDate(order.updated_at) }}</td>
          <td>
            <div class="flex space-x-2">
              <RouterLink :to="`/orders/${order.id}`" class="btn btn-sm btn-info">Vaata</RouterLink>
              <RouterLink :to="`/orders/edit/${order.id}`" class="btn btn-sm btn-warning">Muuda</RouterLink>
              <button class="btn btn-sm btn-error" @click="deleteOrder(order.id)">Kustuta</button>
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
import { useOrdersStore } from "../stores/orders.js";
import VueMarkdownRender from 'vue-markdown-render';

const ordersStore = useOrdersStore();
const orders = computed(() => ordersStore.orders);
const currentPage = computed(() => ordersStore.currentPage);
const totalPages = computed(() => ordersStore.totalPages);

const sortColumn = ref('id');
const sortDirection = ref('asc');
const showDocumentation = ref(false);
const documentationContent = ref('');
const showFilters = ref(false);

const filters = ref({
  id: '',
  recipeCode: '',
  recipeDescription: '',
  info: '',
  amountOrderedMin: '',
  amountOrderedMax: '',
  amountProducedMin: '',
  amountProducedMax: '',
  isFinished: '',
  createdAtStart: '',
  createdAtEnd: '',
  updatedAtStart: '',
  updatedAtEnd: '',
});

onMounted(async () => {
  await ordersStore.getOrders();

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/OrdersView.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((OrdersView_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'M/S';
  return new Date(dateString).toLocaleString('et-EE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const deleteOrder = async (id) => {
  if (confirm("Kas olete kindel, et soovite selle tellimuse kustutada?")) {
    try {
      await ordersStore.deleteOrder(id);
      await ordersStore.getOrders();
    } catch (error) {
      alert("Viga tellimuse kustutamisel: " + error.message);
    }
  }
};

const sort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
  ordersStore.setSorting(sortColumn.value, sortDirection.value);
  ordersStore.getOrders();
};

const sortIcon = (column) => {
  if (sortColumn.value !== column) return '';
  return sortDirection.value === 'asc' ? '▲' : '▼';
};

watch([sortColumn, sortDirection], () => {
  ordersStore.setPage(1);
  ordersStore.getOrders();
});

const changePage = (delta) => {
  ordersStore.setPage(currentPage.value + delta);
  ordersStore.getOrders();
};

const applyFilters = () => {
  ordersStore.setFilters(filters.value);
  ordersStore.setPage(1);
  ordersStore.getOrders();
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const closeFilters = () => {
  showFilters.value = false;
};

const resetFilters = () => {
  Object.keys(filters.value).forEach(key => {
    filters.value[key] = '';
  });
  ordersStore.resetFilters();
  ordersStore.setPage(1);
  ordersStore.getOrders();
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

