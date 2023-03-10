<script setup lang="ts">
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/20/solid";

import { ref, computed, watch } from "vue";

export interface LogMessage {
  Index: number;
  Timestamp: Date;
  Level: string;
  Caller: string;
  Message: string;
  Error?: string;
  Stacktrace?: string;
  Tags: Record<string, unknown>;
}

const props = defineProps<{
  raw: string[];
}>();

const modals = ref<boolean[]>([]);
const desc = ref(true);

const parsedLogs = computed<LogMessage[]>(() => {
  return props.raw
    .map((l) => JSON.parse(l))
    .map((p, i) => {
      const log: LogMessage = {
        Index: i,
        Timestamp: new Date(),
        Level: "info",
        Caller: "",
        Message: "",
        Tags: {},
      };
      for (const [key, value] of Object.entries(p)) {
        switch (key) {
          case "ts":
            log.Timestamp = new Date((value as number) * 1000);
            break;
          case "caller":
            log.Caller = value as string;
            break;
          case "error":
            log.Error = value as string;
            break;
          case "stacktrace":
            log.Stacktrace = value as string;
            break;
          case "msg":
            log.Message = value as string;
            break;
          case "level":
            log.Level = value as string;
            break;
          default:
            log.Tags[key] = value;
        }
      }
      return log;
    });
});

const logs = computed<LogMessage[]>(() => {
  if (desc.value) {
    return parsedLogs.value.slice().reverse();
  } else {
    return parsedLogs.value;
  }
});

const sortIcon = computed(() => {
  return desc.value ? ChevronDownIcon : ChevronUpIcon;
});

watch(logs, (n) => {
  for (const log of n) {
    modals.value[log.Index] = !!modals.value[log.Index] ?? false;
  }
});

function textColorClass(level: string): string[] {
  switch (level) {
    case "error":
      return ["text-red-500", "dark:text-red-400"];
    case "warn":
      return ["text-yellow-500", "dark:text-yellow-400"];
    case "info":
      return ["text-blue-500", "dark:text-blue-400"];
    case "debug":
      return ["text-cyan-300", "dark:text-cyan-400"];
    default:
      return ["text-gray-900", "dark:text-gray-300"];
  }
}
</script>

