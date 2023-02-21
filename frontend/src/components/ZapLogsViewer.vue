<script setup lang="ts">
import { ArrowsPointingOutIcon } from "@heroicons/vue/24/outline";

import { ref, computed, watch } from 'vue';

export interface LogMessage {
    Index: number,
    Timestamp: Date
    Level: string
    Caller: string,
    Message: string
    Error?: string,
    Stacktrace?: string,
    Tags: Record<string, any>,
}

const props = defineProps<{
    raw: string[],
}>();

const logs = computed<LogMessage[]>(() => {
    return props.raw
        .map(l => JSON.parse(l))
        .map((p, i) => {
            const log: LogMessage = {
                Index: i,
                Timestamp: new Date(),
                Level: 'info',
                Caller: '',
                Message: '',
                Tags: {},
            }
            for (const [key, value] of Object.entries(p)) {
                switch (key) {
                    case 'ts':
                        log.Timestamp = new Date(value as number * 1000)
                        break
                    case 'caller':
                        log.Caller = value as string
                        break
                    case 'error':
                        log.Error = value as string
                        break;
                    case 'stacktrace':
                        log.Stacktrace = value as string
                        break
                    case 'msg':
                        log.Message = value as string
                        break;
                    case 'level':
                        log.Level = value as string
                        break;
                    default:
                        log.Tags[key] = value
                }
            }
            return log
        })
})

const modals = ref<boolean[]>([])

watch(logs, (n, o) => {
    for (const log of n) {
        modals.value[log.Index] = !!modals.value[log.Index] ?? false
    }
})

function textColorClasss(level: string): string[] {
    switch (level) {
        case "error":
            return ["text-red-500", "dark:text-red-400"];
        case "warn":
            return ["text-yellow-500", "dark:text-yellow-400"];
        case "info":
            return ["text-blue-500", "dark:text-blue-400"];
        default:
            return ["text-gray-900", "dark:text-gray-300"];
    }
}
</script>

<template>
    <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
        <thead>
            <tr>
                <th scope="col"
                    class="whitespace-nowrap pb-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-0">
                    Timestamp
                </th>
                <th scope="col"
                    class="whitespace-nowrap px-2 pb-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                    Level
                </th>
                <th scope="col"
                    class="whitespace-nowrap px-2 pb-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                    Message
                </th>
                <th scope="col"
                    class="whitespace-nowrap px-2 pb-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                    Error
                </th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <template v-for="(log, index) in logs" :key="index">
                <tr @click="modals[log.Index] = !modals[log.Index]">
                    <td class="whitespace-nowrap px-2 py-2 pr-3 text-xs text-gray-900 dark:text-gray-300 sm:pl-0">
                        {{ log.Timestamp.toLocaleString() }}
                    </td>
                    <td :class="[...textColorClasss(log.Level), 'whitespace-nowrap px-2 py-2 text-xs']">
                        {{ log.Level }}
                    </td>
                    <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-300">
                        {{ log.Message }}
                    </td>
                    <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-300">
                        {{ log.Error ?? '' }}
                    </td>
                </tr>
                <tr v-show="modals[log.Index]">
                    <td colspan="4">
                        <div
                            class="overflow-hidden dark:bg-slate-700/20 bg-gray-200/20 border border-gray-200 dark:border-gray-600">
                            <div class="px-4 py-5 sm:px-6">
                                <dl class="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-600">
                                    <div class="pb-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:pb-3">
                                        <dt class="text-xs font-medium text-gray-500 dark:text-gray-200">
                                            Timestamp
                                        </dt>
                                        <dd class="mt-1 text-xs text-gray-900 dark:text-gray-300 sm:col-span-3 sm:mt-0">
                                            {{ log.Timestamp.toLocaleString() }}
                                        </dd>
                                    </div>
                                    <div class="py-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:py-3">
                                        <dt class="text-xs font-medium text-gray-500 dark:text-gray-200">
                                            Caller
                                        </dt>
                                        <dd class="mt-1 text-xs text-gray-900 dark:text-gray-300 sm:col-span-3 sm:mt-0">
                                            {{ log.Caller }}
                                        </dd>
                                    </div>
                                    <div class="py-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:py-3">
                                        <dt class="text-xs font-medium text-gray-500 dark:text-gray-200">
                                            Message
                                        </dt>
                                        <dd class="mt-1 text-xs text-gray-900 dark:text-gray-300 sm:col-span-3 sm:mt-0">
                                            {{ log.Message }}
                                        </dd>
                                    </div>
                                    <div class="py-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:py-3" v-if="log.Error">
                                        <dt class="text-xs font-medium text-gray-500 dark:text-gray-200">
                                            Error
                                        </dt>
                                        <dd class="mt-1 text-xs text-gray-900 dark:text-gray-300 sm:col-span-3 sm:mt-0">
                                            {{ log.Error }}
                                        </dd>
                                    </div>
                                    <div class="py-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:py-3" v-if="log.Stacktrace">
                                        <dt class="text-xs font-medium text-gray-500 dark:text-gray-200">
                                            Stacktrace
                                        </dt>
                                        <dd
                                            class="mt-1 text-xs text-gray-900 dark:text-gray-300 sm:col-span-3 sm:mt-0 whitespace-pre">
                                            {{ log.Stacktrace }}
                                        </dd>
                                    </div>
                                    <div v-for="(entry, index) in Object.entries(log.Tags)"
                                        :class="[index === Object.entries(log.Tags).length - 1 ? 'pt-2 sm:pt-3' : 'py-2 sm:py-3', 'sm:grid sm:grid-cols-4 sm:gap-4']">
                                        <dt class="text-xs font-medium text-gray-500 dark:text-gray-200">
                                            tag.{{ entry[0] }}
                                        </dt>
                                        <dd class="mt-1 text-xs text-gray-900 dark:text-gray-300 sm:col-span-3 sm:mt-0">
                                            {{ entry[1] }}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
</template>