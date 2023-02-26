<script lang="ts" setup>
import Nav from "~/components/NavBar.vue";
import AlertSection from "~/components/AlertSection.vue";
import { RouterView } from "vue-router";
import { onMounted } from "vue";

onMounted(() => {
  setTimeout(() => {
    window.loading_screen.finish();
  }, 750);
});
</script>

<template>
  <div class="min-h-full">
    <Nav />
    <main class="py-10 dark:bg-slate-900">
      <div class="mx-auto max-w-screen-2xl sm:px-6 lg:px-8">
        <AlertSection class="mb-10" />
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style>
@import "inter-ui/inter.css";
@import "~/assets/main.css";
</style>
