import { defineComponent, type FunctionalComponent, type PropType } from "vue";

export default defineComponent({
  name: "NewEntryCard",
  props: {
    icon: {
      type: Function as PropType<FunctionalComponent>,
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
      const { icon: Icon, disabled, description } = props;
      return (
        <li class="col-span-1 flex rounded-lg shadow-sm">
          <div class="flex flex-1 items-center justify-between rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-500 dark:border-gray-800 dark:hover:border-gray-500">
            <button
              type="button"
              class="relative block w-full rounded-md p-2 text-center focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={disabled}
              onClick={(ev) => {
                ev.preventDefault();
                emit("triggered");
              }}
            >
              <span class="mt-2 inline pr-2 text-sm font-medium">
                {description}
              </span>
              <Icon class="mx-auto inline h-8 w-8 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </li>
      );
    };
  },
});
