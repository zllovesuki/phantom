<script lang="ts" setup>
import Nav from "~/components/NavBar.vue";
import AlertSection from "~/components/AlertSection.vue";
import ProgressBar from "~/components/utility/ProgressBar.vue";

import { RouterView } from "vue-router";
import { onMounted } from "vue";
import { storeToRefs } from "pinia";

import { useLoadingStore } from "~/store/loading";

const { loading: Loading } = storeToRefs(useLoadingStore());

onMounted(() => {
  setTimeout(() => {
    window.loading_screen.finish();
  }, 750);
});
</script>

<template>
  <div class="min-h-full">
    <Nav />
    <ProgressBar
      v-if="Loading"
      class="fixed"
      color-class="bg-indigo-600 dark:bg-indigo-600"
      bg-color-class="bg-black/0"
      :rounded="false"
      indeterminate
    />
    <main class="py-10 dark:bg-slate-900">
      <div class="mx-auto max-w-screen-2xl sm:px-8 lg:px-10">
        <AlertSection class="mb-10" />
        <RouterView />
      </div>
    </main>
  </div>
</template>
