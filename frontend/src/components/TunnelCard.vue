<script setup lang="ts">
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";

import InstructionModal from "~/components/InstructionModal.vue";
import TunnelModal from "~/components/TunnelModal.vue";

import type { client } from "~/wails/go/models";
import { ref } from "vue";

defineProps<{
  tunnel?: client.Tunnel;
}>();

const emit = defineEmits<{
  (event: "update:target", target: string): void;
}>();

const InstructionModalOpen = ref(false);
const EditModalOpen = ref(false);
</script>

<template>
  <li v-if="tunnel" class="col-span-1 flex rounded-md shadow-sm">
    <div
      class="flex flex-1 items-center justify-between truncate rounded-md border-t border-r border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-slate-800"
    >
      <div class="flex-1 truncate px-4 py-2 text-sm">
        <span class="font-medium text-gray-900 dark:text-gray-300">
          {{ tunnel.target }}
        </span>
        <p class="text-xs text-gray-600 dark:text-gray-400">
          <a
            :class="[
              tunnel.hostname
                ? 'cursor-pointer hover:text-gray-400 dark:hover:text-gray-100'
                : '',
            ]"
            @click="InstructionModalOpen = true"
          >
            {{ tunnel.hostname ?? "(Pending assignment)" }}
          </a>
        </p>
      </div>
      <div class="flex-shrink-0 pr-2">
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-gray-400 hover:text-gray-500"
          @click="EditModalOpen = true"
        >
          <span class="sr-only">Open options</span>
          <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
    <InstructionModal v-model:show="InstructionModalOpen" :tunnel="tunnel" />
    <TunnelModal
      v-model:show="EditModalOpen"
      :create="false"
      :target="tunnel.target"
      :hostname="tunnel.hostname"
      @update:target="emit('update:target', $event)"
    />
  </li>
</template>
