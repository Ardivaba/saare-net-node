<template>
  <div class="navbar bg-primary text-primary-content shadow-lg">
    <div class="navbar-start">
      <div class="dropdown">
        <label tabindex="0" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </label>
        <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1000] p-2 shadow bg-base-100 rounded-box w-52">
          <li><RouterLink to="/events" active-class="bg-secondary text-secondary-content">Sündmused</RouterLink></li>
          <li><RouterLink to="/settings" active-class="bg-secondary text-secondary-content">Seaded</RouterLink></li>
        </ul>
      </div>
      <RouterLink to="/" class="btn btn-ghost normal-case text-xl flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        Saarevõrk
      </RouterLink>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li><RouterLink to="/events" active-class="!bg-secondary !text-secondary-content font-bold">Sündmused</RouterLink></li>
        <li><RouterLink to="/workers" active-class="!bg-secondary !text-secondary-content font-bold">Töötajad</RouterLink></li>
        <li><RouterLink to="/recipes" active-class="!bg-secondary !text-secondary-content font-bold">Retseptid</RouterLink></li>
        <li><RouterLink to="/orders" active-class="!bg-secondary !text-secondary-content font-bold">Tellimused</RouterLink></li>
        <li><RouterLink to="/productions" active-class="!bg-secondary !text-secondary-content font-bold">Toodang</RouterLink></li>
        <li><RouterLink to="/production-work-logs" active-class="!bg-secondary !text-secondary-content font-bold">Tööajad</RouterLink></li>
        <li><RouterLink to="/machines" active-class="bg-secondary text-secondary-content">Masinad</RouterLink></li>
        <li><RouterLink to="/reports" active-class="!bg-secondary !text-secondary-content font-bold">Raportid</RouterLink></li>
        <li><RouterLink to="/settings" active-class="!bg-secondary !text-secondary-content font-bold">Seaded</RouterLink></li>
      </ul>
    </div>
    <div class="navbar-end">
      <button class="btn btn-ghost" @click="logout">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logi välja
      </button>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { useRouter } from "vue-router";
import * as Sentry from "@sentry/vue";

const router = useRouter();

const logout = async () => {
  try {
    await axios.post(window.baseURL + '/api/logout');
    await router.push('/login');
  } catch (error) {
    Sentry.captureException({msg: 'Logout failed', error});
  }
};
</script>

<style scoped>
.router-link-active {
  background-color: hsl(var(--s));
  color: hsl(var(--sc));
  font-weight: bold;
}

.dropdown-content {
  z-index: 1000;
}

.menu details[open] > ul {
  z-index: 1000;
}
</style>