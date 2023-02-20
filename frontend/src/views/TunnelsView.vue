<script setup lang="ts">
import TunnelCard from "@/components/TunnelCard.vue";
import TunnelModal from "@/components/TunnelModal.vue";
import {
    ServerIcon,
} from "@heroicons/vue/24/outline";

import { ref, onMounted } from "vue";
import { GetCurrentConfig, RebuildTunnels, Synchronize } from "@wails/go/specter/Application"
import type { client } from "@wails/go/models";

const Tunnels = ref<client.Tunnel[]>([]);

interface NewTunnel extends client.Tunnel {
    modalOpen: boolean
}

const NewTunnel = ref<NewTunnel>({
    target: "",
    modalOpen: false
})

async function appendNewTunnel() {
    Tunnels.value.push({
        target: NewTunnel.value.target
    })
    NewTunnel.value.target = ""
    await rebuildTunnels()
    await synchornizeTunnels()
}

async function rebuildTunnels() {
    await RebuildTunnels(Tunnels.value)
}

async function synchornizeTunnels() {
    try {
        await Synchronize()
        await reloadTunnels()
    } catch (e) {
    }
}

async function reloadTunnels() {
    const cfg = await GetCurrentConfig()
    if (cfg !== null) {
        if (cfg.tunnels) {
            Tunnels.value = cfg.tunnels
        }
    }
}

onMounted(reloadTunnels)
</script>

<template>
    <div class="box">
        <div class="box-wrapper text-gray-900 dark:text-gray-300">
            <div class="mt-10 sm:mt-0">
                <div class="md:grid md:grid-cols-3 md:gap-6">
                    <div class="md:col-span-full">
                        <div class="px-4 sm:px-0">
                            <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
                                Tunnels
                            </h3>
                        </div>
                    </div>
                    <div class="mt-5 md:col-span-full md:mt-0">
                        <form @submit.prevent>
                            <ul role="list" class="grid grid-cols-1 gap-6 md:grid-cols-2 mb-10" v-show="Tunnels.length > 0">
                                <TunnelCard v-for="(tunnel, index) in Tunnels" :key="index" :tunnel="tunnel"
                                    @update:target="tunnel.target = $event; rebuildTunnels()" />
                            </ul>
                            <button type="button" @click="NewTunnel.modalOpen = true"
                                class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none">
                                <ServerIcon class="mx-auto h-8 w-8 text-gray-400" />
                                <span class="mt-2 block text-sm font-medium">
                                    Add a new tunnel
                                </span>
                            </button>
                            <TunnelModal :create="true" v-model:target="NewTunnel.target" v-model:show="NewTunnel.modalOpen"
                                @update:target="NewTunnel.target = $event; appendNewTunnel()" />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>