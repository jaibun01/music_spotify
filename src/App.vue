<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Login from '@/components/Login.vue'
import LeftSidebar from './components/LeftSidebar.vue'
</script>

<template>
  <header>
    <Login />
  </header>
  <div class="wrapper">
    <LeftSidebar />
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  width: 100%;
  gap: 10px;
  padding: 0 10px;
}

@media screen and (max-width: 600px) {
  .wrapper {
    flex-direction: column;
  }
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.content {
  border-radius: 10px 10px 0 0;
  width: 100%;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    /* padding-right: calc(var(--section-gap) / 2); */
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
