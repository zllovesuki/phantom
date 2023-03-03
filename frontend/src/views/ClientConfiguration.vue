<script setup lang="ts">
import { SparklesIcon, BoltSlashIcon } from "@heroicons/vue/24/outline";
import StatusBadge from "~/components/utility/StatusBadge.vue";
import SwitchToggle from "~/components/utility/SwitchToggle.vue";
import HorizontalDivider from "~/components/utility/HorizontalDivider.vue";
import ToggleConnectButton from "~/components/tunnel/ToggleConnectButton.vue";

import { ref, onMounted, computed, watch, nextTick } from "vue";
import { storeToRefs } from "pinia";

import {
  GetSpecterConfig,
  GetPhantomConfig,
  UpdateApex,
  UpdatePhantomConfig,
} from "~/wails/go/specter/Application";
import { client, specter } from "~/wails/go/models";
import { useAlertStore } from "~/store/alert";
import { useRuntimeStore } from "~/store/runtime";

const { showAlert } = useAlertStore();

const { ClientConnected, ClientConnecting } = storeToRefs(useRuntimeStore());
const SynchronizingSettings = ref(false);
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

const DisableSettingsModification = computed(() => {
  return (
    ClientConnected.value ||
    ClientConnecting.value ||
    SynchronizingSettings.value
  );
});

async function synchronizeSettings() {
  try {
    SynchronizingSettings.value = true;
    await UpdateApex(SpecterConfig.value.apex);
    await UpdatePhantomConfig(PhantomConfig.value);
  } catch (e) {
    showAlert("fail", `Error saving settings: ${e as string}`);
  } finally {
    setTimeout(() => {
      SynchronizingSettings.value = false;
    }, 500);
  }
}

const _loaded = ref(false);
onMounted(async () => {
  const specterConfig = await GetSpecterConfig();
  if (specterConfig !== null) {
    SpecterConfig.value = specterConfig;
  }
  const phantomCfg = await GetPhantomConfig();
  if (phantomCfg !== null) {
    PhantomConfig.value = phantomCfg;
  }
  nextTick(() => {
    _loaded.value = true;
  });
});

watch(
  [
    () => PhantomConfig.value.specterInsecure,
    () => PhantomConfig.value.connectOnStart,
  ],
  async () => {
    if (!_loaded.value) {
      return;
    }
    await synchronizeSettings();
  }
);
</script>

<template>
  <div class="box">
    <div class="box-wrapper text-gray-900 dark:text-gray-300">
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
                          <ToggleConnectButton
                            :on-before-connect="synchronizeSettings"
                          />
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
                <svg
                  v-show="SynchronizingSettings"
                  aria-hidden="true"
                  role="status"
                  class="ml-2 inline h-4 w-4 animate-spin text-gray-700 dark:text-gray-300"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    class="fill-gray-300 dark:fill-gray-700"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
              </h3>
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
                          :disabled="DisableSettingsModification"
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
                      <SwitchToggle
                        v-model:value="PhantomConfig.specterInsecure"
                        :disabled="DisableSettingsModification"
                        label="Disable TLS Verification"
                        description="Accepts any certificate presented by the gateway and any host name in that certificate when connecting. Should only be used during development."
                      />
                      <SwitchToggle
                        v-model:value="PhantomConfig.connectOnStart"
                        :disabled="SynchronizingSettings"
                        label="Client Autostart"
                        description="Start specter client when Phantom starts"
                      />
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
