import { defineComponent, ref, type Ref } from "vue";
import { createPopper, type Instance } from "@popperjs/core";
import { SetClipboardText } from "~/wails/go/specter/Helper";

export default defineComponent({
  name: "ClickToCopy",
  props: {
    as: { type: String, required: true },
    content: { type: String, required: true },
  },
  setup(props) {
    const popper = ref<Instance>();
    const btnRef = ref() as Ref<Element>;
    const tooltipRef = ref() as Ref<HTMLElement>;
    const tooltipShow = ref(false);

    async function showTooltip() {
      await SetClipboardText(props.content);
      popper.value = createPopper(btnRef.value, tooltipRef.value, {
        placement: "top",
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 5],
            },
          },
        ],
      });
      tooltipShow.value = true;
    }

    function hideTooltip() {
      setTimeout(() => {
        tooltipShow.value = false;
        if (popper.value) {
          popper.value.destroy();
          popper.value = undefined;
        }
      }, 200);
    }

    return () => {
      const { as, content, ...otherProps } = props;
      return (
        <span>
          <as
            ref={btnRef}
            class={["cursor-pointer", "after:content-['_📋']"].join(" ")}
            onClick={showTooltip}
            onMouseleave={hideTooltip}
            {...otherProps}
          >
            {content}
          </as>
          <div
            ref={tooltipRef}
            class={[
              tooltipShow.value ? "visible" : "hidden",
              "bg-gray-100 dark:bg-slate-900",
              "text-gray-900 dark:text-white",
              "z-50 block rounded-md p-2",
              "break-words text-center text-xs font-normal leading-normal no-underline",
              "border border-gray-300 dark:border-gray-600",
            ].join(" ")}
          >
            Copied!
          </div>
        </span>
      );
    };
  },
});
