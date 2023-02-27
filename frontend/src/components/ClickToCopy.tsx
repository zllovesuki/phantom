import { ClipboardIcon } from "@heroicons/vue/20/solid";

import { defineComponent, ref, type Ref } from "vue";
import { createPopper, type Instance } from "@popperjs/core";
import { SetClipboardText } from "~/wails/go/specter/Helper";
import { LogDebug } from "~/wails/runtime/runtime";

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

    async function setClipboard(s: string): Promise<boolean> {
      if (navigator.clipboard) {
        LogDebug("clipboard vis browser");
        const type = "text/plain";
        const blob = new Blob([s], { type });
        const data = [new ClipboardItem({ [type]: blob })];

        await navigator.clipboard.write(data);
        return true;
      }
      const os = await SetClipboardText(s);
      if (os) {
        LogDebug("clipboard vis os");
      }
      return os;
    }

    async function showTooltip() {
      const ok = await setClipboard(props.content);
      if (!ok) {
        return;
      }
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
            class={["cursor-pointer"].join(" ")}
            onClick={showTooltip}
            onMouseleave={hideTooltip}
            {...otherProps}
          >
            {content} <ClipboardIcon class="inline-block h-3 w-3" />
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
