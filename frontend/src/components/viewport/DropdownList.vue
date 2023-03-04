<script lang="ts" setup>
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  TransitionRoot,
} from "@miragespace/headlessui-vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";
import { computed } from "vue";

export interface DropdownOption {
  Value: string;
  Text?: string;
}

const props = withDefaults(
  defineProps<{
    value: DropdownOption;
    options: DropdownOption[];
    styles: string;
    limitHeight?: boolean;
    disabled?: boolean;
  }>(),
  {
    limitHeight: false,
    disabled: false,
  }
);

const emit = defineEmits<{
  (event: "update:value", s: DropdownOption): void;
}>();

const Selected = computed({
  get() {
    return props.value;
  },
  set(v) {
    emit("update:value", v);
  },
});
</script>

<template>
  <Listbox v-model="Selected" as="div" :disabled="disabled">
    <div class="relative">
      <ListboxButton
        :class="[
          styles,
          disabled ? 'text-gray-400' : 'text-black dark:text-white',
          'relative cursor-default rounded-md border border-gray-300 bg-gray-100 py-3 pl-3 pr-8 text-left text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-500 dark:bg-slate-700',
        ]"
      >
        <span class="block">{{ Selected.Text ?? Selected.Value }}</span>
        <span
          class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1"
        >
          <ChevronUpDownIcon
            v-show="!disabled"
            class="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </span>
      </ListboxButton>

      <TransitionRoot
        leave-active="transition ease-in duration-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <ListboxOptions
          :class="[
            limitHeight ? 'max-h-20' : 'max-h-60',
            'py1 absolute mt-1 w-full overflow-y-auto bg-gray-50 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700',
            'scrollbar-thin scrollbar-track-white scrollbar-thumb-gray-700 dark:scrollbar-track-slate-800 dark:scrollbar-thumb-slate-700',
          ]"
        >
          <ListboxOption
            v-for="option in options"
            :key="option.Value"
            v-slot="{ active, selected }"
            :value="option"
            as="template"
          >
            <li
              :class="[
                active
                  ? 'bg-gray-200 dark:bg-slate-500 dark:text-white'
                  : 'dark:text-white',
                'relative cursor-default select-none py-2 pl-3 pr-7 text-xs sm:text-sm',
              ]"
            >
              <span
                :class="[selected ? 'font-semibold' : 'font-light', 'block']"
              >
                {{ option.Text ?? option.Value }}
              </span>

              <span
                v-if="selected"
                :class="[
                  active ? 'dark:text-white' : 'dark:text-white',
                  'absolute inset-y-0 right-0 flex items-center pr-3',
                ]"
              >
                <CheckIcon class="h-4 w-4" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </TransitionRoot>
    </div>
  </Listbox>
</template>
