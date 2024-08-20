<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-base-100 p-6 rounded-lg max-w-2xl w-full">
      <h2 class="text-3xl font-bold mb-4">Vali Retsept</h2>
      
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Otsi retsepti koodi või kirjelduse järgi" 
        class="input input-bordered w-full text-xl mb-4"
      />
      
      <ul class="space-y-2 mb-6 max-h-60 overflow-y-auto">
        <li 
          v-for="recipe in filteredRecipes" 
          :key="recipe.id" 
          class="p-4 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300"
          @click="selectRecipe(recipe)"
        >
          <div class="text-xl font-semibold">Retsept #{{ recipe.code }}</div>
          <div><strong>Kirjeldus:</strong> {{ recipe.description }}</div>
          <div><strong>Ujuki pikkus:</strong> {{ recipe.float_length }} mm</div>
          <div><strong>Ujuki vahe:</strong> {{ recipe.float_gap }} mm</div>
          <div><strong>Nööri pikkus:</strong> {{ recipe.rope_length }} m</div>
        </li>
      </ul>
      
      <div v-if="selectedRecipe" class="mb-6 bg-base-200 p-4 rounded-lg">
        <h3 class="text-2xl font-bold mb-4">Valitud Retsept</h3>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <h4 class="font-semibold text-lg">Kood</h4>
            <p class="text-xl">{{ selectedRecipe.code }}</p>
          </div>
          <div>
            <h4 class="font-semibold text-lg">Kirjeldus</h4>
            <p class="text-xl">{{ selectedRecipe.description }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h4 class="font-semibold text-lg">Ujuki pikkus</h4>
              <p class="text-xl">{{ selectedRecipe.float_length }} mm</p>
            </div>
            <div>
              <h4 class="font-semibold text-lg">Ujuki vahe</h4>
              <p class="text-xl">{{ selectedRecipe.float_gap }} mm</p>
            </div>
            <div>
              <h4 class="font-semibold text-lg">Nööri pikkus</h4>
              <p class="text-xl">{{ selectedRecipe.rope_length }} m</p>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        class="btn btn-primary btn-lg w-full"
        :disabled="!selectedRecipe"
        @click="loadRecipe"
      >
        Lae Retsept
      </button>
      
      <button class="btn btn-ghost btn-lg w-full mt-4" @click="$emit('close')">Sulge</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRecipesStore } from '../stores/recipes';
import { useMachinesStore } from '../stores/machines';

const props = defineProps({
  machineId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close', 'recipe-loaded']);

const recipesStore = useRecipesStore();
const machinesStore = useMachinesStore();

const searchQuery = ref('');
const selectedRecipe = ref(null);

const filteredRecipes = computed(() => recipesStore.filteredRecipes);

const selectRecipe = (recipe) => {
  selectedRecipe.value = recipe;
};

const loadRecipe = async () => {
  if (!selectedRecipe.value) return;

  if (confirm('Kas olete kindel, et soovite selle retsepti laadida?')) {
    try {
      await machinesStore.loadRecipe(props.machineId, selectedRecipe.value.id);
      emit('recipe-loaded');
    } catch (error) {
      console.error('Error loading recipe:', error);
      alert('Viga retsepti laadimisel. Palun proovige uuesti.');
    }
  }
};

onMounted(async () => {
  await recipesStore.getAllRecipes();
});

watch(searchQuery, (newQuery) => {
  recipesStore.filterRecipes(newQuery);
});
</script>