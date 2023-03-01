<script lang="ts" setup>
import { Switch } from "@miragespace/headlessui-vue";

import { computed } from "vue";

export interface Props {
  value: boolean;
  label: string;
  description: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: false,
  disabled: false,
  label: "",
  description: "",
});

const emit = defineEmits<{
  (event: "update:value", value: boolean): void;
}>();

const Value = computed<boolean>({
  get() {
    return props.value;
  },
  set(v) {
    emit("update:value", v);
  },
});

const compositeClasses = computed<string[]>(() => {
  let classes = [];
  classes.push(Value.value ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-500");
  if (props.disabled) {
    classes.push("cursor-not-allowed");
  }
  return classes;
});
</script>

<template>
  <div class="flex items-start">
    <div class="flex h-5 items-center">
      <Switch
        v-model="Value"
        :disabled="disabled"
        :class="compositeClasses"
        class="relative inline-flex h-3 w-6 items-center rounded-full"
      >
        <span class="sr-only">{{ label }}</span>
        <span
          :class="Value ? 'translate-x-3' : 'translate-x-0'"
          class="inline-block h-3 w-3 transform rounded-full border border-gray-400 bg-white transition dark:border-gray-600"
        />
      </Switch>
    </div>
    <div class="ml-3 text-sm">
      <label for="toggle" class="font-medium text-gray-700 dark:text-gray-300">
        {{ label }}
      </label>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ description }}
      </p>
    </div>
  </div>
</template>
