import { SignalIcon, SignalSlashIcon } from "@heroicons/vue/20/solid";

import { defineComponent, ref, onMounted, onUnmounted } from "vue";

import { ForwarderStarted } from "~/wails/go/phantom/Application";
import broker from "~/events";

export default defineComponent({
  Name: "ForwarderStatusIndicator",
  props: {
    listen: { type: String, required: true },
  },
  setup(props) {
    const started = ref(false);

    function getEventHandler(set: boolean): (l: string) => void {
      return (l: string) => {
        if (l === props.listen) {
          started.value = set;
        }
      };
    }

    const startedHandler = getEventHandler(true);
    const stoppedHandler = getEventHandler(false);

    onMounted(() => {
      broker.on("forwarder:Started", startedHandler);
      broker.on("forwarder:Stopped", stoppedHandler);

      ForwarderStarted(props.listen).then((s) => {
        if (s) {
          broker.emit("forwarder:Started", props.listen);
        } else {
          broker.emit("forwarder:Stopped", props.listen);
        }
      });
    });

    onUnmounted(() => {
      broker.off("forwarder:Started", startedHandler);
      broker.off("forwarder:Stopped", stoppedHandler);
    });

    return () => {
      const Icon = started.value ? SignalIcon : SignalSlashIcon;
      const { ...otherProps } = props;
      return (
        <Icon
          class={[
            "inline-block",
            started.value
              ? "text-green-500 dark:text-green-400"
              : "text-red-500 dark:text-red-500",
          ].join(" ")}
          {...otherProps}
        />
      );
    };
  },
});
