<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@miragespace/headlessui-vue";
import { TrashIcon } from "@heroicons/vue/24/outline";
import DropdownList, {
  type DropdownOption,
} from "~/components/viewport/DropdownList.vue";
import SwitchToggle from "~/components/viewport/SwitchToggle.vue";
import ConfirmModal from "~/components/viewport/ConfirmModal.vue";

import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";

import {
  GetSpecterConfig,
  GetRegisteredHostnames,
} from "~/wails/go/specter/Application";
import { ParseTarget } from "~/wails/go/specter/Helper";
import type { client } from "~/wails/go/models";
import { useRuntimeStore } from "~/store/runtime";

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

const runtime = useRuntimeStore();
const { ClientConnected } = storeToRefs(useRuntimeStore());

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

const availableSchemes: DropdownOption[] = Object.keys(placeholders).map(
  (s) => ({
    Value: s,
    Text: s,
  })
);
const availableMap: Record<string, DropdownOption> = availableSchemes.reduce(
  (m, o) => {
    m[o.Value] = o;
    return m;
  },
  {} as Record<string, DropdownOption>
);
const optionNew: DropdownOption = {
  Value: "",
  Text: "(Assign new hostname)",
};

const initialFocusRef = ref(null);
const scheme = ref(availableSchemes[0]);
const freeHostnames = ref<DropdownOption[]>([]);
const hostname = ref<DropdownOption>(
  props.tunnel.hostname ? { Value: props.tunnel.hostname } : optionNew
);
const insecure = ref(false);
const target = ref("");

const ConfirmDeleteModalOpen = ref(false);
const options = computed<DropdownOption[]>(() => {
  return [optionNew, ...freeHostnames.value];
});

const canDelete = computed<boolean>(() => {
  // obviously can't delete a tunnel when we are creating one
  if (props.create) {
    return false;
  }
  // otherwise, if a tunnel is unpublished, it is all local state, we can delete
  // if the tunnel is already published, we can only delete it if we are connected
  return hostname.value.Value === "" ? true : ClientConnected.value;
});
const deleteModalDescription = computed<string[]>(() => {
  return [
    "Are you sure you want to remove this tunnel?",
    hostname.value.Value === ""
      ? "This tunnel will not be published when the client is connected."
      : "This hostname will be released from the network. You won't be able to use the hostname again.",
  ];
});
const open = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit("update:show", value);
  },
});

function emitUpdate() {
  if (target.value.length < 1) {
    emit("update:tunnel", {
      target: "",
      hostname: hostname.value.Value,
      insecure: insecure.value,
    });
    return;
  }
  if (scheme.value.Value === "winio") {
    emit("update:tunnel", {
      target: target.value,
      hostname: hostname.value.Value,
      insecure: insecure.value,
    });
    return;
  }
  emit("update:tunnel", {
    target: scheme.value.Value + "://" + target.value,
    hostname: hostname.value.Value,
    insecure: scheme.value.Value === "https" ? insecure.value : false,
  });
}

function resetFields() {
  scheme.value = availableSchemes[0];
  hostname.value = optionNew;
  insecure.value = false;
  target.value = "";
}

function onSubmit() {
  open.value = false;
  emitUpdate();
  if (props.create) {
    resetFields();
  }
}

function onDelete() {
  open.value = false;
  emit("delete");
}

async function populateFields() {
  if (props.create) {
    resetFields();
    if (ClientConnected.value) {
      const [free, specterCfg] = await Promise.all([
        GetRegisteredHostnames(),
        GetSpecterConfig(),
      ]);
      const registered = (specterCfg.tunnels || [])
        .map((t) => t.hostname ?? "")
        .filter((h) => h != "");
      freeHostnames.value = free
        .filter((h) => !registered.includes(h))
        .map((h) => ({
          Value: h,
        }));
    }
  } else {
    const parsed = await ParseTarget(props.tunnel.target);
    if (parsed.error) {
      return;
    }
    scheme.value = availableMap[parsed.protocol];
    insecure.value = props.tunnel.insecure;
    target.value = parsed.destination;
  }
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
          class="fixed inset-0 bg-gray-600/75 transition-opacity dark:bg-gray-700/75"
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
                v-show="canDelete"
                type="button"
                class="absolute top-10 right-10 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                @click.prevent="ConfirmDeleteModalOpen = true"
              >
                <span class="sr-only">Remove Tunnel</span>
                <TrashIcon class="h-5 w-5" aria-hidden="true" />
              </button>
              <div class="px-4 py-4">
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
                      <DropdownList
                        v-model:value="scheme"
                        :options="availableSchemes"
                        styles="w-20 rounded-r-none"
                        class="z-20"
                      />
                      <input
                        id="target"
                        ref="initialFocusRef"
                        v-model="target"
                        type="text"
                        name="target"
                        class="block w-full rounded-lg rounded-l-none border border-l-0 border-gray-300 bg-transparent p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                        :placeholder="placeholders[scheme.Value]"
                        required
                      />
                    </div>
                    <p
                      v-show="!create"
                      id="helper-text-explanation"
                      class="mt-2 text-xs text-gray-600 dark:text-gray-400"
                    >
                      Note that updating HTTP(s) tunnel may not take effect
                      immediately.
                    </p>
                  </div>
                  <SwitchToggle
                    v-show="scheme.Value === 'https'"
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
                    <DropdownList
                      v-model:value="hostname"
                      styles="w-full"
                      :options="options"
                      :limit-height="true"
                      :disabled="create ? !ClientConnected : true"
                    />
                    <p
                      v-show="create && !ClientConnected"
                      id="helper-text-explanation"
                      class="mt-2 text-xs text-gray-600 dark:text-gray-400"
                    >
                      You can select previously used hostnames if the client is
                      connected.
                    </p>
                    <p
                      v-show="!create && !ClientConnected"
                      id="helper-text-explanation"
                      class="mt-2 text-xs text-gray-600 dark:text-gray-400"
                    >
                      Removing the tunnel requires the specter client to be
                      connected.
                    </p>
                  </div>
                  <div class="mt-5 flex flex-row-reverse sm:mt-4">
                    <button
                      type="submit"
                      class="w-30 rounded-lg border border-gray-300 bg-gray-50 px-5 py-2.5 text-center text-sm text-black focus:outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-800 dark:hover:bg-gray-600"
                    >
                      {{ !create ? "Update" : "Add" }}
                    </button>
                  </div>
                </form>
              </div>
              <ConfirmModal
                v-model:show="ConfirmDeleteModalOpen"
                :descriptions="deleteModalDescription"
                title="Removing Tunnel"
                @confirmed="onDelete"
              />
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
