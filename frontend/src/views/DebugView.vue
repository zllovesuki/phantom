<script setup lang="ts">
import StatusBadge from "@/components/StatusBadge.vue";
import HorizontalDivider from "@/components/HorizontalDivider.vue";
import SynchronizeButton from "@/components/SynchronizeButton.vue";
import {
    SparklesIcon,
    BoltSlashIcon,
} from "@heroicons/vue/24/outline";

import { ref, onMounted, nextTick } from "vue";
import { GetCurrentConfig, GetPhantomConfig, GetConnectedNodes, Connected } from "@wails/go/specter/Application"
import { client, specter } from "@wails/go/models";
import { GetFilePaths } from "@wails/go/specter/Helper";

const SpecterConfig = ref<client.Config>(client.Config.createFrom({ apex: "" }))
const PhantomConfig = ref<specter.PhantomConfig>({ specterInsecure: false, targetInsecure: false })
const ConnectedNodes = ref<specter.Node[]>([])
const ClientConnected = ref(false)

const FilePaths = ref<specter.Paths>(specter.Paths.createFrom({}))

const LogEntries = ref("")
const logBox = ref<HTMLTextAreaElement | undefined>()

function ns2Ms(ns?: number): string {
    return ((ns ?? 0) / 1000000).toFixed(2) + 'ms'
}

async function loadLogs() {
    try {
        const logResp = await fetch("specter.log")
        if (logResp.status === 200) {
            LogEntries.value = await logResp.text()
        }
        nextTick(() => {
            if (logBox.value) {
                logBox.value.scrollTop = logBox.value.scrollHeight
            }
        })
    } catch (e) {
        console.error(e)
    }
}

