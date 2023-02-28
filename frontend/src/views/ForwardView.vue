<script setup lang="ts">
import ForwarderCard from "~/components/ForwarderCard.vue";
import ForwarderModal from "~/components/ForwarderModal.vue";
import { ArrowRightOnRectangleIcon } from "@heroicons/vue/24/outline";

import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";

import { GetPhantomConfig } from "~/wails/go/specter/Application";
import { specter } from "~/wails/go/models";
import { useAlertStore } from "~/store/alert";
import { useLoadingStore } from "~/store/loading";

const Loading = useLoadingStore();
const { setLoading } = Loading;
const { loading } = storeToRefs(Loading);

const PhantomConfig = ref<specter.PhantomConfig>(
  specter.PhantomConfig.createFrom({
    specterInsecure: false,
    listeners: [],
  })
);

const { showAlert } = useAlertStore();
const NewForwarderModalOpen = ref(false);

async function appendNewForwarder(l: specter.Listener) {
  try {
    setLoading(true);
    PhantomConfig.value.listeners.push(l);
  } catch (e) {
    showAlert("fail", e as string);
  } finally {
    setLoading(false);
  }
}

async function reloadListeners() {
  const cfg = await GetPhantomConfig();
  if (cfg !== null) {
    if (cfg.listeners) {
      PhantomConfig.value.listeners = cfg.listeners;
    }
  }
}

onMounted(reloadListeners);
</script>

<template>
  <div class="box">
    <div class="box-wrapper text-gray-900 dark:text-gray-300">
      <div>
        <div class="md:grid md:grid-cols-4 md:gap-6">
          <div class="md:col-span-full">
            <div class="px-4 sm:px-0">
              <h3
                class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300"
              >
                Forwarders
              </h3>
            </div>
          </div>
          <div class="mt-5 md:col-span-full md:mt-0">
            <form @submit.prevent>
              <ul
                v-show="PhantomConfig.listeners.length > 0"
                role="list"
                class="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                <ForwarderCard
                  v-for="(listener, i) in PhantomConfig.listeners"
                  :key="i"
                  :listener="listener"
                />
              </ul>
              <button
                type="button"
                class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                :disabled="loading"
                @click="NewForwarderModalOpen = true"
              >
                <ArrowRightOnRectangleIcon
                  class="mx-auto h-10 w-10 text-gray-400"
                />
                <span class="mt-2 block text-base font-medium">
                  Add a new forwarder
                </span>
              </button>
              <ForwarderModal
                v-model:show="NewForwarderModalOpen"
                :listener="{ listen: '', hostname: '', tcp: false }"
                :create="true"
                @update:listener="appendNewForwarder"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
