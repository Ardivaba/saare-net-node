<template>
  <div class="container mx-auto p-4 h-screen flex flex-col justify-center items-center" @click="refocusInput">
    <h1 class="text-4xl font-bold mb-6 text-center">Töötaja Sisselogimine</h1>
    
    <div class="text-2xl mb-6 text-center">
      Palun skanneerige oma RF-kiip
    </div>
    
    <input 
      ref="rfInput"
      v-model="rfCode"
      type="password"
      class="input input-bordered w-full max-w-xs text-3xl text-center mb-2"
      @blur="refocusInput"
      @keyup.enter="login"
    />
    
    <div v-if="error" class="text-red-500 text-sm mt-2 max-w-xs text-center">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkersStore } from '../stores/workers';
import axios from 'axios';

const router = useRouter();
const workersStore = useWorkersStore();
const rfCode = ref('');
const error = ref('');
const rfInput = ref(null);

const refocusInput = () => {
  if (rfInput.value) {
    rfInput.value.focus();
  }
};

const login = async () => {
  try {
    const response = await axios.post(window.baseURL + '/api/auth/workers/login', { code: rfCode.value });
    workersStore.setCurrentWorker(response.data);
    console.log('Worker logged in:', response.data);
    console.log('Current route:', router.currentRoute.value.path);
    
    // Force a redirect using window.location
    window.location.href = '/worker-dashboard';
  } catch (err) {
    console.error('Login error:', err);
    if (err.response && err.response.status === 401) {
      error.value = 'Kiipi ei tuvastatud. Palun proovige uuesti.';
    } else {
      error.value = 'Sisselogimisel tekkis viga. Palun proovige hiljem uuesti.';
    }
    rfCode.value = '';
  }
};

onMounted(() => {
  refocusInput();
  // Set up an interval to continuously refocus the input
  const focusInterval = setInterval(refocusInput, 100);
  
  // Clean up the interval when the component is unmounted
  onUnmounted(() => {
    clearInterval(focusInterval);
  });
});
</script>