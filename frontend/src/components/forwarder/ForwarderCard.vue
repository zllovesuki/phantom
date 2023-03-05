<script setup lang="ts">
import {
  ArrowRightIcon,
  LockOpenIcon,
  TrashIcon,
} from "@heroicons/vue/20/solid";
import ForwarderStatusIndicator from "~/components/forwarder/ForwarderStatusIndicator";
import ForwarderLifecycleButton from "~/components/forwarder/ForwarderLifecycleButton";
import ForwarderModal from "~/components/forwarder/ForwarderModal.vue";
import ConfirmModal from "~/components/viewport/ConfirmModal.vue";

import { ref } from "vue";
import { storeToRefs } from "pinia";

import type { phantom } from "~/wails/go/models";
import { useLoadingStore } from "~/store/loading";

const props = defineProps<{
  listener: phantom.Listener;
}>();

const emit = defineEmits<{
  (event: "update:label", l: string): void;
  (event: "delete"): void;
}>();

const EditModalOpen = ref(false);
const ConfirmModalOpen = ref(false);

const { loading: Loading } = storeToRefs(useLoadingStore());

function updateLabel(ev: Event) {
  const el = ev.target as HTMLInputElement;
  const val = el.innerText.trim();
  if (val.length < 1) {
    el.innerHTML = props.listener.label;
  } else {
    if (val === props.listener.label) {
      return;
    }
    emit("update:label", val);
  }
}
</script>

<template>
  <li class="col-span-1 flex rounded-md shadow">
    <div
      class="flex flex-1 items-center justify-between truncate rounded-md bg-white dark:border-gray-800 dark:bg-slate-800"
    >
      <div class="flex-1 truncate px-3 py-2 text-sm">
        <span class="font-medium text-gray-900 dark:text-gray-300">
          <ForwarderStatusIndicator
            :listen="listener.listen"
            class="mr-0.5 h-4 w-4"
          />
          tcp://{{ listener.listen }}
          <LockOpenIcon
            v-show="listener.insecure"
            class="ml-0.5 inline-block h-4 w-4 pb-0.5"
          />
          [<span
            spellcheck="false"
            :contenteditable="!Loading"
            class="focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @keydown.enter="(ev) => {(ev.target as HTMLInputElement).blur()}"
            @blur="updateLabel"
            >{{ listener.label }}</span
          >]
        </span>
        <p class="text-xs text-gray-600 dark:text-gray-400">
          <ArrowRightIcon
            class="mr-0.5 inline-block h-4 w-4 text-indigo-500 dark:text-indigo-400"
          />
          {{ (listener.tcp ? "tcp://" : "quic://") + listener.hostname }}
        </p>
      </div>
      <div class="flex-shrink-0 pr-2">
        <ForwarderLifecycleButton :listen="listener.listen" />
        <button
          type="button"
          :class="[
            'inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-gray-400',
            !Loading ? 'hover:text-gray-500' : 'cursor-not-allowed',
            'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500',
          ]"
          :disabled="Loading"
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
