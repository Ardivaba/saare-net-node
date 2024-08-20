<template>
  <div class="container mx-auto">
    <AppHeader v-if="!isLoginPage"/>
    <router-view/>
  </div>
</template>

<script setup>
import "./style.css";
import AppHeader from "./components/AppHeader.vue";
import {useRoute} from "vue-router";
import {computed} from "vue";

const route = useRoute();
const isLoginPage = computed(() => route.path === '/login' || route.path === '/documentation');
</script>