<template>
  <div class="dropdown">
    <label tabindex="0" class="btn m-1">Vali Töötajad</label>
    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
      <li v-for="worker in workers" :key="worker.id">
        <label class="label cursor-pointer justify-start">
          <input type="checkbox" 
                 :checked="modelValue.includes(worker.id)"
                 @change="toggleWorker(worker.id)"
                 class="checkbox" />
          <span class="label-text ml-2">{{ worker.name }}</span>
        </label>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  workers: {
    type: Array,
    required: true
  },
  modelValue: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

function toggleWorker(workerId) {
  const updatedSelection = props.modelValue.includes(workerId)
    ? props.modelValue.filter(id => id !== workerId)
    : [...props.modelValue, workerId];
  
  emit('update:modelValue', updatedSelection);
}
</script>