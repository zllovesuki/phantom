<script setup lang="ts">
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
import { TrashIcon } from "@heroicons/vue/24/outline";

import { ParseTarget } from "@wails/go/specter/Helper"
import { ref, computed, onMounted } from "vue";

const props = defineProps<{
    target: string,
    hostname?: string,
    create: boolean
    show: boolean
}>();

const emit = defineEmits<{
    (event: 'update:target', target: string): void
    (event: 'update:show', open: boolean): void
}>()

let initialFocusRef = ref(null)

function emitTargetUpdate(scheme: string, target: string) {
    if (target.length < 1) {
        emit('update:target', "")
        return
    }
    if (scheme === "winio") {
        emit('update:target', target)
        return
    }
    emit('update:target', scheme + "://" + target)
}

const scheme = ref("tcp")
const target = ref("")
onMounted(async () => {
    const parsed = await ParseTarget(props.target)
    if (parsed.error) {
        return
    }
    scheme.value = parsed.protocol
    target.value = parsed.destination
})

const open = computed({
    get() {
        return props.show
    },
    set(value) {
        emit("update:show", value)
    }
})

const placeholders: Record<string, string> = {
    "tcp": "127.0.0.1:22",
    "http": "127.0.0.1:8080",
    "https": "127.0.0.1:8443",
    "unix": "/run/nginx.sock",
    "winio": "\\\\.\\pipe\\ipc"
}

const schemes = Object.keys(placeholders)

function onSubmit() {
    emitTargetUpdate(scheme.value, target.value)
    open.value = false
}
</script>

<template>
    <TransitionRoot as="template" :show="open">
        <Dialog as="div" class="relative z-10" @close="open = false" :initial-focus="initialFocusRef">
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
                            <button type="button" v-if="!create"
                                class="absolute top-10 right-10 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white">
                                <span class="sr-only">Remove Tunnel</span>
                                <TrashIcon class="h-5 w-5" aria-hidden="true" />
                            </button>
                            <div class="px-6 py-6">
                                <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                                    {{ !create ? "Edit existing tunnel" : "Add new tunnel" }}
                                </h3>
                                <form class="space-y-6" @submit.prevent="onSubmit">
                                    <div>
                                        <label for="target"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Target
                                        </label>
                                        <div class="flex">
                                            <Listbox as="div" v-model="scheme">
                                                <div class="relative">
                                                    <ListboxButton
                                                        class="relative w-20 cursor-default rounded-md rounded-r-none border border-gray-300 dark:border-gray-500 dark:text-white text-black bg-gray-50 dark:bg-slate-700 py-3 pl-3 pr-8 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                                                        <span class="block">{{ scheme }}</span>
                                                        <span
                                                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
                                                            <ChevronUpDownIcon class="h-5 w-5 text-gray-400"
                                                                aria-hidden="true" />
                                                        </span>
                                                    </ListboxButton>

                                                    <transition leave-active-class="transition ease-in duration-100"
                                                        leave-from-class="opacity-100" leave-to-class="opacity-0">
                                                        <ListboxOptions
                                                            class="absolute z-10 mt-1 max-h-60 py1 w-full overflow-y-auto bg-gray-50 dark:bg-gray-700 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                            <ListboxOption as="template" v-for="scheme in schemes"
                                                                :value="scheme" v-slot="{ active, selected }">
                                                                <li
                                                                    :class="[active ? 'bg-gray-300 dark:text-white dark:bg-slate-500' : 'dark:text-white', 'relative cursor-default select-none py-2 pl-3 pr-7']">
                                                                    <span
                                                                        :class="[selected ? 'font-semibold' : 'font-light', 'block']">
                                                                        {{ scheme }}
                                                                    </span>

                                                                    <span v-if="selected"
                                                                        :class="[active ? 'dark:text-white' : 'dark:text-white', 'absolute inset-y-0 right-0 flex items-center pr-2']">
                                                                        <CheckIcon class="h-4 w-4" aria-hidden="true" />
                                                                    </span>
                                                                </li>
                                                            </ListboxOption>
                                                        </ListboxOptions>
                                                    </transition>
                                                </div>
                                            </Listbox>
                                            <input type="text" name="target" id="target" v-model="target"
                                                ref="initialFocusRef"
                                                class="block w-full p-2.5 bg-transparent border border-l-0 border-gray-300 text-gray-900 text-sm rounded-lg rounded-l-none focus:ring-1 focus:ring-indigo-500 focus:border-blue-500 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                                :placeholder="placeholders[scheme]" required />
                                        </div>
                                        <p id="helper-text-explanation" v-show="!create"
                                            class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            Note that updating HTTP(s) target may not take effect immediately.
                                        </p>
                                    </div>
                                    <div>
                                        <label for="hostname"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Hostname
                                        </label>
                                        <input type="text" name="hostname" id="hostname" :value="hostname"
                                            placeholder="(Assigned on Publish)"
                                            class="bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white disabled:text-gray-400 dark:disabled:text-gray-400"
                                            disabled readonly />
                                    </div>
                                    <button type="submit"
                                        class="w-full text-black dark:text-white hover:bg-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-blue-800">
                                        {{ !create ? "Update" : "Add" }}
                                    </button>
                                </form>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>