<script setup lang="ts">
import {
  EllipsisVerticalIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/vue/20/solid";

import ForwarderModal from "~/components/ForwarderModal.vue";

import { ref } from "vue";
import { storeToRefs } from "pinia";

import type { specter } from "~/wails/go/models";
import { useLoadingStore } from "~/store/loading";

defineProps<{
  listener: Readonly<specter.Listener>;
}>();

const emit = defineEmits<{
  (event: "update:listener", listener: specter.Listener): void;
  (event: "delete"): void;
}>();

const EditModalOpen = ref(false);
const { loading } = storeToRefs(useLoadingStore());
</script>

<template>
  <li class="col-span-1 flex rounded-md shadow-sm">
    <div
      class="flex flex-1 items-center justify-between truncate rounded-md border-t border-r border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-slate-800"
    >
      <div class="flex-1 truncate px-4 py-2 text-sm">
        <span class="font-medium text-gray-900 dark:text-gray-300">
          tcp://{{ listener.listen }}
        </span>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          <ArrowsRightLeftIcon
            class="inline-block h-4 w-4 text-gray-900 dark:text-gray-300"
          />
          {{ (listener.tcp ? "tcp://" : "quic://") + listener.hostname }}
        </p>
      </div>
      <div class="flex-shrink-0 pr-2">
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-gray-400 hover:text-gray-500"
          :disabled="loading"
          @click="EditModalOpen = true"
        >
          <span class="sr-only">Open options</span>
          <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
    <ForwarderModal
      v-model:show="EditModalOpen"
      :create="false"
      :listener="listener"
      @update:listener="emit('update:listener', $event)"
      @delete="emit('delete')"
    />
  </li>
</template>
