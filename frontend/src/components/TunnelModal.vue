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
} from "~/vendor/@headlessui-vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";
import { TrashIcon } from "@heroicons/vue/24/outline";

import { ParseTarget } from "~/wails/go/specter/Helper";
import { ref, computed, onMounted } from "vue";

import { useRuntimeStore } from "~/store/runtime";

const runtime = useRuntimeStore();

const props = defineProps<{
  target: string;
  hostname?: string;
  create: boolean;
  show: boolean;
}>();

const emit = defineEmits<{
  (event: "update:target", target: string): void;
  (event: "update:show", open: boolean): void;
}>();

let initialFocusRef = ref(null);

function emitTargetUpdate(scheme: string, target: string) {
  if (target.length < 1) {
    emit("update:target", "");
    return;
  }
  if (scheme === "winio") {
    emit("update:target", target);
    return;
  }
  emit("update:target", scheme + "://" + target);
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

const scheme = ref("tcp");
const target = ref("");

onMounted(async () => {
  const parsed = await ParseTarget(props.target);
  if (parsed.error) {
    return;
  }
  scheme.value = parsed.protocol;
  target.value = parsed.destination;
});

const open = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit("update:show", value);
  },
});

function onSubmit() {
  emitTargetUpdate(scheme.value, target.value);
  open.value = false;
}
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
              >
                <span class="sr-only">Remove Tunnel</span>
                <TrashIcon class="h-5 w-5" aria-hidden="true" />
              </button>
              <div class="px-6 py-6">
                <h3
                  class="mb-4 text-xl font-medium text-gray-900 dark:text-white"
                >
                  {{ !create ? "Edit existing tunnel" : "Add new tunnel" }}
                </h3>
                <form class="space-y-6" @submit.prevent="onSubmit">
                  <div>
                    <label
                      for="target"
                      class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
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
                      Note that updating HTTP(s) target may not take effect
                      immediately.
                    </p>
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
                      type="text"
                      name="hostname"
                      :value="hostname"
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
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
