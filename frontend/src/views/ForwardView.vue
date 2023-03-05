<script setup lang="ts">
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@miragespace/headlessui-vue";
import {
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";
import ResponsiveRow from "~/components/viewport/ResponsiveRow.vue";
import ForwarderCard from "~/components/forwarder/ForwarderCard.vue";
import ToggleConnectButton from "~/components/forwarder/ToggleConnectButton.vue";
import ForwarderModal from "~/components/forwarder/ForwarderModal.vue";
import NewEntryCard from "~/components/utility/NewEntryCard";
import SwitchToggle from "~/components/viewport/SwitchToggle.vue";

import { storeToRefs } from "pinia";
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";

import {
  GetPhantomConfig,
  AddForwarder,
  RemoveForwarder,
  UpdatePhantomConfig,
  UpdateForwaderLabel,
} from "~/wails/go/specter/Application";
import { specter } from "~/wails/go/models";
import { useAlertStore } from "~/store/alert";
import { useLoadingStore } from "~/store/loading";
import broker from "~/events";

const loadingStore = useLoadingStore();
const { showAlert } = useAlertStore();
const { setLoading } = loadingStore;
const { loading: Loading } = storeToRefs(loadingStore);

const ChangingSettings = ref(false);
const NewForwarderModalOpen = ref(false);
const Forwarders = ref<specter.Listener[]>([]);
const PhantomConfig = ref<specter.PhantomConfig>(
  specter.PhantomConfig.createFrom({
    listeners: [],
    listenOnStart: false,
    specterInsecure: false,
  })
);

async function appendNewForwarder(l: specter.Listener) {
  try {
    setLoading(true);
    await AddForwarder(l);
    await reloadConfig();
  } catch (e) {
    showAlert("fail", `Error adding forwarder: ${e as string}`);
  } finally {
    setLoading(false);
  }
}

async function removeForwarder(i: number) {
  try {
    setLoading(true);
    await RemoveForwarder(i);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await reloadConfig();
  } catch (e) {
    showAlert("fail", `Error removing forwarder: ${e as string}`);
  } finally {
    setLoading(false);
  }
}

async function updateLabel(i: number, label: string) {
  try {
    setLoading(true);
    await UpdateForwaderLabel(i, label);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await reloadConfig();
  } catch (e) {
    showAlert("fail", `Error updating label: ${e as string}`);
  } finally {
    setLoading(false);
  }
}

async function reloadConfig() {
  const phantomCfg = await GetPhantomConfig();
  if (phantomCfg !== null) {
    PhantomConfig.value = phantomCfg;
    if (phantomCfg.listeners) {
      Forwarders.value = phantomCfg.listeners;
    }
  }
}

async function synchronizeSettings() {
  if (ChangingSettings.value) {
    return;
  }
  try {
    ChangingSettings.value = true;
    await UpdatePhantomConfig(PhantomConfig.value);
  } catch (e) {
    showAlert("fail", `Error saving settings: ${e as string}`);
  } finally {
    setTimeout(() => {
      ChangingSettings.value = false;
    }, 500);
  }
}

const _loaded = ref(false);
onMounted(async () => {
  await reloadConfig();
  nextTick(() => {
    _loaded.value = true;
  });
});
watch([() => PhantomConfig.value.listenOnStart], async () => {
  if (!_loaded.value) {
    return;
  }
  await synchronizeSettings();
});

// DEV MENU
function showEmptyState() {
  Forwarders.value = [];
}
function addState() {
  const randomForwarder: specter.Listener = {
    label: "Donec id",
    listen: `127.0.0.1:${Math.floor(Math.random() * (60000 - 1024) + 1024)}`,
    hostname: "ipsum-quia-dolor-sit-amet.dev.host.dev",
    insecure: Math.random() < 0.5,
    tcp: Math.random() < 0.5,
  };
  Forwarders.value.push(randomForwarder);
  if (Math.random() < 0.5) {
    setTimeout(() => {
      broker.emit("forwarder:Started", randomForwarder.listen);
    }, 200);
  }
}
broker.on("dev:RestoreState", reloadConfig);
broker.on("dev:EmptyState", showEmptyState);
broker.on("dev:AddState", addState);
onUnmounted(() => {
  broker.off("dev:RestoreState", reloadConfig);
  broker.off("dev:EmptyState", showEmptyState);
  broker.off("dev:AddState", addState);
});
</script>

<template>
  <div class="box">
    <div class="box-wrapper text-gray-900 dark:text-gray-300">
      <ResponsiveRow first full>
        <template #heading>
          <h3
            class="text-left text-sm font-medium leading-6 text-gray-700 dark:text-gray-400"
          >
            Forwarders
          </h3>
        </template>
        <template #content>
          <ul role="list" class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ForwarderCard
              v-for="(listener, i) in Forwarders"
              :key="i"
              :listener="listener"
              @delete="removeForwarder(i)"
              @update:label="updateLabel(i, $event)"
            />
            <NewEntryCard
              :icon="ArrowRightOnRectangleIcon"
              :disabled="Loading"
              description="Add a new forwarder"
              @triggered="NewForwarderModalOpen = true"
            />
          </ul>
          <ForwarderModal
            v-model:show="NewForwarderModalOpen"
            :create="true"
            :listener="{
              label: '',
              listen: '',
              hostname: '',
              tcp: false,
              insecure: false,
            }"
            @update:listener="appendNewForwarder"
          />
        </template>
      </ResponsiveRow>

      <ResponsiveRow>
        <template #heading>
          <h3
            class="text-left text-lg font-medium leading-6 text-gray-900 dark:text-gray-300"
          >
            Listener Status
          </h3>
        </template>
        <template #content>
          <div class="overflow-hidden shadow sm:rounded-md">
            <div class="bg-gray-50 px-4 py-5 dark:bg-slate-800/50 sm:p-6">
              <div class="grid grid-cols-6 gap-6">
                <div class="col-span-12 sm:col-span-6">
                  <span
                    class="inline-block text-sm text-gray-700 dark:text-gray-300"
                  >
                    <div class="flex space-x-3">
                      <ToggleConnectButton />
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </ResponsiveRow>

      <Disclosure v-slot="{ open }">
        <ResponsiveRow>
          <template #heading>
            <DisclosureButton>
              <h3
                :class="[
                  open
                    ? 'text-gray-900 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-600',
                  'text-left text-lg font-medium leading-6',
                ]"
              >
                Listener Config
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
                  v-show="ChangingSettings"
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
            <DisclosurePanel>
              <div class="shadow sm:overflow-hidden sm:rounded-md">
                <div
                  class="space-y-6 bg-gray-50 px-4 py-5 dark:bg-slate-800/50 sm:p-6"
                >
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
                        v-model:value="PhantomConfig.listenOnStart"
                        :disabled="ChangingSettings"
                        label="Forwarders Autostart"
                        description="Start forwarders when Phantom starts"
                      />
                    </div>
                  </fieldset>
                </div>
              </div>
            </DisclosurePanel>
          </template>
        </ResponsiveRow>
      </Disclosure>
    </div>
  </div>
</template>
