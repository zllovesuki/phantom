<script lang="ts" setup>
import "animate.css";

import Nav from "~/components/NavBar.vue";
import AlertSection from "~/components/AlertSection.vue";
import ProgressBar from "~/components/utility/ProgressBar.vue";
import DevMenu from "./components/utility/DevMenu";
import RouteTransition from "./RouteTransition.vue";

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
    <main class="canvas-bg-color py-10">
      <div class="mx-auto max-w-screen-2xl overflow-x-hidden sm:px-8 lg:px-10">
        <AlertSection class="mb-10" />
        <RouterView v-slot="{ Component, route }">
          <RouteTransition :element="Component" :route="route" />
        </RouterView>
      </div>
    </main>
    <DevMenu />
  </div>
</template>
