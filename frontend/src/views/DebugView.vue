<script setup lang="ts">
import { SparklesIcon, BoltSlashIcon } from "@heroicons/vue/24/outline";
import DescriptionList, {
  type Item,
} from "~/components/viewport/DescriptionList.vue";
import ZapLogsViewer from "~/components/viewport/ZapLogsViewer.vue";
import ResponsiveRow from "~/components/viewport/ResponsiveRow.vue";
import SynchronizeButton from "~/components/tunnel/SynchronizeButton.vue";
import StatusBadge from "~/components/utility/StatusBadge.vue";

import { ref, computed, onMounted } from "vue";
import {
  GetSpecterConfig,
  GetPhantomConfig,
  GetConnectedTunnelNodes,
  GetConnectedForwarderNodes,
} from "~/wails/go/specter/Application";
import { client, specter } from "~/wails/go/models";
import { GetFilePaths } from "~/wails/go/specter/Helper";
import { useRuntimeStore } from "~/store/runtime";

const runtime = useRuntimeStore();

const ConnectedTunnelNodes = ref<specter.TunnelNode[]>([]);
const ConnectedForwarderNodes = ref<specter.ForwarderNode[]>([]);
const FilePaths = ref<specter.Paths>(specter.Paths.createFrom({}));
const LogEntries = ref<string[]>([]);
const SpecterConfig = ref<client.Config>(
  client.Config.createFrom({ apex: "" })
);
const PhantomConfig = ref<specter.PhantomConfig>(
  specter.PhantomConfig.createFrom({
    listeners: [],
    listenOnStart: false,
    specterInsecure: false,
    connectOnStart: false,
  })
);

const specterConfigEntries = computed<Item[]>(() => {
  return [
    {
      Key: "Gateway Apex",
      Value: SpecterConfig.value.apex,
    },
    {
      Key: "Client ID",
      Value: (SpecterConfig.value.clientId ?? "").toString(),
    },
    {
      Key: "Client Token",
      Value: SpecterConfig.value.token,
      ClickToShow: true,
    },
    {
      Key: "Number of Tunnels",
      Value: (SpecterConfig.value.tunnels ?? []).length.toString(),
    },
  ];
});

const phantomConfigEntries = computed<Item[]>(() => {
  return [
    {
      Key: "Build Type",
      Value: runtime.environment?.buildType,
    },
    {
      Key: "Disable Specter TLS",
      Value: PhantomConfig.value.specterInsecure.toString(),
    },
    {
      Key: "Specter Autostart",
      Value: PhantomConfig.value.connectOnStart.toString(),
    },
    {
      Key: "Forwarders Autostart",
      Value: PhantomConfig.value.listenOnStart.toString(),
    },
    {
      Key: "Number of Forwarders",
      Value: PhantomConfig.value.listeners.length.toString(),
    },
  ];
});

function ns2Ms(ns?: number): string {
  return ((ns ?? 0) / 1000000).toFixed(2) + "ms";
}

async function loadLogs() {
  try {
    const logResp = await fetch("specter.log");
    if (logResp.status === 200) {
      const raw = await logResp.text();
      LogEntries.value = raw.split(/\r?\n/).filter((l) => l.length > 0);
    }
  } catch (e) {
    console.error(e);
  }
}

onMounted(async () => {
  [ConnectedTunnelNodes.value, ConnectedForwarderNodes.value, FilePaths.value] =
    await Promise.all([
      GetConnectedTunnelNodes(),
      GetConnectedForwarderNodes(),
      GetFilePaths(),
      loadLogs(),
    ]);
  const [specterConfig, phantomCfg] = await Promise.all([
    GetSpecterConfig(),
    GetPhantomConfig(),
  ]);
  if (specterConfig !== null) {
    SpecterConfig.value = specterConfig;
  }
  if (phantomCfg !== null) {
    if (!phantomCfg.listeners) {
      phantomCfg.listeners = [];
    }
    PhantomConfig.value = phantomCfg;
  }
});
</script>

