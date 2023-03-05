import { AdjustmentsVerticalIcon } from "@heroicons/vue/20/solid";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@miragespace/headlessui-vue";
import { Float } from "@headlessui-float/vue";

import { defineComponent } from "vue";

import broker from "~/events";

export default defineComponent({
  name: "DevMenu",
  setup() {
    return () => {
      if (import.meta.env.PROD) {
        return <div></div>;
      }
      return (
        <Popover class="fixed bottom-12 right-12">
          <Float placement="top-end">
            <PopoverButton class="flex h-6 w-6 items-center justify-center rounded text-rose-700 hover:text-rose-500">
              <AdjustmentsVerticalIcon />
            </PopoverButton>

            <PopoverPanel class="h-[125px] w-[170px] items-center rounded-md border border-gray-500 bg-gray-50 p-2 shadow-md focus:outline-none dark:bg-slate-800/50">
              <button
                class="my-1 rounded-md px-3 py-1 text-sm font-medium text-black hover:bg-gray-500 hover:text-white dark:text-slate-300"
                onClick={() => {
                  broker.emit("dev:RestoreState");
                }}
              >
                Populate State
              </button>
              <button
                class="my-1 rounded-md px-3 py-1 text-sm font-medium text-black hover:bg-gray-500 hover:text-white dark:text-slate-300"
                onClick={() => {
                  broker.emit("dev:EmptyState");
                }}
              >
                Empty State
              </button>
              <button
                class="my-1 rounded-md px-3 py-1 text-sm font-medium text-black hover:bg-gray-500 hover:text-white dark:text-slate-300"
                onClick={() => {
                  broker.emit("dev:AddState");
                }}
              >
                Add State
              </button>
            </PopoverPanel>
          </Float>
        </Popover>
      );
    };
  },
});
