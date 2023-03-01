<script setup lang="ts">
import TunnelCard from "~/components/tunnel/TunnelCard.vue";
import TunnelModal from "~/components/tunnel/TunnelModal.vue";
import FullWidthCTA from "~/components/utility/FullWidthCTA";

import { storeToRefs } from "pinia";
import { ref, onMounted, computed } from "vue";

import {
  GetSpecterConfig,
  RebuildTunnels,
  UnpublishTunnel,
  Synchronize,
} from "~/wails/go/specter/Application";
import type { client } from "~/wails/go/models";
import { useAlertStore } from "~/store/alert";
import { useLoadingStore } from "~/store/loading";

const Loading = useLoadingStore();
const { setLoading } = Loading;
const { loading } = storeToRefs(Loading);

const { showAlert } = useAlertStore();
const Tunnels = ref<client.Tunnel[]>([]);
const NewTunnelModalOpen = ref(false);
const Unsaved = computed<boolean>(() => {
  return Tunnels.value.reduce((p, t) => {
    if (p) {
      return p;
    }
    return !t.hostname;
  }, false);
});

async function appendNewTunnel(t: client.Tunnel) {
  try {
    setLoading(true);
    Tunnels.value.push({
      target: t.target,
      insecure: t.insecure,
    });
    await rebuildTunnels();
    await synchornizeTunnels();
  } catch (e) {
    showAlert("fail", `Error adding tunnel: ${e as string}`);
  } finally {
    setLoading(false);
  }
}

async function unpublishTunnel(i: number) {
  try {
    setLoading(true);
    await UnpublishTunnel(i);
    Tunnels.value.splice(i, 1);
  } catch (e) {
    showAlert("fail", `Error removing tunnel: ${e as string}`);
  } finally {
    setLoading(false);
  }
}

async function updateTunnel(i: number, t: client.Tunnel) {
  Tunnels.value[i].target = t.target;
  Tunnels.value[i].insecure = t.insecure;
  await rebuildTunnels();
}

async function rebuildTunnels() {
  await RebuildTunnels(Tunnels.value);
}

async function synchornizeTunnels() {
  try {
    await Synchronize();
    await reloadTunnels();
  } catch (e) {
    /* empty */
  }
}

async function reloadTunnels() {
  const cfg = await GetSpecterConfig();
  if (cfg !== null) {
    if (cfg.tunnels) {
      Tunnels.value = cfg.tunnels;
    }
  }
}

onMounted(reloadTunnels);
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
                Tunnels
              </h3>
              <p
                v-show="Unsaved"
                class="mt-2 text-xs text-gray-600 dark:text-gray-500"
              >
                New tunnels will be persisted after publishing
              </p>
            </div>
          </div>
          <div class="mt-5 md:col-span-full md:mt-0">
            <form @submit.prevent>
              <FullWidthCTA
                icon="ServerIcon"
                :disabled="loading"
                description="Add a new tunnel"
                @triggered="NewTunnelModalOpen = true"
              />
              <ul
                v-show="Tunnels.length > 0"
                role="list"
                class="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                <TunnelCard
                  v-for="(tunnel, i) in Tunnels"
                  :key="i"
                  :tunnel="tunnel"
                  @update:tunnel="updateTunnel(i, $event)"
                  @delete="unpublishTunnel(i)"
                />
              </ul>
              <TunnelModal
                v-model:show="NewTunnelModalOpen"
                :create="true"
                :tunnel="{ target: '', insecure: false }"
                @update:tunnel="appendNewTunnel($event)"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
