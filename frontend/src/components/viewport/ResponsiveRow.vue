<script setup lang="ts">
import HorizontalDivider from "~/components/utility/HorizontalDivider.vue";

withDefaults(
  defineProps<{
    first?: boolean;
    full?: boolean;
  }>(),
  {
    first: false,
    full: false,
  }
);
</script>

<template>
  <div>
    <HorizontalDivider v-if="!first" />
    <div :class="!first ? 'mt-10 sm:mt-0' : ''">
      <div class="md:grid md:grid-cols-4 md:gap-6">
        <div :class="full ? 'md:col-span-full' : 'md:col-span-1'">
          <div class="px-4 sm:px-0">
            <slot name="heading"></slot>
          </div>
        </div>
        <div
          :class="[full ? 'md:col-span-full' : 'md:col-span-3', 'mt-5 md:mt-0']"
        >
          <slot name="content"></slot>
        </div>
      </div>
    </div>
  </div>
</template>
