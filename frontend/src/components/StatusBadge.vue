<script setup lang="ts">
defineProps<{
  enabled: boolean;
  text: string;
}>();
</script>

<template>
  <span
    :class="
      'mx-2 mb-2 inline-flex items-center rounded-md px-2.5 py-0.5 font-medium ' +
      (enabled
        ? 'bg-green-200 dark:bg-green-400/25'
        : 'bg-red-200 dark:bg-red-400/25') +
      ' ' +
      (enabled
        ? 'text-green-800 dark:text-green-300'
        : 'text-red-800 dark:text-red-300')
    "
    >{{ text }}
    <slot v-if="enabled" name="enabled"></slot>
    <slot v-if="!enabled" name="disabled"></slot>
  </span>
</template>
