<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '~/vendor/@headlessui-vue'

import { client } from '~/wails/go/models';
import { GetCurrentConfig } from '~/wails/go/specter/Application';
import { BrowserOpenURL } from '~/wails/runtime/runtime';

import { computed, ref, onMounted } from "vue";

const props = defineProps<{
    tunnel: client.Tunnel,
    show: boolean
}>();

const emit = defineEmits<{
    (event: 'update:show', open: boolean): void
}>()

let initialFocusRef = ref(null)

const open = computed({
    get() {
        return props.show
    },
    set(value) {
        emit("update:show", value)
    }
})

const SpecterConfig = ref<client.Config>(client.Config.createFrom({ apex: "" }))

function formatLink(hostname: string) {
    let apex = SpecterConfig.value.apex
    if (apex.endsWith(":443")) {
        apex = apex.slice(0, -4)
    }
    return hostname + '.' + apex
}

onMounted(async () => {
    const specterConfig = await GetCurrentConfig()
    if (specterConfig !== null) {
        SpecterConfig.value = specterConfig
    }
})
</script>

<template>
    <TransitionRoot as="template" :show="open">
        <Dialog as="div" class="relative z-10 no-drag" @close="open = false" :initial-focus="initialFocusRef">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild as="template" enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 sm:scale-100"
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <DialogPanel
                            class="relative transform overflow-hidden rounded-lg bg-white px-4 py-4 text-left shadow-xl transition-all sm:w-full sm:max-w-lg bg-gray-100 dark:bg-slate-900">
                            <div class="text-gray-900 dark:text-white">
                                <div class="text-center">
                                    <DialogTitle as="h3" class="text-lg font-medium leading-6">
                                        Connecting to your tunnel
                                    </DialogTitle>
                                    <div class="mt-2">
                                        <p class="text-sm py-2 text-gray-500 dark:text-gray-300">
                                            For HTTP(s) tunnel, you can visit <a ref="initialFocusRef"
                                                class="cursor-pointer dark:text-indigo-400 text-indigo-600 after:content-['_↗'] ..."
                                                :href="'http://' + formatLink(tunnel.hostname ?? '')"
                                                @click.prevent="BrowserOpenURL('https://' + formatLink(tunnel.hostname ?? ''))">
                                                {{ formatLink(tunnel.hostname ?? '') }}
                                            </a>
                                        </p>
                                        <p class="text-sm py-2 text-gray-500 dark:text-gray-300">
                                            For TCP tunnel, please refer to the repo for instructions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>