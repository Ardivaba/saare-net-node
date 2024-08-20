<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">Retseptid</h1>
    
    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <div class="mb-4">
      <RouterLink to="/recipes/create" class="btn btn-primary">
        <svg
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-6 h-6 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Lisa Retsept
      </RouterLink>
    </div>
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th @click="sort('id')">ID {{ sortIcon('id') }}</th>
            <th @click="sort('code')">Kood {{ sortIcon('code') }}</th>
            <th @click="sort('description')">Kirjeldus {{ sortIcon('description') }}</th>
            <th @click="sort('float_gap')">Ujuki vahe (mm) {{ sortIcon('float_gap') }}</th>
            <th @click="sort('float_length')">Ujuki pikkus (mm) {{ sortIcon('float_length') }}</th>
            <th @click="sort('rope_length')">Nööri pikkus (m) {{ sortIcon('rope_length') }}</th>
            <th @click="sort('created_at')">Loodud {{ sortIcon('created_at') }}</th>
            <th @click="sort('updated_at')">Muudetud {{ sortIcon('updated_at') }}</th>
            <th>Tegevused</th>
          </tr>
        </thead>
        <tbody>
        <tr v-for="recipe in recipes" :key="recipe.id">
          <td>{{ recipe.id }}</td>
          <td>{{ recipe.code }}</td>
          <td>{{ recipe.description }}</td>
          <td>{{ recipe.float_gap }}</td>
          <td>{{ recipe.float_length }}</td>
          <td>{{ recipe.rope_length }}</td>
          <td>{{ formatDate(recipe.created_at) }}</td>
          <td>{{ formatDate(recipe.updated_at) }}</td>
          <td>
            <div class="flex space-x-2">
              <RouterLink :to="`/recipes/${recipe.id}`" class="btn btn-sm btn-info">Vaata</RouterLink>
              <RouterLink :to="`/recipes/edit/${recipe.id}`" class="btn btn-sm btn-warning">Muuda</RouterLink>
              <button class="btn btn-sm btn-error" @click="deleteRecipe(recipe.id)">Kustuta</button>
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
import { useRecipesStore } from "../stores/recipes.js";
import VueMarkdownRender from 'vue-markdown-render';

const recipesStore = useRecipesStore();
const recipes = computed(() => recipesStore.recipes);
const currentPage = computed(() => recipesStore.currentPage);
const totalPages = computed(() => recipesStore.totalPages);

const sortColumn = ref('id');
const sortDirection = ref('asc');
const showDocumentation = ref(false);
const documentationContent = ref('');

onMounted(async () => {
  await recipesStore.getRecipes();

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/RecipesView.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((RecipesView_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('et-EE');
};

const deleteRecipe = async (id) => {
  if (confirm("Kas olete kindel, et soovite selle retsepti kustutada?")) {
    await recipesStore.deleteRecipe(id);
    await recipesStore.getRecipes();
  }
};

const sort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
  recipesStore.setSorting(sortColumn.value, sortDirection.value);
  recipesStore.getRecipes();
};

const sortIcon = (column) => {
  if (sortColumn.value !== column) return '';
  return sortDirection.value === 'asc' ? '▲' : '▼';
};

watch([sortColumn, sortDirection], () => {
  recipesStore.setPage(1);
  recipesStore.getRecipes();
});

const changePage = (delta) => {
  recipesStore.setPage(currentPage.value + delta);
  recipesStore.getRecipes();
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