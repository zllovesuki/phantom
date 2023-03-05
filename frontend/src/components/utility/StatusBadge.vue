<script setup lang="ts">
import { computed } from "vue";

export type StatusLevel = "healthy" | "sick" | "down";

const props = defineProps<{
  level: StatusLevel;
  text: string;
}>();

const bgColorClasses = computed(() => {
  switch (props.level) {
    case "healthy":
      return ["bg-green-200", "dark:bg-green-400/25"];
    case "sick":
      return ["bg-amber-200", "dark:bg-amber-400/25"];
    case "down":
      return ["bg-red-200", "dark:bg-red-400/25"];
    default:
      return [];
  }
});

const textColorClasses = computed(() => {
  switch (props.level) {
    case "healthy":
      return ["text-green-800", " dark:text-green-300"];
    case "sick":
      return ["text-amber-800", " dark:text-amber-300"];
    case "down":
      return ["text-red-800", "dark:text-red-300"];
    default:
      return [];
  }
});
</script>

<template>
  <span
    :class="[
      'mx-2 mb-2 inline-flex items-center rounded-md border border-gray-300 px-2.5 py-0.5 font-medium shadow-sm dark:border-gray-700',
      ...bgColorClasses,
      ...textColorClasses,
    ]"
    >{{ text }}
    <slot v-if="level === 'healthy'" name="healthy"></slot>
    <slot v-if="level === 'sick'" name="sick"></slot>
    <slot v-if="level === 'down'" name="down"></slot>
  </span>
</template>
