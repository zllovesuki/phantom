import { PlayIcon, StopIcon } from "@heroicons/vue/20/solid";

import { defineComponent, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";

import { useLoadingStore } from "~/store/loading";
import {
  GetPhantomConfig,
  StartForwarder,
  StopForwarder,
} from "~/wails/go/specter/Application";
import broker from "~/runtime/event";

export default defineComponent({
  Name: "ForwarderLifecycleButton",
  props: {
    listen: { type: String, required: true },
  },
  setup(props) {
    const loadingStore = useLoadingStore();
    const { loading } = storeToRefs(loadingStore);
    const { setLoading } = loadingStore;
    const started = ref(false);

    async function getForwarderIndex(): Promise<number> {
      const config = await GetPhantomConfig();
      for (const [i, l] of config.listeners.entries()) {
        if (l.listen == props.listen) {
          return i;
        }
      }
      throw new Error("forwarder does not exist");
    }

    async function toggleForwarderState() {
      try {
        setLoading(true);
        const i = await getForwarderIndex();
        if (started.value) {
          await StopForwarder(i);
        } else {
          await StartForwarder(i);
        }
      } catch (e) {
        /* empty */
      } finally {
        setLoading(false);
      }
    }

    function getEventHandler(set: boolean): (l: string) => void {
      return (l: string) => {
        if (l === props.listen) {
          started.value = set;
        }
      };
    }

    const startedHandler = getEventHandler(true);
    const stoppedHandler = getEventHandler(false);

    broker.on("forwarder:Started", startedHandler);
    broker.on("forwarder:Stopped", stoppedHandler);

    onUnmounted(() => {
      broker.off("forwarder:Started", startedHandler);
      broker.off("forwarder:Stopped", stoppedHandler);
    });

    return () => {
      const Icon = started.value ? StopIcon : PlayIcon;
      const { ...otherProps } = props;
      return (
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-gray-400 hover:text-gray-500"
          disabled={loading.value}
          onClick={toggleForwarderState}
          {...otherProps}
        >
          <span class="sr-only">Restart forwarder</span>
          <Icon class="h-5 w-5" aria-hidden="true" />
        </button>
      );
    };
  },
});
