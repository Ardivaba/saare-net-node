<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">Retsepti vaade</h1>

    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <div v-if="recipe" class="bg-base-200 p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-semibold mb-4" :class="{ 'text-red-500': recipe.deleted_at }">
        Retsept #{{ recipe.id }}
        <span v-if="recipe.deleted_at" class="text-red-500 ml-2">(Kustutatud)</span>
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-medium mb-2">Üldine Info</h3>
          <p><strong>Kood:</strong> {{ recipe.code }}</p>
          <p><strong>Kirjeldus:</strong> {{ recipe.description }}</p>
        </div>

        <div>
          <h3 class="text-lg font-medium mb-2">Tehnilised Andmed</h3>
          <p><strong>Ujuki vahe:</strong> {{ recipe.float_gap }} mm</p>
          <p><strong>Ujuki pikkus:</strong> {{ recipe.float_length }} mm</p>
          <p><strong>Nööri pikkus:</strong> {{ recipe.rope_length }} m</p>
        </div>
      </div>

      <div class="mt-6">
        <h3 class="text-lg font-medium mb-2">Ajatemplid</h3>
        <p><strong>Loodud:</strong> {{ formatDate(recipe.created_at) }}</p>
        <p><strong>Viimati Muudetud:</strong> {{ formatDate(recipe.updated_at) }}</p>
        <p v-if="recipe.deleted_at"><strong>Kustutatud:</strong> {{ formatDate(recipe.deleted_at) }}</p>
      </div>

      <div v-if="!recipe.deleted_at" class="mt-6 flex space-x-2">
        <RouterLink :to="`/recipes/edit/${recipe.id}`" class="btn btn-warning">Muuda</RouterLink>
        <button class="btn btn-error" @click="deleteRecipe">Kustuta</button>
      </div>
    </div>
    <div v-else class="text-center my-4">
      <div class="loading loading-spinner loading-lg"></div>
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
import { useRecipesStore } from '../stores/recipes';
import { useRoute } from 'vue-router';
import VueMarkdownRender from 'vue-markdown-render';

const recipesStore = useRecipesStore();
const route = useRoute();

const recipe = computed(() => recipesStore.recipe);
const showDocumentation = ref(false);
const documentationContent = ref('');

onMounted(async () => {
  if (route.params.id) {
    await recipesStore.getRecipe(route.params.id);
  }

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/RecipeView.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((RecipeView_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'M/S';
  return new Date(dateString).toLocaleString('et-EE');
};

const deleteRecipe = async () => {
  if (confirm('Kas olete kindel, et soovite selle retsepti kustutada?')) {
    await recipesStore.deleteRecipe(recipe.value.id);
    await recipesStore.getRecipe(route.params.id);
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