<script setup lang="ts">
import TunnelCard from "@/components/TunnelCard.vue";
import TunnelModal from "@/components/TunnelModal.vue";
import {
    ServerIcon,
} from "@heroicons/vue/24/outline";

import { ref, onMounted } from "vue";
import { GetCurrentConfig } from "@wails/go/specter/Application"
import { client } from "@wails/go/models";

const Config = ref<client.Config>(client.Config.createFrom({ apex: "" }))

const NewTunnel = ref<client.Tunnel>(client.Tunnel.createFrom({ target: "" }))
const NewTunnelModalOpen = ref(false)

function appendNewTunnel() {
    if (!Config.value.tunnels) {
        return
    }
    Config.value.tunnels.push({
        target: NewTunnel.value.target
    })
    NewTunnel.value.target = ""
}

onMounted(async () => {
    const cfg = await GetCurrentConfig()
    if (cfg !== null) {
        Config.value = cfg
    }
    if (!Config.value.tunnels) {
        Config.value.tunnels = []
    }
    Config.value.clientId = 12345678
    Config.value.token = "abcd"
    Config.value.tunnels.push({
        target: "tcp://127.0.0.1:22"
    })
    Config.value.tunnels.push({
        target: "https://127.0.0.1:8443"
    })
    Config.value.tunnels.push({
        target: "unix:///tmp/nginx.sock"
    })
})
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
                        <ul role="list" class="grid grid-cols-1 gap-6 md:grid-cols-2 mb-10"
                            v-show="(Config.tunnels ?? []).length > 0">
                            <TunnelCard v-for="(tunnel, index) in Config.tunnels" :key="index" :tunnel="tunnel"
                                @update:target="tunnel.target = $event" />
                        </ul>
                        <button type="button" @click="NewTunnelModalOpen = true"
                            class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none">
                            <ServerIcon class="mx-auto h-8 w-8 text-gray-400" />
                            <span class="mt-2 block text-sm font-medium">
                                Add a new tunnel
                            </span>
                        </button>
                        <TunnelModal :create="true" :tunnel="NewTunnel" :show="NewTunnelModalOpen" :action="appendNewTunnel"
                            @update:show="NewTunnelModalOpen = $event" @update:target="NewTunnel.target = $event" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>