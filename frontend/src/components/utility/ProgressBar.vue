<script lang="ts" setup>
// adopted from https://codesandbox.io/s/progress-component-with-vue-and-tailwindcss-hdkzi

export interface Props {
  colorClass?: string;
  bgColorClass?: string;
  percentage?: number;
  rounded?: boolean;
  indeterminate?: boolean;
}

withDefaults(defineProps<Props>(), {
  colorClass: "bg-teal-500",
  bgColorClass: "bg-gray-200",
  bgColor: "gray",
  percentage: 0,
  rounded: true,
  indeterminate: false,
});
</script>

<template>
  <div
    class="h-1 w-full overflow-hidden"
    :class="[
      bgColorClass,
      { 'rounded-full': rounded },
      { indeterminate: indeterminate },
    ]"
  >
    <div
      class="progressbar h-full"
      :class="[
        colorClass,
        { 'absolute top-0': indeterminate },
        { 'rounded-full': rounded },
      ]"
      role="progressbar"
      :style="{ width: `${percentage}%` }"
      :aria-valuenow="percentage"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <span class="flex h-full items-center">
        <slot></slot>
      </span>
    </div>
  </div>
</template>

<style scoped>
@keyframes progress-indeterminate {
  0% {
    width: 30%;
    left: -40%;
  }
  50% {
    left: 100%;
    width: 100%;
  }
  to {
    left: 100%;
    width: 0;
  }
}
.progressbar {
  transition: width 0.25s ease;
}
.indeterminate .progressbar {
  animation: progress-indeterminate 1.2s ease infinite;
}
</style>
