<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
  Switch,
} from "@miragespace/headlessui-vue";
import { TrashIcon } from "@heroicons/vue/24/outline";

import { ref, computed, watch } from "vue";
import type { specter } from "~/wails/go/models";

const props = defineProps<{
  listener: Readonly<specter.Listener>;
  create: boolean;
  show: boolean;
}>();

const emit = defineEmits<{
  (event: "update:listener", listener: specter.Listener): void;
  (event: "update:show", open: boolean): void;
  (event: "delete"): void;
}>();

const initialFocusRef = ref(null);
const listen = ref("");
const hostname = ref("");
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
    listen: listen.value,
    hostname: hostname.value,
    tcp: tcp.value,
  });
  open.value = false;
  if (props.create) {
    listen.value = "";
    hostname.value = "";
    tcp.value = false;
  }
}

function onDelete() {
  emit("delete");
  open.value = false;
}

async function populateFields() {
  listen.value = props.listener.listen;
  hostname.value = props.listener.hostname;
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
              <button
                v-if="!create"
                type="button"
                class="absolute top-10 right-10 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                @click.prevent="onDelete"
              >
                <span class="sr-only">Remove Forwarder</span>
                <TrashIcon class="h-5 w-5" aria-hidden="true" />
              </button>
              <div class="px-6 py-6">
                <h3
                  class="mb-4 text-xl font-medium text-gray-900 dark:text-white"
                >
                  {{
                    !create ? "Edit existing forwarder" : "Add new forwarder"
                  }}
                </h3>
                <form class="space-y-6" @submit.prevent="onSubmit">
                  <div>
                    <label
                      for="listen"
                      class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Listen
                    </label>
                    <div class="flex">
                      <input
                        id="listen"
                        ref="initialFocusRef"
                        v-model="listen"
                        type="text"
                        name="target"
                        class="block w-full rounded-lg border border-gray-300 bg-transparent p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                        placeholder="127.0.0.1:3389"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      for="hostname"
                      class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Hostname
                    </label>
                    <input
                      id="hostname"
                      v-model="hostname"
                      type="text"
                      name="hostname"
                      class="block w-full rounded-lg border border-gray-300 bg-transparent p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:text-gray-400 dark:border-gray-500 dark:text-white dark:placeholder-gray-400 dark:disabled:text-gray-400"
                      placeholder="jinx-jockstrap-gristle-subpanel-violin.fly.specter.im"
                      required
                    />
                  </div>
                  <div class="flex items-start">
                    <div class="flex h-5 items-center">
                      <Switch
                        v-model="tcp"
                        :class="
                          tcp ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-500'
                        "
                        class="relative inline-flex h-3 w-6 items-center rounded-full"
                      >
                        <span class="sr-only">Use TCP</span>
                        <span
                          :class="tcp ? 'translate-x-3' : 'translate-x-0'"
                          class="inline-block h-3 w-3 transform rounded-full border border-gray-300 bg-white transition dark:border-gray-600"
                        />
                      </Switch>
                    </div>
                    <div class="ml-3 text-sm">
                      <label
                        for="tcp"
                        class="font-medium text-gray-700 dark:text-gray-300"
                      >
                        Use TCP
                      </label>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        Connect to specter gateway using TCP/TLS instead of
                        UDP/QUIC
                      </p>
                    </div>
                  </div>
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
