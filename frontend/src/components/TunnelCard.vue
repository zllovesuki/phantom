<script setup lang="ts">
import TunnelModal from "@/components/TunnelModal.vue"
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";

import type { client } from "@wails/go/models";
import { ref } from "vue";

defineProps<{
    tunnel?: client.Tunnel,
}>();

const emit = defineEmits<{
    (event: 'update:target', target: string): void
}>()
const open = ref(false)

</script>

<template>
    <li class="col-span-1 flex rounded-md shadow-sm" v-if="tunnel">
        <div
            class="flex flex-1 items-center justify-between truncate rounded-md border-t border-r border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800">
            <div class="flex-1 truncate px-4 py-2 text-sm">
                <span class="font-medium text-gray-900 dark:text-gray-300">
                    {{ tunnel.target }}
                </span>
                <p class="text-gray-600 dark:text-gray-400">
                    {{ tunnel.hostname ?? "(Pending assignment)" }}
                </p>
            </div>
            <div class="flex-shrink-0 pr-2">
                <button type="button" @click="open = true"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-gray-400 hover:text-gray-500">
                    <span class="sr-only">Open options</span>
                    <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
                </button>
            </div>
        </div>
        <TunnelModal :create="false" :target="tunnel.target" :hostname="tunnel.hostname" v-model:show="open"
            @update:target="emit('update:target', $event)" />
    </li>
</template>