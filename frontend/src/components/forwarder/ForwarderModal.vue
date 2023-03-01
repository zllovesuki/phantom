<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@miragespace/headlessui-vue";
import SwitchToggle from "~/components/utility/SwitchToggle.vue";

import { ref, computed, watch } from "vue";
import type { specter } from "~/wails/go/models";

export interface Props {
  listener: Readonly<specter.Listener>;
  show: boolean;
  create?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  create: false,
});

const emit = defineEmits<{
  (event: "update:listener", listener: specter.Listener): void;
  (event: "update:show", open: boolean): void;
}>();

const initialFocusRef = ref(null);
const label = ref("");
const listen = ref("");
const hostname = ref("");
const insecure = ref(false);
const tcp = ref(false);

const open = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit("update:show", value);
  },
});

function onSubmit() {
  emit("update:listener", {
    label: label.value,
    listen: listen.value,
    hostname: hostname.value,
    insecure: insecure.value,
    tcp: tcp.value,
  });
  open.value = false;
  if (props.create) {
    label.value = "";
    listen.value = "";
    hostname.value = "";
    insecure.value = false;
    tcp.value = false;
  }
}

async function populateFields() {
  label.value = props.listener.label;
  listen.value = props.listener.listen;
  hostname.value = props.listener.hostname;
  insecure.value = props.listener.insecure;
  tcp.value = props.listener.tcp;
}

// refresh when we are visible
watch(
  () => props.show,
  (s) => {
    if (!s) {
      return;
    }
    populateFields();
  }
);
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
              <div class="px-6 py-6">
                <h3
                  class="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
                >
                  {{
                    !create ? "Edit existing forwarder" : "Add new forwarder"
                  }}
                </h3>
                <form class="space-y-6" @submit.prevent="onSubmit">
                  <div>
                    <label
                      for="label"
                      class="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Label
                    </label>
                    <div class="flex">
                      <input
                        id="label"
                        ref="initialFocusRef"
                        v-model="label"
                        type="text"
                        name="label"
                        class="block w-full rounded-lg border border-gray-300 bg-transparent p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                        placeholder="raspberry pi at home"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      for="listen"
                      class="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Listen
                    </label>
                    <div class="flex">
                      <input
                        id="listen"
                        v-model="listen"
                        type="text"
                        name="listen"
                        class="block w-full rounded-lg border border-gray-300 bg-transparent p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                        placeholder="127.0.0.1:3389"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      for="hostname"
                      class="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Hostname
                    </label>
                    <input
                      id="hostname"
                      v-model="hostname"
                      type="text"
                      name="hostname"
                      class="block w-full rounded-lg border border-gray-300 bg-transparent p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:text-gray-400 dark:border-gray-500 dark:text-white dark:placeholder-gray-400 dark:disabled:text-gray-400"
                      placeholder="jinx-jockstrap-gristle-subpanel-violin.specter.im"
                      required
                    />
                  </div>
                  <SwitchToggle
                    v-model:value="insecure"
                    label="Disable TLS Verification"
                    description="Accepts any certificate presented by the gateway and any host name in that certificate when connecting."
                  />
                  <SwitchToggle
                    v-model:value="tcp"
                    label="Use TCP"
                    description="Connect to specter gateway using TCP/TLS instead of UDP/QUIC"
                  />
                  <button
                    type="submit"
                    class="w-full rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm text-black focus:outline-none focus:ring-4 focus:ring-blue-300 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-800 dark:hover:bg-gray-600"
                  >
                    {{ !create ? "Update" : "Add" }}
                  </button>
                </form>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
