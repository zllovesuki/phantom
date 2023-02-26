<script setup lang="ts">
import { TransitionRoot } from "@miragespace/headlessui-vue";
import { computed } from "vue";
import {
  XCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/20/solid";
import { useAlertStore } from "~/store/alert";

export type AlertLevel = "fail" | "success" | "info";

const alert = useAlertStore();

const bgColorClasses = computed(() => {
  switch (alert.level) {
    case "fail":
      return ["bg-red-50", "dark:bg-red-300/[0.1]"];
    case "success":
      return ["bg-green-50", "dark:bg-green-300/[0.1]"];
    case "info":
      return ["bg-blue-50", "dark:bg-blue-300/[0.1]"];
    default:
      return [];
  }
});
const iconColorClass = computed(() => {
  switch (alert.level) {
    case "fail":
      return "text-red-400";
    case "success":
      return "text-green-400";
    case "info":
      return "text-blue-400";
    default:
      return "";
  }
});
const textColorClasses = computed(() => {
  switch (alert.level) {
    case "fail":
      return ["text-red-900", "dark:text-red-400"];
    case "success":
      return ["text-green-900", "dark:text-green-400"];
    case "info":
      return ["text-blue-900", "dark:text-blue-400"];
    default:
      return [];
  }
});
const dismissColorClasses = computed(() => {
  switch (alert.level) {
    case "fail":
      return [
        "bg-red-50",
        "dark:bg-red-300/[0.1]",
        "text-red-500",
        "hover:bg-red-100",
        "focus:ring-red-600",
        "focus:ring-offset-red-50",
      ];
    case "success":
      return [
        "bg-green-50",
        "dark:bg-green-300/[0.1]",
        "text-green-500",
        "hover:bg-green-100",
        "focus:ring-green-600",
        "focus:ring-offset-green-50",
      ];
    case "info":
      return [
        "bg-blue-50",
        "dark:bg-blue-300/[0.1]",
        "text-blue-500",
        "hover:bg-blue-100",
        "focus:ring-blue-600",
        "focus:ring-offset-blue-50",
      ];
    default:
      return [];
  }
});
</script>

<template>
  <TransitionRoot
    :show="alert.show"
    enter="transform ease-out duration-300 transition"
    enter-from="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to="translate-y-0 opacity-100 sm:translate-x-0"
    leave="transition ease-in duration-100"
    leave-from="opacity-100"
    leave-to="opacity-0"
  >
    <div :class="[...bgColorClasses, 'rounded-md p-4']">
      <div class="flex">
        <div class="flex-shrink-0">
          <CheckCircleIcon
            v-show="alert.level === 'success'"
            :class="[iconColorClass, 'h-5 w-5']"
            aria-hidden="true"
          />
          <XCircleIcon
            v-show="alert.level === 'fail'"
            :class="[iconColorClass, 'h-5 w-5']"
            aria-hidden="true"
          />
          <InformationCircleIcon
            v-show="alert.level === 'info'"
            :class="[iconColorClass, 'h-5 w-5']"
            aria-hidden="true"
          />
        </div>

        <div class="ml-3">
          <p :class="[...textColorClasses, 'text-sm font-medium']">
            {{ alert.message }}
          </p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button
              type="button"
              :class="[
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                ...dismissColorClasses,
              ]"
              @click="alert.hideAlert"
            >
              <span class="sr-only">Dismiss</span>
              <XMarkIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </TransitionRoot>
</template>
