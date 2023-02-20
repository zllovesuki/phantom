<script setup lang="ts">
import StatusBadge from "@/components/StatusBadge.vue";
import HorizontalDivider from "@/components/HorizontalDivider.vue";
import {
    SparklesIcon,
    BoltSlashIcon,
} from "@heroicons/vue/24/outline";

import { ref, onMounted } from "vue";
import { GetCurrentConfig } from "@wails/go/specter/Application"
import { client } from "@wails/go/models";

const Connected = ref(false)
const Config = ref<client.Config>(client.Config.createFrom({ apex: "" }))

onMounted(async () => {
    const cfg = await GetCurrentConfig()
    if (cfg !== null) {
        Config.value = cfg
    }
})
</script>

<template>
    <div class="box">
        <div class="box-wrapper text-gray-900 dark:text-gray-300">
            <div>
                <div class="md:grid md:grid-cols-3 md:gap-6">
                    <div class="md:col-span-1">
                        <div class="px-4 sm:px-0">
                            <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
                                Client Status
                            </h3>
                            <p class="mt-2 text-xs text-gray-600">
                                <StatusBadge text="Connected" :enabled="Connected">
                                    <template #enabled>
                                        <SparklesIcon class="ml-1 w-4 h-4" />
                                    </template>
                                    <template #disabled>
                                        <BoltSlashIcon class="ml-1 w-4 h-4" />
                                    </template>
                                </StatusBadge>
                            </p>
                        </div>
                    </div>
                    <div class="mt-5 md:col-span-2 md:mt-0">
                        <form>
                            <div class="overflow-hidden shadow sm:rounded-md">
                                <div class="bg-white dark:bg-slate-800 px-4 py-5 sm:p-6">
                                    <div class="grid grid-cols-6 gap-6">
                                        <div :class="
                                            Connected
                                                ? 'col-span-6 sm:col-span-3'
                                                : 'col-span-12 sm:col-span-6'
                                        ">
                                            <div class="mt-1 flex items-center">
                                                <span class="inline-block text-sm text-gray-700 dark:text-gray-300">
                                                    Blah blah blah
                                                </span>
                                            </div>
                                        </div>
                                        <div class="col-span-6 sm:col-span-3" v-show="Connected">
                                            <button type="button"
                                                class="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-4 py-2 text-sm font-medium dark:text-gray-200 dark:hover:bg-gray-600 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                                End Livestream
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <HorizontalDivider />

            <div class="mt-10 sm:mt-0">
                <div class="md:grid md:grid-cols-3 md:gap-6">
                    <div class="md:col-span-1">
                        <div class="px-4 sm:px-0">
                            <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
                                Client Configuration
                            </h3>
                            <p class="mt-2 text-sm text-gray-600">
                            </p>
                        </div>
                    </div>

                    <div class="mt-5 md:col-span-2 md:mt-0">
                        <form @submit.prevent>
                            <div class="shadow sm:overflow-hidden sm:rounded-md">
                                <div class="space-y-6 bg-white dark:bg-slate-800 px-4 py-5 sm:p-6">
                                    <div class="grid grid-cols-3 gap-6">
                                        <div class="col-span-3 sm:col-span-2">
                                            <label for="specter-apex"
                                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Specter Apex
                                            </label>
                                            <div class="mt-1 flex rounded-md shadow-sm">
                                                <span
                                                    class="inline-flex items-center rounded-l-md border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700 px-3 text-sm dark:text-white text-black">https://</span>
                                                <input type="text" name="specter-apex" id="specter-apex"
                                                    v-model="Config.apex"
                                                    class="block w-full flex-1 rounded-none rounded-r-md border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 sm:text-sm dark:text-white text-black placeholder-gray-600 dark:placeholder-gray-400"
                                                    placeholder="specter.im:443" />
                                            </div>
                                        </div>
                                    </div>
                                    <fieldset>
                                        <legend class="sr-only">Options</legend>
                                        <label for="specter-apex"
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Options
                                        </label>
                                        <div class="mt-4 space-y-4">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input id="target-tls" name="target-tls" type="checkbox"
                                                        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                                </div>
                                                <div class="ml-3 text-sm">
                                                    <label for="target-tls"
                                                        class="font-medium text-gray-700 dark:text-gray-300">
                                                        Disable Client TLS
                                                    </label>
                                                    <p class="text-gray-500 dark:text-gray-400 text-xs">
                                                        Disable TLS verification when dialing to specter gateway. Should
                                                        only be used during development.
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input id="target-tls" name="target-tls" type="checkbox"
                                                        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                                </div>
                                                <div class="ml-3 text-sm">
                                                    <label for="target-tls"
                                                        class="font-medium text-gray-700 dark:text-gray-300">
                                                        Disable Target TLS
                                                    </label>
                                                    <p class="text-gray-500 dark:text-gray-400 text-xs">
                                                        Disable TLS verification when dialing to https target.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>