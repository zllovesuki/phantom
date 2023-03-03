import {
  ArrowRightOnRectangleIcon,
  ServerIcon,
} from "@heroicons/vue/24/outline";
import { defineComponent, type FunctionalComponent, type PropType } from "vue";

// how do I pass a component as prop so I don't have to do this?
const ALL_ICONS = ["ArrowRightOnRectangleIcon", "ServerIcon"] as const;
export type IconName = (typeof ALL_ICONS)[number];

const icons: Record<IconName, FunctionalComponent> = {
  ArrowRightOnRectangleIcon,
  ServerIcon,
};

export default defineComponent({
  name: "FullWidthCTA",
  props: {
    icon: {
      type: String as PropType<IconName>,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["triggered"],
  setup(props, { emit }) {
    return () => {
      const Icon = icons[props.icon];
      return (
        <button
          type="button"
          class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-500"
          disabled={props.disabled}
          onClick={(ev) => {
            ev.preventDefault();
            emit("triggered");
          }}
        >
          <Icon class="mx-auto h-10 w-10 text-gray-500 dark:text-gray-400" />
          <span class="mt-2 block text-base font-medium">
            {props.description}
          </span>
        </button>
      );
    };
  },
});
