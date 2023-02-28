<script lang="ts" setup>
import ProgressBar from "~/components/ProgressBar.vue";
import Nav from "~/components/NavBar.vue";
import AlertSection from "~/components/AlertSection.vue";
import { RouterView } from "vue-router";
import { onMounted } from "vue";
import { storeToRefs } from "pinia";

import { useLoadingStore } from "~/store/loading";

const { loading } = storeToRefs(useLoadingStore());

onMounted(() => {
  setTimeout(() => {
    window.loading_screen.finish();
  }, 750);
});
</script>

<template>
  <div class="min-h-full">
    <ProgressBar
      v-show="loading"
      class="absolute top-0"
      color-class="bg-slate-800 dark:bg-gray-200"
      bg-color-class="bg-black/0"
      :rounded="false"
      indeterminate
    />
    <Nav />
    <main class="py-10 dark:bg-slate-900">
      <div class="mx-auto max-w-screen-2xl sm:px-6 lg:px-8">
        <AlertSection class="mb-10" />
        <RouterView />
      </div>
    </main>
  </div>
</template>
