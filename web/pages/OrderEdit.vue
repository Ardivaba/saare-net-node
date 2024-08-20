<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">{{ isEditing ? 'Muuda Tellimust' : 'Lisa Uus Tellimus' }}</h1>
    
    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <form class="bg-base-200 p-6 rounded-lg shadow-lg max-w-2xl mx-auto" @submit.prevent="saveOrder">
      <div class="space-y-6">
        <div class="form-control">
          <label class="label" for="recipe_id">
            <span class="label-text">Retsept</span>
          </label>
          <select id="recipe_id" v-model="orderData.recipe_id" class="select select-bordered w-full" required>
            <option disabled value="">Vali retsept</option>
            <option v-for="recipe in recipes" :key="recipe.id" :value="recipe.id">
              {{ recipe.description }}
            </option>
          </select>
        </div>

        <div class="form-control">
          <label class="label" for="amount_ordered">
            <span class="label-text">Tellitud kogus</span>
          </label>
          <input id="amount_ordered" v-model.number="orderData.amount_ordered" type="number" step="0.01" class="input input-bordered w-full" required/>
        </div>

        <div class="form-control">
          <label class="label" for="info">
            <span class="label-text">Lisainfo</span>
          </label>
          <textarea id="info" v-model="orderData.info" class="textarea textarea-bordered w-full" rows="3"></textarea>
        </div>

        <div v-if="isEditing" class="form-control">
          <label class="label" for="amount_produced">
            <span class="label-text">Toodetud kogus</span>
          </label>
          <input id="amount_produced" v-model.number="orderData.amount_produced" type="number" step="0.01" class="input input-bordered w-full" required/>
        </div>

        <div v-if="isEditing" class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Lõpetatud</span>
            <input v-model="orderData.is_finished" type="checkbox" class="toggle toggle-primary"/>
          </label>
        </div>
      </div>

      <div class="mt-8 flex justify-end space-x-2">
        <button type="button" class="btn btn-ghost" @click="cancel">Tühista</button>
        <button type="submit" class="btn btn-primary">Salvesta</button>
      </div>
    </form>

    <!-- Documentation modal with increased padding -->
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
import { useOrdersStore } from '../stores/orders';
import { useRecipesStore } from '../stores/recipes';
import { useRoute, useRouter } from 'vue-router';
import VueMarkdownRender from 'vue-markdown-render';
import * as Sentry from "@sentry/vue";

const route = useRoute();
const router = useRouter();
const ordersStore = useOrdersStore();
const recipesStore = useRecipesStore();

const isEditing = computed(() => !!route.params.id);
const orderData = ref({
  recipe_id: '',
  amount_ordered: null,
  info: '',
  amount_produced: 0,
  is_finished: false
});

const recipes = computed(() => recipesStore.recipes);
const showDocumentation = ref(false);
const documentationContent = ref('');

onMounted(async () => {
  try {
    await recipesStore.getRecipes();
    
    if (isEditing.value) {
      await ordersStore.getOrder(route.params.id);
      orderData.value = { ...ordersStore.order };
    }

    // Load documentation content
    const response = await fetch('/documentation/pages/OrderEdit.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((OrderEdit_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error during component initialization:', error);
    Sentry.captureException(error);
  }
});

const saveOrder = async () => {
  try {
    if (isEditing.value) {
      await ordersStore.updateOrder(route.params.id, orderData.value);
    } else {
      await ordersStore.createOrder(orderData.value);
    }
    await router.push('/orders');
  } catch (error) {
    console.error('Error saving order:', error);
    Sentry.captureException({msg: 'Viga tellimuse salvestamisel', error});
  }
};

const cancel = () => {
  router.push('/orders');
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