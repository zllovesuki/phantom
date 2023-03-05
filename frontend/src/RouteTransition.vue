<script lang="ts" setup>
import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { VNode } from "vue";

defineProps<{
  element: VNode;
  route: RouteLocationNormalizedLoaded;
}>();
</script>

<template>
  <transition
    :enter-active-class="
      [
        'animate__animated',
        'animate__faster',
        'transition-opacity duration-300',
      ].join(' ')
    "
    :enter-from-class="
      [
        'animate__animated',
        'animate__faster',
        'opacity-0',
        route.meta.transition === 'left'
          ? 'animate__slideInRight'
          : 'animate__slideInLeft',
      ].join(' ')
    "
    :leave-active-class="
      [
        'animate__animated',
        'animate__faster',
        'fixed',
        'w-[calc(100%_-_5rem)]',
        'transition-opacity duration-300',
      ].join(' ')
    "
    :leave-to-class="
      [
        'animate__animated',
        'animate__faster',
        'opacity-0',
        route.meta.transition === 'right'
          ? 'animate__slideOutRight'
          : 'animate__slideOutLeft',
      ].join(' ')
    "
  >
    <component :is="element" />
  </transition>
</template>
