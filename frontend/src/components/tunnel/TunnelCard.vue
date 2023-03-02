<script setup lang="ts">
import {
  EllipsisVerticalIcon,
  LockOpenIcon,
  StopIcon,
} from "@heroicons/vue/20/solid";
import InstructionModal from "~/components/tunnel/InstructionModal.vue";
import ConfirmModal from "~/components/utility/ConfirmModal.vue";
import TunnelModal from "~/components/tunnel/TunnelModal.vue";

import { ref } from "vue";
import { storeToRefs } from "pinia";

import type { client } from "~/wails/go/models";
import { useLoadingStore } from "~/store/loading";
import { useRuntimeStore } from "~/store/runtime";

defineProps<{
  tunnel: Readonly<client.Tunnel>;
}>();

const emit = defineEmits<{
  (event: "update:tunnel", tunnel: client.Tunnel): void;
  (event: "unpublish"): void;
  (event: "release"): void;
}>();

const InstructionModalOpen = ref(false);
const UnpublishModalOpen = ref(false);
const EditModalOpen = ref(false);
const { loading: Loading } = storeToRefs(useLoadingStore());
const { ClientConnected } = storeToRefs(useRuntimeStore());
</script>

<template>
  <li class="col-span-1 flex rounded-md shadow-sm">
    <div
      class="flex flex-1 items-center justify-between truncate rounded-md border-t border-r border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-slate-800"
    >
      <div class="flex-1 truncate px-4 py-2 text-sm">
        <span class="font-medium text-gray-900 dark:text-gray-300">
          {{ tunnel.target }}
          <LockOpenIcon
            v-show="tunnel.insecure"
            class="ml-0.5 inline-block h-4 w-4 pb-0.5"
          />
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
            {{ tunnel.hostname ?? "(Pending hostname assignment)" }}
          </a>
        </p>
      </div>
      <div class="flex-shrink-0 pr-2">
        <button
          v-show="!!tunnel.hostname && ClientConnected"
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-gray-400 hover:text-gray-500"
          :disabled="Loading"
          @click="UnpublishModalOpen = true"
        >
          <span class="sr-only">Unpublish tunnel</span>
          <StopIcon class="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-gray-400 hover:text-gray-500"
          :disabled="Loading"
          @click="EditModalOpen = true"
        >
          <span class="sr-only">Edit tunnel</span>
          <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
    <InstructionModal v-model:show="InstructionModalOpen" :tunnel="tunnel" />
    <TunnelModal
      v-model:show="EditModalOpen"
      :tunnel="tunnel"
      @update:tunnel="emit('update:tunnel', $event)"
      @delete="emit('release')"
    />
    <ConfirmModal
      v-model:show="UnpublishModalOpen"
      title="Unpublishing Tunnel"
      :descriptions="[
        'This will remove tunnel advertisement from the network, but the hostname is kept for use later.',
      ]"
      @confirmed="emit('unpublish')"
    />
  </li>
</template>
