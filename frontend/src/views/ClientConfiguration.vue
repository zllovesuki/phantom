<script setup lang="ts">
import StatusBadge from "~/components/StatusBadge.vue";
import AlertSection from "~/components/AlertSection.vue";
import type { AlertLevel } from "~/components/AlertSection.vue";
import HorizontalDivider from "~/components/HorizontalDivider.vue";
import { SparklesIcon, BoltSlashIcon } from "@heroicons/vue/24/outline";

import { ref, onMounted, computed } from "vue";
import {
  Connected,
  GetCurrentConfig,
  GetPhantomConfig,
  StartClient,
  StopClient,
  UpdateApex,
  UpdatePhantomConfig,
} from "~/wails/go/specter/Application";
import { client, specter } from "~/wails/go/models";

interface Alert {
  message: string;
  level: AlertLevel;
  show: boolean;
}

const ClientConnected = ref(false);
const SpecterConfig = ref<client.Config>(
  client.Config.createFrom({ apex: "" })
);
const PhantomConfig = ref<specter.PhantomConfig>({
  specterInsecure: false,
  targetInsecure: false,
});
const AlertMessage = ref<Alert>({ message: "", level: "fail", show: false });
const ChangingClientState = ref(false);
const ChangingSettings = ref(false);

const disableSettingsModification = computed(() => {
  return (
    ClientConnected.value || ChangingClientState.value || ChangingSettings.value
  );
});

onMounted(async () => {
  const specterConfig = await GetCurrentConfig();
  if (specterConfig !== null) {
    SpecterConfig.value = specterConfig;
  }
  const phantomCfg = await GetPhantomConfig();
  if (phantomCfg !== null) {
    PhantomConfig.value = phantomCfg;
  }
  ClientConnected.value = await Connected();
});

async function synchronizeSettings() {
  if (ChangingSettings.value) {
    return;
  }
  ChangingSettings.value = true;
  await UpdateApex(SpecterConfig.value.apex);
  await UpdatePhantomConfig(PhantomConfig.value);
  setTimeout(() => {
    ChangingSettings.value = false;
  }, 500);
}

async function toggleClientState() {
  if (ChangingClientState.value) {
    return;
  }
  try {
    ChangingClientState.value = true;
    AlertMessage.value.show = false;
    if (ClientConnected.value) {
      await StopClient();
      ClientConnected.value = false;
    } else {
      await StartClient();
      ClientConnected.value = true;
    }
  } catch (e) {
    AlertMessage.value.message = e as string;
    AlertMessage.value.show = true;
  } finally {
    ChangingClientState.value = false;
  }
}
</script>

