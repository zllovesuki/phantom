<script lang="ts" setup>
import Nav from "~/components/NavBar.vue";
import AlertSection from "~/components/AlertSection.vue";
import ProgressBar from "~/components/utility/ProgressBar.vue";
import { RouterView } from "vue-router";
import { onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";

import { useLoadingStore } from "~/store/loading";
import { EventsOn } from "~/runtime/patched";
import broker from "~/runtime/event";

const { loading } = storeToRefs(useLoadingStore());

onMounted(() => {
  const eventUnsubscriptions: (() => void)[] = [];
  eventUnsubscriptions.push(
    EventsOn("forwarder:Started", (l) => {
      broker.emit("forwarder:Started", l);
    })
  );
  eventUnsubscriptions.push(
    EventsOn("forwarder:Stopped", (l) => {
      broker.emit("forwarder:Stopped", l);
    })
  );

  onUnmounted(() => {
    for (const f of eventUnsubscriptions) {
      f();
    }
  });

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
