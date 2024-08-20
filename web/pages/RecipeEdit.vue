<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6">{{ isEditing ? 'Muuda Retsepti' : 'Lisa Uus Retsept' }}</h1>

    <!-- Documentation icon -->
    <button class="btn btn-circle btn-ghost absolute top-4 right-4" @click="showDocumentation = true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <form class="bg-base-200 p-6 rounded-lg shadow-lg max-w-2xl mx-auto" @submit.prevent="saveRecipe">
      <div class="space-y-6">
        <div class="form-control">
          <label class="label" for="code">
            <span class="label-text">Kood</span>
          </label>
          <input id="code" v-model.number="recipeData.code" type="number" class="input input-bordered w-full" required @input="validateField('code')"/>
          <p v-if="recipeData.code === null" class="text-gray-500 mt-1">Kood peab olema määratud</p>
          <p v-else-if="validationErrors.code" class="text-error mt-1">{{ validationErrors.code }}</p>
        </div>

        <div class="form-control">
          <label class="label" for="description">
            <span class="label-text">Kirjeldus</span>
          </label>
          <input id="description" v-model="recipeData.description" type="text" class="input input-bordered w-full" required />
        </div>

        <div class="form-control">
          <label class="label" for="float_gap">
            <span class="label-text">Ujuki vahe (mm)</span>
          </label>
          <input id="float_gap" v-model.number="recipeData.float_gap" type="number" step="0.01" class="input input-bordered w-full" required @input="validateField('float_gap')"/>
          <p v-if="recipeData.float_gap === null" class="text-gray-500 mt-1">Ujuki vahe peab olema määratud</p>
          <p v-else-if="validationErrors.float_gap" class="text-error mt-1">{{ validationErrors.float_gap }}</p>
        </div>

        <div class="form-control">
          <label class="label" for="float_length">
            <span class="label-text">Ujuki pikkus (mm)</span>
          </label>
          <input id="float_length" v-model.number="recipeData.float_length" type="number" step="0.01" class="input input-bordered w-full" required @input="validateField('float_length')"/>
          <p v-if="recipeData.float_length === null" class="text-gray-500 mt-1">Ujuki pikkus peab olema määratud</p>
          <p v-else-if="validationErrors.float_length" class="text-error mt-1">{{ validationErrors.float_length }}</p>
        </div>

        <div class="form-control">
          <label class="label" for="rope_length">
            <span class="label-text">Nööri pikkus (m)</span>
          </label>
          <input id="rope_length" v-model.number="recipeData.rope_length" type="number" step="0.01" class="input input-bordered w-full" required @input="validateField('rope_length')"/>
          <p v-if="recipeData.rope_length === null" class="text-gray-500 mt-1">Nööri pikkus peab olema määratud</p>
          <p v-else-if="validationErrors.rope_length" class="text-error mt-1">{{ validationErrors.rope_length }}</p>
        </div>
      </div>

      <div class="mt-8 flex justify-end space-x-2">
        <button type="button" class="btn btn-ghost" @click="cancel">Tühista</button>
        <button type="submit" class="btn btn-primary" :disabled="!isFormValid">Salvesta</button>
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
import { useRecipesStore } from '../stores/recipes';
import { useRoute, useRouter } from 'vue-router';
import VueMarkdownRender from 'vue-markdown-render';
import * as Sentry from "@sentry/vue";

const route = useRoute();
const router = useRouter();
const recipesStore = useRecipesStore();

const isEditing = computed(() => !!route.params.id);
const recipeData = ref({
  code: null,
  description: '',
  float_gap: null,
  float_length: null,
  rope_length: null
});

const showDocumentation = ref(false);
const documentationContent = ref('');

const validationErrors = ref({});

const validateField = (field) => {
  const fieldNames = {
    code: 'Kood',
    float_gap: 'Ujuki vahe',
    float_length: 'Ujuki pikkus',
    rope_length: 'Nööri pikkus'
  };

  if (recipeData.value[field] !== null && recipeData.value[field] <= 0) {
    validationErrors.value[field] = `${fieldNames[field]} peab olema positiivne number`;
  } else {
    validationErrors.value[field] = null;
  }

  // If the field is empty (null or empty string), set the value to null
  if (recipeData.value[field] === '' || recipeData.value[field] === null) {
    recipeData.value[field] = null;
  }
};

const isFormValid = computed(() => {
  return Object.values(recipeData.value).every(value => value !== null && value !== '') &&
         Object.values(validationErrors.value).every(error => error === null);
});

onMounted(async () => {
  if (isEditing.value) {
    await recipesStore.getRecipe(route.params.id);
    recipeData.value = { ...recipesStore.recipe };
  }

  // Load documentation content
  try {
    const response = await fetch('/documentation/pages/RecipeEdit.generated.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\((RecipeEdit_\d+\.png)\)/g, '![Screenshot](/documentation/pages/$1)');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
  }
});

const saveRecipe = async () => {
  if (!isFormValid.value) {
    return;
  }

  try {
    if (isEditing.value) {
      await recipesStore.updateRecipe(route.params.id, recipeData.value);
    } else {
      await recipesStore.createRecipe(recipeData.value);
    }
    await router.push('/recipes');
  } catch (error) {
    Sentry.captureException({msg: 'Viga retsepti salvestamisel', error});
  }
};

const cancel = async () => {
  await router.push('/recipes');
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