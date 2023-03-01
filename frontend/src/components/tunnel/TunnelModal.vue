<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@miragespace/headlessui-vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";
import { TrashIcon } from "@heroicons/vue/24/outline";
import SwitchToggle from "~/components/utility/SwitchToggle.vue";
import ConfirmModal from "~/components/utility/ConfirmModal.vue";

import { ParseTarget } from "~/wails/go/specter/Helper";
import { ref, computed, watch } from "vue";

import { useRuntimeStore } from "~/store/runtime";
import type { client } from "~/wails/go/models";

export interface Props {
  tunnel: Readonly<client.Tunnel>;
  show: boolean;
  create?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  create: false,
});

const emit = defineEmits<{
  (event: "update:tunnel", tunnel: client.Tunnel): void;
  (event: "update:show", open: boolean): void;
  (event: "delete"): void;
}>();

const initialFocusRef = ref(null);
const scheme = ref("tcp");
const target = ref("");
const insecure = ref(false);
const xd = ref(false);

const runtime = useRuntimeStore();

function emitUpdate() {
  if (target.value.length < 1) {
    emit("update:tunnel", {
      ...props.tunnel,
      target: "",
      insecure: insecure.value,
    });
    return;
  }
  if (scheme.value === "winio") {
    emit("update:tunnel", {
      ...props.tunnel,
      target: target.value,
      insecure: insecure.value,
    });
    return;
  }
  emit("update:tunnel", {
    ...props.tunnel,
    target: scheme.value + "://" + target.value,
    insecure: scheme.value === "https" ? insecure.value : false,
  });
}

const placeholders: Record<string, string> = {
  tcp: "127.0.0.1:22",
  http: "127.0.0.1:8080",
  https: "127.0.0.1:8443",
  unix: "/run/nginx.sock",
  winio: "\\\\.\\pipe\\ipc",
};
if (runtime.environment?.platform === "windows") {
  delete placeholders["unix"];
} else {
  delete placeholders["winio"];
}
const availableSchemes = Object.keys(placeholders);

const open = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit("update:show", value);
  },
});

function onSubmit() {
  emitUpdate();
  open.value = false;
  if (props.create) {
    scheme.value = "tcp";
    target.value = "";
    insecure.value = false;
  }
}

function onDelete() {
  emit("delete");
  open.value = false;
}

async function populateFields() {
  const parsed = await ParseTarget(props.tunnel.target);
  if (parsed.error) {
    return;
  }
  scheme.value = parsed.protocol;
  target.value = parsed.destination;
  insecure.value = props.tunnel.insecure;
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
                v-show="!create && !tunnel.hostname"
                type="button"
                class="absolute top-10 right-10 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                @click.prevent="xd = true"
              >
                <span class="sr-only">Remove Tunnel</span>
                <TrashIcon class="h-5 w-5" aria-hidden="true" />
              </button>
              <div class="px-6 py-6">
                <h3
                  class="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
                >
                  {{ !create ? "Edit existing tunnel" : "Add new tunnel" }}
                </h3>
                <form class="space-y-6" @submit.prevent="onSubmit">
                  <div>
                    <label
                      for="target"
                      class="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Target
                    </label>
                    <div class="flex">
                      <Listbox v-model="scheme" as="div">
                        <div class="relative">
                          <ListboxButton
                            class="relative w-20 cursor-default rounded-md rounded-r-none border border-gray-300 bg-gray-100 py-3 pl-3 pr-8 text-left text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-500 dark:bg-slate-700 dark:text-white sm:text-sm"
                          >
                            <span class="block">{{ scheme }}</span>
                            <span
                              class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1"
                            >
                              <ChevronUpDownIcon
                                class="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </span>
                          </ListboxButton>

                          <transition
                            leave-active-class="transition ease-in duration-100"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0"
                          >
                            <ListboxOptions
                              class="py1 absolute z-10 mt-1 max-h-60 w-full overflow-y-auto bg-gray-50 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 sm:text-sm"
                            >
                              <ListboxOption
                                v-for="usableScheme in availableSchemes"
                                :key="usableScheme"
                                v-slot="{ active, selected }"
                                as="template"
                                :value="usableScheme"
                              >
                                <li
                                  :class="[
                                    active
                                      ? 'bg-gray-300 dark:bg-slate-500 dark:text-white'
                                      : 'dark:text-white',
                                    'relative cursor-default select-none py-2 pl-3 pr-7',
                                  ]"
                                >
                                  <span
                                    :class="[
                                      selected ? 'font-semibold' : 'font-light',
                                      'block',
                                    ]"
                                  >
                                    {{ usableScheme }}
                                  </span>

                                  <span
                                    v-if="selected"
                                    :class="[
                                      active
                                        ? 'dark:text-white'
                                        : 'dark:text-white',
                                      'absolute inset-y-0 right-0 flex items-center pr-2',
                                    ]"
                                  >
                                    <CheckIcon
                                      class="h-4 w-4"
                                      aria-hidden="true"
                                    />
                                  </span>
                                </li>
                              </ListboxOption>
                            </ListboxOptions>
                          </transition>
                        </div>
                      </Listbox>
                      <input
                        id="target"
                        ref="initialFocusRef"
                        v-model="target"
                        type="text"
                        name="target"
                        class="block w-full rounded-lg rounded-l-none border border-l-0 border-gray-300 bg-transparent p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                        :placeholder="placeholders[scheme]"
                        required
                      />
                    </div>
                    <p
                      v-show="!create"
                      id="helper-text-explanation"
                      class="mt-2 text-xs text-gray-500 dark:text-gray-400"
                    >
                      Note that updating HTTP(s) tunnel may not take effect
                      immediately.
                    </p>
                  </div>
                  <SwitchToggle
                    v-show="scheme === 'https'"
                    v-model:value="insecure"
                    label="Disable TLS Verification"
                    description="Accepts any certificate presented by the https target and any host name in that certificate when connecting."
                  />
                  <div>
                    <label
                      for="hostname"
                      class="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Hostname
                    </label>
                    <input
                      id="hostname"
                      type="text"
                      name="hostname"
                      :value="tunnel.hostname"
                      placeholder="(Assigned on Publish)"
                      class="block w-full rounded-lg border border-gray-300 bg-transparent p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:text-gray-400 dark:border-gray-500 dark:text-white dark:placeholder-gray-400 dark:disabled:text-gray-400"
                      disabled
                      readonly
                    />
                  </div>
                  <button
                    type="submit"
                    class="w-full rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm text-black focus:outline-none focus:ring-4 focus:ring-blue-300 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-800 dark:hover:bg-gray-600"
                  >
                    {{ !create ? "Update" : "Add" }}
                  </button>
                </form>
              </div>
              <ConfirmModal
                v-model:show="xd"
                title="Remove tunnel"
                description="Are you sure you want to remove this tunnel? This tunnel will be unregistered from the specter network."
                @confirmed="onDelete"
              />
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
