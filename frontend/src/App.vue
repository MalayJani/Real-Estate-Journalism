<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <nav>
    <router-link to="/">Home</router-link>
  </nav>
  <RouterView />
</template>

<style scoped>
nav {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
