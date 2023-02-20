<script setup lang="ts">
import StatusBadge from "@/components/StatusBadge.vue";
import HorizontalDivider from "@/components/HorizontalDivider.vue";
import {
    SparklesIcon,
    BoltSlashIcon,
    ServerIcon,
} from "@heroicons/vue/24/outline";
import { EllipsisVerticalIcon } from '@heroicons/vue/20/solid'

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
    if (!Config.value.tunnels) {
        Config.value.tunnels = []
    }
    Config.value.clientId = 12345678
    Config.value.token = "abcd"
    Config.value.tunnels.push({
        target: "tcp://127.0.0.1:22",
    })
    Config.value.tunnels.push({
        target: "http://127.0.0.1:80",
        hostname: "evil-writing-roaming-chariot-plutonium"
    })
    Config.value.tunnels.push({
        target: "http://127.0.0.1:19292",
        hostname: "shine-litmus-opposing-junior-undying"
    })
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
                                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Specter
                                                Apex</label>
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
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <HorizontalDivider />

            <div class="mt-10 sm:mt-0">
                <div class="md:grid md:grid-cols-3 md:gap-6">
                    <div class="md:col-span-full">
                        <div class="px-4 sm:px-0">
                            <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
                                Tunnels
                            </h3>
                        </div>
                    </div>
                    <div class="mt-5 md:col-span-full md:mt-0">
                        <ul role="list" class="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                            <li v-for="tunnel in Config.tunnels" class="col-span-1 flex rounded-md shadow-sm">
                                <div
                                    class="flex flex-1 items-center justify-between truncate rounded-md border-t border-r border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800">
                                    <div class="flex-1 truncate px-4 py-2 text-sm">
                                        <span class="font-medium text-gray-900 dark:text-gray-300">{{
                                            tunnel.target }}</span>
                                        <p class="text-gray-600 dark:text-gray-400">
                                            {{ tunnel.hostname ?? "(Pending assignment)" }}
                                        </p>
                                    </div>
                                    <div class="flex-shrink-0 pr-2">
                                        <button type="button"
                                            class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-gray-400 hover:text-gray-500">
                                            <span class="sr-only">Open options</span>
                                            <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <button type="button"
                            class="relative block w-full mt-10 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none">
                            <ServerIcon class="mx-auto h-12 w-12 text-gray-400" />
                            <span class="mt-2 block text-sm font-medium">Add a new tunnel</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>