onMounted(async () => {
    const specterConfig = await GetCurrentConfig()
    if (specterConfig !== null) {
        SpecterConfig.value = specterConfig
    }
    const phantomCfg = await GetPhantomConfig()
    if (phantomCfg !== null) {
        PhantomConfig.value = phantomCfg
    }
    ConnectedNodes.value = await GetConnectedNodes()
    ClientConnected.value = await Connected()
    FilePaths.value = await GetFilePaths()
    await loadLogs()
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
                                Connected Nodes
                            </h3>
                        </div>
                    </div>
                    <div class="mt-5 md:col-span-2 md:mt-0">
                        <div class="overflow-hidden shadow sm:rounded-md">
                            <div class="bg-white dark:bg-slate-800 px-4 py-5 sm:p-6">
                                <div class="grid grid-cols-6 gap-6">
                                    <div class="col-span-12 sm:col-span-6">
                                        <div class="-my-2 -mx-6 overflow-x-auto lg:-mx-8">
                                            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                                <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col"
                                                                class="whitespace-nowrap pb-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-0">
                                                                Address
                                                            </th>
                                                            <th scope="col"
                                                                class="whitespace-nowrap px-2 pb-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                                rtt.Min/Average/Max
                                                            </th>
                                                            <th scope="col"
                                                                class="whitespace-nowrap px-2 pb-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                                rtt.Sent/Lost
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody class="divide-y divide-gray-200">
                                                        <tr v-for="node in ConnectedNodes" :key="node.id">
                                                            <td
                                                                class="whitespace-nowrap px-2 py-2 pr-3 text-sm text-gray-900 dark:text-gray-300 sm:pl-0">
                                                                {{ node.address }}
                                                            </td>
                                                            <td
                                                                class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 dark:text-gray-300">
                                                                {{ ns2Ms(node.rtt?.min) }}/{{ ns2Ms(node.rtt?.average) }}/{{
                                                                    ns2Ms(node.rtt?.max) }}
                                                            </td>
                                                            <td
                                                                class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 dark:text-gray-300">
                                                                {{ node.rtt?.sent }}/{{ node.rtt?.lost }}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <HorizontalDivider />

            <div class="mt-10 sm:mt-0">
                <div class="md:grid md:grid-cols-3 md:gap-6">
                    <div class="md:col-span-1">
                        <div class="px-4 sm:px-0">
                            <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
                                Specter Configuration
                            </h3>
                            <p class="mt-2 text-xs text-gray-600 dark:text-gray-500">
                                <StatusBadge text="Connected" class="mb-2" :enabled="ClientConnected">
                                    <template #enabled>
                                        <SparklesIcon class="ml-1 w-4 h-4" />
                                    </template>
                                    <template #disabled>
                                        <BoltSlashIcon class="ml-1 w-4 h-4" />
                                    </template>
                                </StatusBadge>
                                <span class="block break-words">
                                    {{ FilePaths.specter }}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div class="mt-5 md:col-span-2 md:mt-0">
                        <div class="overflow-hidden shadow sm:rounded-md sm:rounded-b-none">
                            <div class="bg-white dark:bg-slate-800 px-4 py-5 sm:p-6">
                                <div class="grid grid-cols-6 gap-6">
                                    <div class="col-span-12 sm:col-span-6">
                                        <dl class="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-600">
                                            <div class="pb-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:pb-5">
                                                <dt class="text-sm font-medium text-gray-500 dark:text-gray-200">
                                                    Gateway Apex
                                                </dt>
                                                <dd
                                                    class="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:col-span-2 sm:mt-0">
                                                    {{ SpecterConfig.apex }}
                                                </dd>
                                            </div>
                                            <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                                                <dt class="text-sm font-medium text-gray-500 dark:text-gray-200">
                                                    Client ID
                                                </dt>
                                                <dd
                                                    class="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:col-span-2 sm:mt-0">
                                                    {{ SpecterConfig.clientId }}
                                                </dd>
                                            </div>
                                            <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                                                <dt class="text-sm font-medium text-gray-500 dark:text-gray-200">
                                                    Client Token
                                                </dt>
                                                <dd
                                                    class="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:col-span-2 sm:mt-0">
                                                    {{ SpecterConfig.token }}
                                                </dd>
                                            </div>
                                            <div class="pt-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5">
                                                <dt class="text-sm font-medium text-gray-500 dark:text-gray-200">
                                                    Number of Tunnels
                                                </dt>
                                                <dd
                                                    class="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:col-span-2 sm:mt-0">
                                                    {{ (SpecterConfig.tunnels ?? []).length }}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 dark:bg-slate-700/[0.3] px-4 py-3 text-right sm:px-6">
                            <SynchronizeButton :synchronized="loadLogs" />
                        </div>
                    </div>
                </div>
            </div>

            <HorizontalDivider />

            <div class="mt-10 sm:mt-0">
                <div class="md:grid md:grid-cols-3 md:gap-6">
                    <div class="md:col-span-1">
                        <div class="px-4 sm:px-0">
                            <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
                                Phantom Configuration
                            </h3>
                            <p class="mt-2 text-xs text-gray-600 dark:text-gray-500">
                                <span class="break-words">
                                    {{ FilePaths.phantom }}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div class="mt-5 md:col-span-2 md:mt-0">
                        <div class="overflow-hidden shadow sm:rounded-md">
                            <div class="bg-white dark:bg-slate-800 px-4 py-5 sm:p-6">
                                <div class="grid grid-cols-6 gap-6">
                                    <div class="col-span-12 sm:col-span-6">
                                        <dl class="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-600">
                                            <div class="pb-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:pb-5">
                                                <dt class="text-sm font-medium text-gray-500 dark:text-gray-200">
                                                    client.InsecureVerify
                                                </dt>
                                                <dd
                                                    class="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:col-span-2 sm:mt-0">
                                                    {{ PhantomConfig.specterInsecure }}
                                                </dd>
                                            </div>
                                            <div class="pt-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5">
                                                <dt class="text-sm font-medium text-gray-500 dark:text-gray-200">
                                                    dialer.InsecureVerify
                                                </dt>
                                                <dd
                                                    class="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:col-span-2 sm:mt-0">
                                                    {{ PhantomConfig.targetInsecure }}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <HorizontalDivider />

            <div class="mt-10 sm:mt-0">
                <div class="md:grid md:grid-cols-3 md:gap-6">
                    <div class="md:col-span-full">
                        <div class="px-4 sm:px-0">
                            <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
                                Logs
                            </h3>
                            <p class="mt-2 text-xs text-gray-600 dark:text-gray-500">
                                <span class="break-words">
                                    {{ FilePaths.log }}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div class="mt-5 md:col-span-full md:mt-0">
                        <textarea rows="20" name="logs" id="logs" v-model="LogEntries" ref="logBox" readonly
                            class="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-white dark:scrollbar-thumb-slate-700 dark:scrollbar-track-slate-800 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm dark:bg-slate-800 focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 text-xs" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>