<template>
  <div class="box">
    <div class="box-wrapper text-gray-900 dark:text-gray-300">
      <ResponsiveRow first>
        <template #heading>
          <h3
            class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300"
          >
            Tunnel Nodes
          </h3>
          <p class="mt-2 text-xs text-gray-600 dark:text-gray-500">
            <StatusBadge
              :text="
                [
                  ConnectedTunnelNodes.length > 0 ? 'Has' : 'No',
                  'Alive Nodes',
                ].join(' ')
              "
              class="mb-2"
              :enabled="ConnectedTunnelNodes.length > 0"
            >
              <template #enabled>
                <SparklesIcon class="ml-1 h-4 w-4" />
              </template>
              <template #disabled>
                <BoltSlashIcon class="ml-1 h-4 w-4" />
              </template>
            </StatusBadge>
          </p>
        </template>
        <template #content>
          <div class="overflow-hidden shadow sm:rounded-md">
            <div class="bg-gray-50 px-4 py-5 dark:bg-slate-800/50 sm:p-6">
              <div class="grid grid-cols-6 gap-6">
                <div class="col-span-12 sm:col-span-6">
                  <div
                    class="-my-2 -mx-6 overflow-x-auto scrollbar-thin scrollbar-track-white scrollbar-thumb-gray-700 dark:scrollbar-track-slate-800 dark:scrollbar-thumb-slate-700 lg:-mx-8"
                  >
                    <div
                      class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"
                    >
                      <table
                        class="min-w-full divide-y divide-gray-300 dark:divide-gray-600"
                      >
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              class="whitespace-nowrap pb-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 sm:pl-0"
                            >
                              Address
                            </th>
                            <th
                              scope="col"
                              class="whitespace-nowrap px-2 pb-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200"
                            >
                              rtt.Min/Average/Max
                            </th>
                            <th
                              scope="col"
                              class="whitespace-nowrap pl-3 pr-6 pb-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 sm:pr-0"
                            >
                              rtt.Sent/Lost
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          class="divide-y divide-gray-200 dark:divide-gray-700"
                        >
                          <tr
                            v-for="node in ConnectedTunnelNodes"
                            :key="node.id"
                          >
                            <td
                              class="whitespace-nowrap py-2 pl-6 pr-3 text-sm text-gray-900 dark:text-gray-300 sm:pl-0"
                            >
                              {{ node.address }}
                            </td>
                            <td
                              class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 dark:text-gray-300"
                            >
                              {{ ns2Ms(node.rtt?.min) }}/{{
                                ns2Ms(node.rtt?.average)
                              }}/{{ ns2Ms(node.rtt?.max) }}
                            </td>
                            <td
                              class="whitespace-nowrap py-2 pl-3 pr-6 text-sm text-gray-900 dark:text-gray-300 sm:pr-0"
                            >
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
        </template>
      </ResponsiveRow>

      <ResponsiveRow>
        <template #heading>
          <h3
            class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300"
          >
            Specter Configuration
          </h3>
          <p class="mt-2 text-xs text-gray-600 dark:text-gray-500">
            <span class="block break-words">
              {{ FilePaths.specter }}
            </span>
          </p>
        </template>
        <template #content>
          <div class="overflow-hidden shadow sm:rounded-md sm:rounded-b-none">
            <div class="bg-gray-50 px-5 py-2 dark:bg-slate-800/50 sm:px-6">
              <div class="grid grid-cols-6 gap-6">
                <div class="col-span-12 sm:col-span-6">
                  <DescriptionList :items="specterConfigEntries" />
                </div>
              </div>
            </div>
          </div>
          <div
            class="bg-gray-100 px-4 py-3 text-right shadow dark:bg-slate-800/[0.7] sm:rounded-md sm:rounded-t-none sm:px-6"
          >
            <SynchronizeButton @synchronized="loadLogs" />
          </div>
        </template>
      </ResponsiveRow>

      <ResponsiveRow>
        <template #heading>
          <h3
            class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300"
          >
            Forwarder Nodes
          </h3>
          <p class="mt-2 text-xs text-gray-600 dark:text-gray-500">
            <StatusBadge
              :text="
                [
                  ConnectedForwarderNodes.length > 0 ? 'Has' : 'No',
                  'Listeners',
                ].join(' ')
              "
              class="mb-2"
              :enabled="ConnectedForwarderNodes.length > 0"
            >
              <template #enabled>
                <SparklesIcon class="ml-1 h-4 w-4" />
              </template>
              <template #disabled>
                <BoltSlashIcon class="ml-1 h-4 w-4" />
              </template>
            </StatusBadge>
          </p>
        </template>
        <template #content>
          <div class="overflow-hidden shadow sm:rounded-md">
            <div class="bg-gray-50 px-4 py-5 dark:bg-slate-800/50 sm:p-6">
              <div class="grid grid-cols-6 gap-6">
                <div class="col-span-12 sm:col-span-6">
                  <div class="-my-2 -mx-6 overflow-x-auto lg:-mx-8">
                    <div
                      class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"
                    >
                      <table
                        class="min-w-full divide-y divide-gray-300 dark:divide-gray-600"
                      >
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              class="whitespace-nowrap pb-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 sm:pl-0"
                            >
                              Label
                            </th>
                            <th
                              scope="col"
                              class="whitespace-nowrap pl-3 pr-6 pb-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 sm:pr-0"
                            >
                              Via
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          class="divide-y divide-gray-200 dark:divide-gray-700"
                        >
                          <tr
                            v-for="node in ConnectedForwarderNodes"
                            :key="node.label"
                          >
                            <td
                              class="whitespace-nowrap py-2 pl-6 pr-3 text-sm text-gray-900 dark:text-gray-300 sm:pl-0"
                            >
                              {{ node.label }}
                            </td>
                            <td
                              class="whitespace-nowrap py-2 pl-3 pr-6 text-sm text-gray-900 dark:text-gray-300 sm:pr-0"
                            >
                              {{ node.via }}
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
        </template>
      </ResponsiveRow>

      <ResponsiveRow>
        <template #heading>
          <h3
            class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300"
          >
            Phantom Configuration
          </h3>
          <p class="mt-2 text-xs text-gray-600 dark:text-gray-500">
            <span class="break-words">
              {{ FilePaths.phantom }}
            </span>
          </p>
        </template>
        <template #content>
          <div class="overflow-hidden shadow sm:rounded-md">
            <div class="bg-gray-50 px-5 py-2 dark:bg-slate-800/50 sm:px-6">
              <div class="grid grid-cols-6 gap-6">
                <div class="col-span-12 sm:col-span-6">
                  <DescriptionList :items="phantomConfigEntries" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </ResponsiveRow>

      <ResponsiveRow full>
        <template #heading>
          <h3
            class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300"
          >
            Logs
          </h3>
          <p class="mt-2 text-xs text-gray-600 dark:text-gray-500">
            <span class="break-words">
              {{ FilePaths.log }}
            </span>
          </p>
        </template>
        <template #content>
          <div class="md:grid md:grid-cols-4">
            <div class="md:col-span-full">
              <div class="px-4 sm:px-0"></div>
            </div>
            <div class="mt-5 md:col-span-full md:mt-0">
              <div
                class="mr-3 max-h-128 overflow-y-scroll shadow overflow-x-hidden scrollbar-thin scrollbar-track-white scrollbar-thumb-gray-700 dark:scrollbar-track-slate-800 dark:scrollbar-thumb-slate-700 sm:mr-0 sm:rounded-md"
              >
                <div class="bg-gray-50 px-4 py-5 dark:bg-slate-800/50 sm:p-6">
                  <div class="grid grid-cols-6 gap-6">
                    <div class="col-span-12 flow-root sm:col-span-6">
                      <ZapLogsViewer :raw="LogEntries" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </ResponsiveRow>
    </div>
  </div>
</template>
