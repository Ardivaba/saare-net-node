<template>
  <div class="flex justify-center items-center h-screen bg-base-200">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title justify-center mb-4">Logi sisse</h2>
        <form @submit.prevent="login">
          <div class="form-control">
            <label class="label" for="username">
              <span class="label-text">Kasutajanimi</span>
            </label>
            <input
                id="username" v-model="username" type="text" placeholder="Sisesta kasutajanimi"
                class="input input-bordered" required/>
          </div>
          <div class="form-control mt-4">
            <label class="label" for="password">
              <span class="label-text">Parool</span>
            </label>
            <input
                id="password" v-model="password" type="password" placeholder="Sisesta parool"
                class="input input-bordered" required/>
          </div>
          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">Logi sisse</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import axios from 'axios';
import * as Sentry from "@sentry/vue";

const router = useRouter();
const username = ref('');
const password = ref('');

const login = async () => {
  try {
    await axios.post(window.baseURL + '/api/login', {
      username: username.value,
      password: password.value
    });
    await router.push('/');
  } catch (error) {
    Sentry.captureException({msg: 'Login failed', error});
  }
};
</script>