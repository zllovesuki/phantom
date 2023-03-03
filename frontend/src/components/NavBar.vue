<script setup lang="ts">
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@miragespace/headlessui-vue";
import { SunIcon, MoonIcon } from "@heroicons/vue/20/solid";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";

import { computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";

import { useRuntimeStore } from "~/store/runtime";
import { useSettingStore } from "~/store/setting";
import { routes } from "~/router";

const route = useRoute();
const router = useRouter();

const runtime = useRuntimeStore();
const setting = useSettingStore();
const PaddingTop = computed<boolean>(() => {
  // padding is needed on macOS otherwise the traffic light will
  // overlap with the logo
  return runtime.environment?.platform === "darwin";
});

const navigation = routes
  .filter((r) => !!r.meta)
  .map((route) => {
    return {
      name: route.meta?.displayName,
      to: route.name,
    };
  });
</script>

<template>
  <Disclosure
    v-slot="{ open }"
    as="nav"
    class="bg-white shadow-sm dark:bg-slate-800"
  >
    <div
      :class="[
        PaddingTop ? 'pt-4' : '',
        'mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8',
      ]"
    >
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <!-- icon from https://www.svgrepo.com/svg/395450/ghost -->
            <svg
              tabindex="-1"
              width="32px"
              height="32px"
              viewBox="0 0 1024 1024"
              role="img"
              class="fill-black dark:fill-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M511.984-.128c-229.216 0-415.681 199.903-415.681 445.6v546.672c0 13.216 8.16 25.088 20.496 29.84 3.712 1.471 7.632 2.16 11.504 2.16 8.848 0 17.536-3.68 23.712-10.527l120.592-133.12 94.431 130.432a31.918 31.918 0 0 0 25.68 13.215h.224a31.98 31.98 0 0 0 25.664-12.912l94.816-127.344 93.184 127.152a31.993 31.993 0 0 0 25.809 13.088 32.028 32.028 0 0 0 25.808-13.055l95.569-130.288 118 132.624c8.816 9.904 22.944 13.376 35.28 8.624 12.4-4.72 20.624-16.624 20.624-29.905V445.456C927.696 199.776 741.2-.128 511.984-.128zm351.711 908.16l-88.402-99.376c-6.432-7.216-15.808-11.311-25.407-10.687a32.105 32.105 0 0 0-24.32 13.024l-93.12 127.008-93.008-126.912A31.975 31.975 0 0 0 513.758 798h-.127a31.935 31.935 0 0 0-25.664 12.912l-94.689 127.152-92-127.088c-5.664-7.807-14.528-12.655-24.16-13.151-.592-.032-1.151-.065-1.743-.065a31.984 31.984 0 0 0-23.712 10.528l-91.376 100.848v-463.68c0-210.4 157.776-381.601 351.68-381.601 193.937 0 351.713 171.184 351.713 381.6V908.03h.015zM671.997 352.16c-35.28 0-63.84 28.592-63.84 63.808 0 35.248 28.56 63.84 63.84 63.84s63.84-28.592 63.84-63.84c0-35.216-28.56-63.808-63.84-63.808zm-320 0c-35.28 0-63.84 28.592-63.84 63.808 0 35.248 28.576 63.84 63.84 63.84s63.84-28.592 63.84-63.84c0-35.216-28.56-63.808-63.84-63.808z"
              />
            </svg>
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <RouterLink
                v-for="nav in navigation"
                :key="nav.name"
                :to="{ name: nav.to }"
                :class="[
                  route.name === nav.to
                    ? 'bg-gray-900 text-white dark:bg-gray-700 dark:text-white'
                    : 'text-black hover:text-white dark:text-slate-300',
                  'rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-500',
                ]"
                :aria-current="route.name === nav.to ? 'page' : undefined"
                >{{ nav.name }}
              </RouterLink>
            </div>
          </div>
        </div>
        <div class="hidden md:block">
          <div class="ml-4 flex items-center md:ml-6">
            <button
              type="button"
              class="rounded-full p-1 text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:text-gray-500 dark:hover:text-gray-200"
              @click="setting.darkMode = !setting.darkMode"
            >
              <span class="sr-only">Dark mode</span>
              <SunIcon
                v-show="setting.darkMode"
                class="h-6 w-6"
                aria-hidden="true"
              />
              <MoonIcon
                v-show="!setting.darkMode"
                class="h-6 w-6"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
        <div class="-mr-2 flex md:hidden">
          <!-- Mobile menu button -->
          <DisclosureButton
            class="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 hover:bg-gray-600 hover:text-white"
          >
            <span class="sr-only">Open main menu</span>
            <Bars3Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
            <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
          </DisclosureButton>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <DisclosurePanel class="md:hidden">
      <div class="space-y-1 px-2 pt-2 pb-3 sm:px-3">
        <DisclosureButton
          v-for="nav in navigation"
          :key="nav.name"
          as="a"
          :class="[
            route.name === nav.to
              ? 'bg-gray-900 text-white dark:bg-gray-600 dark:text-white'
              : 'text-black hover:text-white dark:text-slate-300',
            'block rounded-md px-3 py-2 text-base font-medium hover:bg-gray-500',
          ]"
          :aria-current="route.name === nav.to ? 'page' : undefined"
          @click="router.push({ name: nav.to })"
          >{{ nav.name }}</DisclosureButton
        >
      </div>
      <div class="border-t border-gray-700 pt-4 pb-3">
        <div class="flex items-center px-5">
          <button
            type="button"
            class="ml-auto flex-shrink-0 rounded-full p-1 text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:text-gray-500 dark:hover:text-gray-200"
            @click="setting.darkMode = !setting.darkMode"
          >
            <span class="sr-only">Dark mode</span>
            <SunIcon
              v-show="setting.darkMode"
              class="h-6 w-6"
              aria-hidden="true"
            />
            <MoonIcon
              v-show="!setting.darkMode"
              class="h-6 w-6"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>
