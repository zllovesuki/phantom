<script setup lang="ts">
import {
  ArrowsRightLeftIcon,
  LockOpenIcon,
  TrashIcon,
} from "@heroicons/vue/20/solid";
import ForwarderStatusIndicator from "~/components/forwarder/ForwarderStatusIndicator";
import ForwarderLifecycleButton from "~/components/forwarder/ForwarderLifecycleButton";
import ForwarderModal from "~/components/forwarder/ForwarderModal.vue";
import ConfirmModal from "~/components/utility/ConfirmModal.vue";

import { ref } from "vue";
import { storeToRefs } from "pinia";

import type { specter } from "~/wails/go/models";
import { useLoadingStore } from "~/store/loading";

defineProps<{
  listener: specter.Listener;
}>();

const emit = defineEmits<{
  (event: "delete"): void;
}>();

const EditModalOpen = ref(false);
const ConfirmModalOpen = ref(false);
const { loading } = storeToRefs(useLoadingStore());
</script>

<template>
  <li class="col-span-1 flex rounded-md shadow-sm">
    <div
      class="flex flex-1 items-center justify-between truncate rounded-md border-t border-r border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-slate-800"
    >
      <div class="flex-1 truncate px-4 py-2 text-sm">
        <span class="font-medium text-gray-900 dark:text-gray-300">
          <ForwarderStatusIndicator
            :listen="listener.listen"
            class="mr-0.5 h-5 w-5"
          />
          tcp://{{ listener.listen }}
          <LockOpenIcon
            v-show="listener.insecure"
            class="ml-0.5 inline-block h-4 w-4 pb-0.5"
          />
          / {{ listener.label }}
        </span>
        <p class="text-xs text-gray-600 dark:text-gray-400">
          <ArrowsRightLeftIcon
            class="mr-0.5 inline-block h-5 w-5 text-gray-900 dark:text-gray-300"
          />
          {{ (listener.tcp ? "tcp://" : "quic://") + listener.hostname }}
        </p>
      </div>
      <div class="flex-shrink-0 pr-2">
        <ForwarderLifecycleButton :listen="listener.listen" />
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-gray-400 hover:text-gray-500"
          :disabled="loading"
          @click.prevent="ConfirmModalOpen = true"
        >
          <span class="sr-only">Remove forwarder</span>
          <TrashIcon class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
    <ConfirmModal
      v-model:show="ConfirmModalOpen"
      title="Removing Forwarder"
      :descriptions="[
        'Are you sure you want to remove this forwarder?',
        'All established connections will be disconnected.',
      ]"
      @confirmed="emit('delete')"
    />
    <ForwarderModal v-model:show="EditModalOpen" :listener="listener" />
  </li>
</template>
