<script lang="ts" setup>
import {
  SparklesIcon,
  BoltSlashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/24/outline";
import StatusBadge, {
  type StatusLevel,
} from "~/components/utility/StatusBadge.vue";

import { computed, ref, onMounted, onUnmounted } from "vue";

import {
  GetPhantomConfig,
  RunningForwarders,
} from "~/wails/go/phantom/Application";
import { phantom } from "~/wails/go/models";
import broker from "~/events";

const NumRunning = ref<number>(0);
const PhantomConfig = ref<phantom.PhantomConfig>(
  phantom.PhantomConfig.createFrom({
    listeners: [],
    listenOnStart: false,
    specterInsecure: false,
  })
);

const listenerHealth = computed<StatusLevel>(() => {
  const numConfigured = PhantomConfig.value.listeners.length;
  if (numConfigured !== 0 && NumRunning.value === numConfigured) {
    return "healthy";
  }
  if (NumRunning.value !== 0 && NumRunning.value < numConfigured) {
    return "sick";
  }
  return "down";
});

const healthText = computed<string>(() => {
  switch (listenerHealth.value) {
    case "healthy":
      return "All Listeners Started";
    case "sick":
      return "Some Listeners Down";
    case "down":
      return "No Listeners Up";
    default:
      return "";
  }
});

async function reloadState() {
  const [phantomCfg, num] = await Promise.all([
    GetPhantomConfig(),
    RunningForwarders(),
  ]);
  if (phantomCfg !== null) {
    PhantomConfig.value = phantomCfg;
  }
  NumRunning.value = num;
}

broker.on("forwarder:Started", reloadState);
broker.on("forwarder:Stopped", reloadState);
onMounted(reloadState);
onUnmounted(() => {
  broker.off("forwarder:Started", reloadState);
  broker.off("forwarder:Stopped", reloadState);
});
</script>

<template>
  <StatusBadge :level="listenerHealth" :text="healthText">
    <template #healthy>
      <SparklesIcon class="ml-1 h-4 w-4" />
    </template>
    <template #sick>
      <ExclamationTriangleIcon class="ml-1 h-4 w-4" />
    </template>
    <template #down>
      <BoltSlashIcon class="ml-1 h-4 w-4" />
    </template>
  </StatusBadge>
</template>
