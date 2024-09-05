<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-base-100 p-6 rounded-lg max-w-2xl w-full">
      <h2 class="text-3xl font-bold mb-4">Masin #{{ machine.name }}</h2>
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p class="text-xl"><strong>Retsepti kood:</strong> {{ machine.recipe_code || 'Puudub' }}</p>
          <p class="text-xl"><strong>Ujuki pikkus:</strong> {{ machine.float_length || 'Puudub' }} mm</p>
          <p class="text-xl"><strong>Ujuki vahe:</strong> {{ machine.float_gap || 'Puudub' }} mm</p>
        </div>
        <div>
          <p class="text-xl"><strong>Nööri pikkus:</strong> {{ machine.rope_length || 'Puudub' }} m</p>
          <p class="text-xl"><strong>Olek:</strong> {{ formatState(machine.state) }}</p>
        </div>
      </div>

      <button 
        class="btn btn-primary btn-lg w-full"
        :disabled="machine.state !== 'Waiting'"
        @click="$emit('load-recipe')"
      >
        {{ machine.state === 'Waiting' ? 'Lae retsept' : 'Masin töötab' }}
      </button>

      <button class="btn btn-ghost btn-lg w-full mt-4" @click="$emit('close')">Sulge</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  machine: {
    type: Object,
    required: true
  }
});

defineEmits(['close', 'load-recipe']);

const formatState = (state) => {
  const states = {
    'Producing': 'Tootmine',
    'Waiting': 'Ootel',
    'Off': 'Välja lülitatud'
  };
  return states[state] || state;
};
</script>

