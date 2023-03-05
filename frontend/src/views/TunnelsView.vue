<script setup lang="ts">
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@miragespace/headlessui-vue";
import {
  ServerIcon,
  SparklesIcon,
  BoltSlashIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import ResponsiveRow from "~/components/viewport/ResponsiveRow.vue";
import SwitchToggle from "~/components/viewport/SwitchToggle.vue";
import TunnelCard from "~/components/tunnel/TunnelCard.vue";
import TunnelModal from "~/components/tunnel/TunnelModal.vue";
import ToggleConnectButton from "~/components/tunnel/ToggleConnectButton.vue";
import NewEntryCard from "~/components/utility/NewEntryCard";
import StatusBadge from "~/components/utility/StatusBadge.vue";

import { storeToRefs } from "pinia";
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from "vue";

import {
  GetSpecterConfig,
  GetPhantomConfig,
  RebuildTunnels,
  UnpublishTunnel,
  ReleaseTunnel,
  Synchronize,
  UpdateApex,
  UpdatePhantomConfig,
} from "~/wails/go/phantom/Application";
import { ValidateTarget } from "~/wails/go/phantom/Helper";
import { client, phantom } from "~/wails/go/models";
import { useAlertStore } from "~/store/alert";
import { useLoadingStore } from "~/store/loading";
import { useRuntimeStore } from "~/store/runtime";
import broker from "~/events";

const loadingStore = useLoadingStore();
const runtimeStore = useRuntimeStore();
const { showAlert } = useAlertStore();
const { setLoading } = loadingStore;
const { loading: Loading } = storeToRefs(loadingStore);
const { ClientConnected, ClientConnecting } = storeToRefs(runtimeStore);

const SynchronizingSettings = ref(false);
const NewTunnelModalOpen = ref(false);
const Tunnels = ref<client.Tunnel[]>([]);
const SpecterConfig = ref<client.Config>(
  client.Config.createFrom({ apex: "" })
);
const PhantomConfig = ref<phantom.PhantomConfig>(
  phantom.PhantomConfig.createFrom({
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

async function tunnelFnWrapper(
  callFn: () => Promise<void>,
  format: (e: unknown) => string
) {
  try {
    setLoading(true);
    await callFn();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await reloadConfig();
  } catch (e) {
    showAlert("fail", format(e));
  } finally {
    setLoading(false);
  }
}

async function appendNewTunnel(t: client.Tunnel) {
  await tunnelFnWrapper(
    async () => {
      await ValidateTarget(t.target);
      const updated = [...Tunnels.value, t];
      await RebuildTunnels(updated);
      await Synchronize();
    },
    (e: unknown) => `Error adding tunnel: ${e as string}`
  );
}

async function unpublishTunnel(i: number) {
  await tunnelFnWrapper(
    () => UnpublishTunnel(i),
    (e: unknown) => `Error unpublishing tunnel: ${e as string}`
  );
}

async function releaseTunnel(i: number) {
  await tunnelFnWrapper(
    () => ReleaseTunnel(i),
    (e: unknown) => `Error releasing tunnel: ${e as string}`
  );
}

async function updateTunnel(i: number, t: client.Tunnel) {
  await tunnelFnWrapper(
    async () => {
      const update = [...Tunnels.value];
      update[i] = {
        ...update[i],
        target: t.target,
        insecure: t.insecure,
      };
      await RebuildTunnels(update);
    },
    (e: unknown) => `Error updating tunnel: ${e as string}`
  );
}

async function synchronizeSettings() {
  if (SynchronizingSettings.value) {
    return;
  }
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

async function reloadConfig() {
  const [specterConfig, phantomCfg] = await Promise.all([
    GetSpecterConfig(),
    GetPhantomConfig(),
  ]);
  if (specterConfig !== null) {
    SpecterConfig.value = specterConfig;
    if (specterConfig.tunnels) {
      Tunnels.value = specterConfig.tunnels;
    }
  }
  if (phantomCfg !== null) {
    PhantomConfig.value = phantomCfg;
  }
}

const _loaded = ref(false);
onMounted(async () => {
  await reloadConfig();
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
    if (!_loaded.value || Loading.value) {
      return;
    }
    await synchronizeSettings();
  }
);

let showEmptyState: () => void;
let addState: () => void;
if (import.meta.env.DEV) {
  showEmptyState = () => {
    Tunnels.value = [];
  };
  addState = () => {
    const randomTarget = Math.random() < 0.5;
    if (randomTarget) {
      Tunnels.value.push({
        target: "tcp://127.0.0.1:22",
        hostname: "ipsum-quia-dolor-sit-amet",
        insecure: false,
      });
    } else {
      Tunnels.value.push({
        target: "https://127.0.0.1:8080",
        hostname: "porro-quisquam-est-qui-dolorem",
        insecure: Math.random() < 0.5,
      });
    }
  };
  broker.on("dev:RestoreState", reloadConfig);
  broker.on("dev:EmptyState", showEmptyState);
  broker.on("dev:AddState", addState);
  onUnmounted(() => {
    broker.off("dev:RestoreState", reloadConfig);
    broker.off("dev:EmptyState", showEmptyState);
    broker.off("dev:AddState", addState);
  });
}
</script>

<template>
  <div class="box">
    <div class="box-wrapper text-gray-900 dark:text-gray-300">
      <ResponsiveRow first full>
        <template #heading>
          <h3
            class="text-left text-sm font-medium leading-6 text-gray-700 dark:text-gray-400"
          >
            Tunnels
          </h3>
        </template>
        <template #content>
          <ul role="list" class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TunnelCard
              v-for="(tunnel, i) in Tunnels"
              :key="i"
              :tunnel="tunnel"
              @update:tunnel="updateTunnel(i, $event)"
              @unpublish="unpublishTunnel(i)"
              @release="releaseTunnel(i)"
            />
            <NewEntryCard
              :icon="ServerIcon"
              :disabled="Loading"
              description="Add a new tunnel"
              @triggered="NewTunnelModalOpen = true"
            />
          </ul>
          <TunnelModal
            v-model:show="NewTunnelModalOpen"
            :create="true"
            :tunnel="{ target: '', insecure: false }"
            @update:tunnel="appendNewTunnel($event)"
          />
        </template>
      </ResponsiveRow>

      <ResponsiveRow>
        <template #heading>
          <h3
            class="text-left text-lg font-medium leading-6 text-gray-900 dark:text-gray-300"
          >
            Client Status
          </h3>
          <p class="mt-2 text-xs text-gray-600">
            <StatusBadge
              :text="ClientConnected ? 'Connected' : 'Disconnected'"
              :level="ClientConnected ? 'healthy' : 'down'"
            >
              <template #healthy>
                <SparklesIcon class="ml-1 h-4 w-4" />
              </template>
              <template #down>
                <BoltSlashIcon class="ml-1 h-4 w-4" />
              </template>
            </StatusBadge>
          </p>
        </template>
        <template #content>
          <div class="overflow-hidden shadow sm:rounded-md">
            <div class="row-content-bg-color px-4 py-5 sm:p-6">
              <div class="grid grid-cols-6 gap-6">
                <div class="col-span-12 sm:col-span-6">
                  <span
                    class="inline-block text-sm text-gray-700 dark:text-gray-300"
                  >
                    <div class="flex space-x-3">
                      <ToggleConnectButton
                        :on-before-connect="synchronizeSettings"
                        @state-toggled="reloadConfig"
                      />
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </ResponsiveRow>

      <Disclosure
        v-slot="{ open }"
        :default-open="ClientConnecting ? false : !ClientConnected"
      >
        <ResponsiveRow>
          <template #heading>
            <DisclosureButton
              class="m-0.5 rounded-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <h3
                :class="[
                  open
                    ? 'text-gray-900 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-600',
                  'text-left text-lg font-medium leading-6',
                ]"
              >
                Client Config
                <ChevronRightIcon
                  :class="[
                    open && 'rotate-90 transform',
                    'ml-2 inline h-4 w-4',
                    !open
                      ? 'text-gray-900 dark:text-gray-300'
                      : 'text-gray-400 dark:text-gray-600',
                  ]"
                />
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
            </DisclosureButton>
          </template>
          <template #content>
            <transition
              enter-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              leave-active-class="transition-opacity duration-200"
              leave-to-class="opacity-0"
            >
              <DisclosurePanel as="div" class="mt-5 md:col-span-3 md:mt-0">
                <form @submit.prevent="synchronizeSettings">
                  <div class="shadow sm:overflow-hidden sm:rounded-md">
                    <div
                      class="row-content-bg-color space-y-6 px-4 py-5 sm:p-6"
                    >
                      <div class="grid grid-cols-3 gap-6">
                        <div class="col-span-3 sm:col-span-2">
                          <label
                            for="specter-apex"
                            class="block text-sm font-medium text-gray-800 dark:text-gray-300"
                          >
                            Specter Gateway
                          </label>
                          <div class="mt-1 flex rounded-md shadow-sm">
                            <span
                              class="inline-flex items-center rounded-l-md border border-r-0 border-gray-200 bg-gray-200/60 px-2.5 text-sm text-black dark:border-gray-700 dark:bg-slate-700/50 dark:text-white"
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
                            Changing to a different specter gateway may require
                            a reset.
                          </p>
                        </div>
                      </div>
                      <fieldset>
                        <legend class="sr-only">Options</legend>
                        <label
                          for="specter-apex"
                          class="block text-sm font-medium text-gray-800 dark:text-gray-300"
                        >
                          Options
                        </label>
                        <div class="mt-4 space-y-4">
                          <SwitchToggle
                            v-model:value="PhantomConfig.specterInsecure"
                            :disabled="DisableSettingsModification"
                            label="Disable TLS Verification"
                            description="Accepts any certificate presented by the gateway and any host name in that certificate when connecting."
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
              </DisclosurePanel>
            </transition>
          </template>
        </ResponsiveRow>
      </Disclosure>
    </div>
  </div>
</template>
