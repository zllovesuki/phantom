<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "~/vendor/@headlessui-vue";
import ClickToCopy from "./ClickToCopy";

import { client } from "~/wails/go/models";
import { GetCurrentConfig } from "~/wails/go/specter/Application";

import { computed, ref, onMounted } from "vue";

const props = defineProps<{
  tunnel: client.Tunnel;
  show: boolean;
}>();

const emit = defineEmits<{
  (event: "update:show", open: boolean): void;
}>();

let initialFocusRef = ref(null);

const open = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit("update:show", value);
  },
});

const SpecterConfig = ref<client.Config>(
  client.Config.createFrom({ apex: "" })
);

function formatLink(hostname: string) {
  let apex = SpecterConfig.value.apex;
  if (apex.endsWith(":443")) {
    apex = apex.slice(0, -4);
  }
  return hostname + "." + apex;
}

onMounted(async () => {
  const specterConfig = await GetCurrentConfig();
  if (specterConfig !== null) {
    SpecterConfig.value = specterConfig;
  }
});
</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog
      as="div"
      class="no-drag relative z-10"
      :initial-focus="initialFocusRef"
      @close="open = false"
    >
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
        />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white bg-gray-100 px-4 py-4 text-left shadow-xl transition-all dark:bg-slate-900 sm:w-full sm:max-w-lg"
            >
              <div class="text-gray-900 dark:text-white">
                <div class="text-center">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6">
                    Connecting to your tunnel
                  </DialogTitle>
                  <div class="mt-2 text-left">
                    <ul
                      role="list"
                      class="divide-y divide-gray-300 text-sm dark:divide-gray-600"
                    >
                      <li class="py-4">
                        For HTTP(s) tunnel, you can visit <br />
                        <ClickToCopy
                          ref="initialFocusRef"
                          as="a"
                          class="text-indigo-600 dark:text-indigo-400"
                          :content="formatLink(tunnel.hostname ?? '')"
                        />
                      </li>

                      <li class="py-4">
                        For TCP tunnel:
                        <ul role="list">
                          <li class="px-2 py-2 sm:px-0">
                            Using the specter client,
                            <ClickToCopy
                              as="code"
                              class="text-xs"
                              :content="
                                'specter client connect ' +
                                formatLink(tunnel.hostname ?? '')
                              "
                            />
                            can be used to tunnel via stdin/stdout. This is
                            useful for
                            <code class="text-xs">ProxyCommand</code>.
                          </li>
                          <li class="px-2 pt-2 sm:px-0">
                            Alternatively, use the "Local Forwarding" in
                            Phantom, or
                            <code class="text-xs">specter client listen</code>
                            to listen for incoming connections locally, and
                            tunnel the connections to target.
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
