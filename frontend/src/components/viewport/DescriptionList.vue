<script lang="ts" setup>
import { ref, watch } from "vue";

export interface Item {
  Key: string;
  Value: string | undefined;
  ClickToShow?: boolean;
}

const props = defineProps<{
  items: Item[];
}>();

const shown = ref<boolean[]>([]);

watch(
  () => props.items,
  (n) => {
    for (let i = 0; i < n.length; i++) {
      shown.value[i] = !!shown.value[i] ?? false;
    }
  }
);
</script>

<template>
  <dl class="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-600">
    <div
      v-for="(item, i) in items"
      :key="item.Key"
      class="py-4 sm:grid sm:grid-cols-4 sm:gap-4 sm:py-5"
    >
      <dt class="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {{ item.Key }}
      </dt>
      <dd
        :class="[
          !!item.ClickToShow ? 'cursor-pointer' : '',
          'mt-1 text-sm text-gray-900 dark:text-gray-300 sm:col-span-3 sm:mt-0',
        ]"
        @click="
          () => {
            if (item.ClickToShow === undefined) {
              return;
            }
            shown[i] = !shown[i];
          }
        "
      >
        {{
          !!item.ClickToShow
            ? shown[i]
              ? item.Value ?? ""
              : Array((item.Value ?? "").length)
                  .fill("*")
                  .join("")
            : item.Value ?? ""
        }}
      </dd>
    </div>
  </dl>
</template>