<template>
  <div class="-my-6 -mx-6 lg:-mx-8">
    <div class="inline-block min-w-full py-2 align-middle sm:px-4 lg:px-6">
      <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
        <thead>
          <tr>
            <th
              scope="col"
              class="sticky top-0 z-10 whitespace-nowrap bg-gray-50/75 py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 dark:bg-slate-800/50 dark:text-gray-200 sm:pl-0"
            >
              <a
                class="group inline-flex cursor-pointer"
                @click.prevent="desc = !desc"
              >
                Timestamp
                <span
                  class="invisible ml-2 flex-none rounded group-hover:visible group-focus:visible"
                >
                  <sortIcon class="h-5 w-5" aria-hidden="true" />
                </span>
              </a>
            </th>
            <th
              scope="col"
              class="sticky top-0 z-10 hidden whitespace-nowrap bg-gray-50/75 px-2 py-3.5 text-left text-sm font-semibold text-gray-900 dark:bg-slate-800/50 dark:text-gray-200 md:table-cell"
            >
              Level
            </th>
            <th
              scope="col"
              class="sticky top-0 z-10 whitespace-nowrap bg-gray-50/75 px-2 py-3.5 text-left text-sm font-semibold text-gray-900 dark:bg-slate-800/50 dark:text-gray-200"
            >
              Message
            </th>
            <th
              scope="col"
              class="sticky top-0 z-10 whitespace-nowrap bg-gray-50/75 py-3.5 pl-3 pr-6 text-left text-sm font-semibold text-gray-900 dark:bg-slate-800/50 dark:text-gray-200 sm:pr-0"
            >
              Error
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <template v-for="log in logs" :key="log.Index">
            <tr @click="modals[log.Index] = !modals[log.Index]">
              <td
                class="whitespace-nowrap px-2 pl-6 pr-3 text-xs text-black dark:text-gray-300 sm:pl-0"
              >
                {{ log.Timestamp.toLocaleString() }}
              </td>
              <td
                :class="[
                  ...textColorClass(log.Level),
                  'hidden whitespace-nowrap px-2 py-2 text-xs md:table-cell',
                ]"
              >
                {{ log.Level }}
              </td>
              <td class="px-2 py-2 text-xs text-black dark:text-gray-300">
                {{ log.Message }}
              </td>
              <td
                class="py-2 pl-3 pr-6 text-xs text-black dark:text-gray-300 sm:pr-0"
              >
                {{ log.Error ?? "" }}
              </td>
            </tr>
            <tr v-show="modals[log.Index]">
              <td colspan="4">
                <div
                  class="overflow-hidden border border-gray-200 bg-gray-100/90 dark:border-gray-600 dark:bg-slate-700/20"
                >
                  <div class="px-4 py-5 sm:px-6">
                    <dl
                      class="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-600"
                    >
                      <div class="pb-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:pb-3">
                        <dt
                          class="text-xs font-semibold text-black dark:text-gray-200"
                        >
                          Timestamp
                        </dt>
                        <dd
                          class="mt-1 text-xs text-black dark:text-gray-300 sm:col-span-3 sm:mt-0"
                        >
                          {{ log.Timestamp.toLocaleString() }}
                        </dd>
                      </div>
                      <div class="py-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:py-3">
                        <dt
                          class="text-xs font-semibold text-black dark:text-gray-200"
                        >
                          Caller
                        </dt>
                        <dd
                          class="mt-1 text-xs text-black dark:text-gray-300 sm:col-span-3 sm:mt-0"
                        >
                          {{ log.Caller }}
                        </dd>
                      </div>
                      <div class="py-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:py-3">
                        <dt
                          class="text-xs font-semibold text-black dark:text-gray-200"
                        >
                          Message
                        </dt>
                        <dd
                          class="mt-1 text-xs text-black dark:text-gray-300 sm:col-span-3 sm:mt-0"
                        >
                          {{ log.Message }}
                        </dd>
                      </div>
                      <div
                        v-if="log.Error"
                        class="py-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:py-3"
                      >
                        <dt
                          class="text-xs font-semibold text-black dark:text-gray-200"
                        >
                          Error
                        </dt>
                        <dd
                          class="mt-1 text-xs text-black dark:text-gray-300 sm:col-span-3 sm:mt-0"
                        >
                          {{ log.Error }}
                        </dd>
                      </div>
                      <div
                        v-if="log.Stacktrace"
                        class="py-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:py-3"
                      >
                        <dt
                          class="text-xs font-semibold text-black dark:text-gray-200"
                        >
                          Stacktrace
                        </dt>
                        <dd
                          class="mt-1 whitespace-pre text-xs text-black dark:text-gray-300 sm:col-span-3 sm:mt-0"
                        >
                          {{ log.Stacktrace }}
                        </dd>
                      </div>
                      <div
                        v-for="(entry, tagIndex) in Object.entries(log.Tags)"
                        :key="entry[0]"
                        :class="[
                          tagIndex === Object.entries(log.Tags).length - 1
                            ? 'pt-2 sm:pt-3'
                            : 'py-2 sm:py-3',
                          'sm:grid sm:grid-cols-4 sm:gap-4',
                        ]"
                      >
                        <dt
                          class="text-xs font-normal text-gray-800 dark:text-gray-200"
                        >
                          tag.{{ entry[0] }}
                        </dt>
                        <dd
                          class="mt-1 text-xs text-black dark:text-gray-300 sm:col-span-3 sm:mt-0"
                        >
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
    </div>
  </div>
</template>