<template>
  <div class="box">
    <div class="box-wrapper text-gray-900 dark:text-gray-300">
      <AlertSection
        v-show="AlertMessage.show"
        class="mb-10"
        :message="AlertMessage.message"
        :level="AlertMessage.level"
        :on-dismiss="() => (AlertMessage.show = false)"
      />

      <div>
        <div class="md:grid md:grid-cols-4 md:gap-6">
          <div class="md:col-span-1">
            <div class="px-4 sm:px-0">
              <h3
                class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300"
              >
                Client Status
              </h3>
              <p class="mt-2 text-xs text-gray-600">
                <StatusBadge text="Connected" :enabled="ClientConnected">
                  <template #enabled>
                    <SparklesIcon class="ml-1 h-4 w-4" />
                  </template>
                  <template #disabled>
                    <BoltSlashIcon class="ml-1 h-4 w-4" />
                  </template>
                </StatusBadge>
              </p>
            </div>
          </div>
          <div class="mt-5 md:col-span-3 md:mt-0">
            <form>
              <div class="overflow-hidden shadow sm:rounded-md">
                <div class="bg-white px-4 py-5 dark:bg-slate-800 sm:p-6">
                  <div class="grid grid-cols-6 gap-6">
                    <div class="col-span-12 sm:col-span-6">
                      <span
                        class="inline-block text-sm text-gray-700 dark:text-gray-300"
                      >
                        <div class="flex space-x-3">
                          <button
                            type="button"
                            :disabled="ChangingClientState"
                            :class="[
                              ChangingClientState
                                ? 'cursor-not-allowed'
                                : 'cursor-pointer',
                              ChangingClientState
                                ? 'bg-gray-100 text-black dark:bg-gray-700 dark:text-white'
                                : ClientConnected
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700',
                              'inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
                            ]"
                            @click="toggleClientState"
                          >
                            {{
                              ChangingClientState
                                ? "Working..."
                                : ClientConnected
                                ? "Disconnect"
                                : "Connect"
                            }}
                            <svg
                              v-show="ChangingClientState"
                              aria-hidden="true"
                              role="status"
                              class="ml-3 inline h-4 w-4 animate-spin text-gray-600"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="#E5E7EB"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        </div>
                      </span>
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
        <div class="md:grid md:grid-cols-4 md:gap-6">
          <div class="md:col-span-1">
            <div class="px-4 sm:px-0">
              <h3
                class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300"
              >
                Client Configuration
              </h3>
              <p class="mt-2 text-sm text-gray-600"></p>
            </div>
          </div>

          <div class="mt-5 md:col-span-3 md:mt-0">
            <form @submit.prevent="synchronizeSettings">
              <div class="shadow sm:overflow-hidden sm:rounded-md">
                <div
                  class="space-y-6 bg-white px-4 py-5 dark:bg-slate-800 sm:p-6"
                >
                  <div class="grid grid-cols-3 gap-6">
                    <div class="col-span-3 sm:col-span-2">
                      <label
                        for="specter-apex"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Specter Gateway
                      </label>
                      <div class="mt-1 flex rounded-md shadow-sm">
                        <span
                          class="inline-flex items-center rounded-l-md border border-r-0 border-gray-200 bg-gray-100 px-3 text-sm text-black dark:border-gray-700 dark:bg-slate-700 dark:text-white"
                          >https://</span
                        >
                        <input
                          id="specter-apex"
                          v-model="SpecterConfig.apex"
                          type="text"
                          name="specter-apex"
                          :disabled="disableSettingsModification"
                          class="block w-full flex-1 rounded-none rounded-r-md border-gray-200 bg-transparent text-black placeholder-gray-600 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:text-gray-400 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:disabled:text-gray-400 sm:text-sm"
                          placeholder="specter.im:443"
                        />
                      </div>
                      <p
                        id="helper-text-explanation"
                        class="mt-2 text-xs text-gray-500 dark:text-gray-400"
                      >
                        Changing to a different specter gateway may require a
                        reset.
                      </p>
                    </div>
                  </div>
                  <fieldset>
                    <legend class="sr-only">Options</legend>
                    <label
                      for="specter-apex"
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Options
                    </label>
                    <div class="mt-4 space-y-4">
                      <div class="flex items-start">
                        <div class="flex h-5 items-center">
                          <input
                            id="target-tls"
                            v-model="PhantomConfig.specterInsecure"
                            name="target-tls"
                            type="checkbox"
                            :disabled="disableSettingsModification"
                            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-gray-300 dark:border-gray-600 dark:disabled:bg-gray-600"
                          />
                        </div>
                        <div class="ml-3 text-sm">
                          <label
                            for="target-tls"
                            class="font-medium text-gray-700 dark:text-gray-300"
                          >
                            Disable Client TLS
                          </label>
                          <p class="text-xs text-gray-500 dark:text-gray-400">
                            Disable TLS verification when dialing to specter
                            gateway. Should only be used during development.
                          </p>
                        </div>
                      </div>
                      <div class="flex items-start">
                        <div class="flex h-5 items-center">
                          <input
                            id="target-tls"
                            v-model="PhantomConfig.targetInsecure"
                            name="target-tls"
                            type="checkbox"
                            :disabled="disableSettingsModification"
                            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-gray-300 dark:border-gray-600 dark:disabled:bg-gray-600"
                          />
                        </div>
                        <div class="ml-3 text-sm">
                          <label
                            for="target-tls"
                            class="font-medium text-gray-700 dark:text-gray-300"
                          >
                            Disable Target TLS
                          </label>
                          <p class="text-xs text-gray-500 dark:text-gray-400">
                            Disable TLS verification when dialing to https
                            target.
                          </p>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div
                  class="bg-gray-50 px-4 py-3 text-right dark:bg-slate-700/[0.3] sm:px-6"
                >
                  <button
                    type="submit"
                    :disabled="disableSettingsModification"
                    :class="[
                      disableSettingsModification
                        ? 'cursor-not-allowed'
                        : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
                      'inline-flex items-center rounded-md border bg-white py-2 px-4 text-sm font-medium text-black shadow-sm focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:disabled:text-gray-400',
                    ]"
                  >
                    <svg
                      v-show="ChangingSettings"
                      aria-hidden="true"
                      role="status"
                      class="mr-3 inline h-4 w-4 animate-spin text-gray-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="#E5E7EB"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentColor"
                      />
                    </svg>
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
