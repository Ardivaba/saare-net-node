<template>
  <div class="container mx-auto p-4 h-screen flex flex-col justify-center items-center">
    <h1 class="text-4xl font-bold mb-6 text-center">Töötaja Sisselogimine</h1>
    
    <div class="text-2xl mb-6 text-center">
      Palun skanneerige oma RF-kiip
    </div>

    <div v-if="error" class="alert alert-error shadow-lg mb-4">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ error }}</span>
      </div>
    </div>

    <input 
      ref="rfInput"
      v-model="rfCode"
      type="password"
      class="input input-bordered w-full max-w-xs text-3xl text-center"
      autofocus
      @keyup.enter="login"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkersStore } from '../stores/workers';
import axios from 'axios'; // Make sure to import axios

const router = useRouter();
const workersStore = useWorkersStore();

const rfCode = ref('');
const error = ref('');
const rfInput = ref(null);

const login = async () => {
  try {
    const response = await axios.post(window.baseURL + '/api/auth/workers/login', { code: rfCode.value });
    await workersStore.setCurrentWorker(response.data);
    console.log('Worker logged in:', response.data);
    console.log('Current route:', router.currentRoute.value.path);
    
    // Force a redirect using window.location
    window.location.href = '/worker-dashboard';
  } catch (error) {
    console.error('Login error:', error);
    if (error.response && error.response.status === 401) {
      error.value = 'Vale kiip. Palun proovige uuesti.';
    } else {
      error.value = 'Sisselogimisel tekkis viga. Palun proovige hiljem uuesti.';
    }
    rfCode.value = '';
  }
};

onMounted(() => {
  rfInput.value.focus();
});
</script>