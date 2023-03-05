import { PlayIcon, StopIcon } from "@heroicons/vue/20/solid";
import ConfirmModal from "~/components/viewport/ConfirmModal.vue";

import { defineComponent, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";

import {
  GetPhantomConfig,
  StartForwarder,
  StopForwarder,
} from "~/wails/go/phantom/Application";
import broker from "~/events";
import { useAlertStore } from "~/store/alert";
import { useLoadingStore } from "~/store/loading";

export default defineComponent({
  Name: "ForwarderLifecycleButton",
  props: {
    listen: { type: String, required: true },
  },
  setup(props) {
    const loadingStore = useLoadingStore();
    const { setLoading } = loadingStore;
    const { showAlert, hideAlert } = useAlertStore();

    const { loading: Loading } = storeToRefs(loadingStore);
    const confirmStopModalOpen = ref(false);
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
        hideAlert();
        setLoading(true);
        const i = await getForwarderIndex();
        if (started.value) {
          await StopForwarder(i);
        } else {
          await StartForwarder(i);
        }
      } catch (e) {
        showAlert(
          "fail",
          `Error ${started.value ? "stopping" : "starting"} forwarder: ${
            e as string
          }`
        );
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
        <span>
          <button
            type="button"
            class={[
              "inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-gray-400",
              !Loading.value ? "hover:text-gray-500" : "cursor-not-allowed",
            ].join(" ")}
            disabled={Loading.value}
            onClick={() => {
              started.value
                ? (confirmStopModalOpen.value = true)
                : toggleForwarderState();
            }}
            {...otherProps}
          >
            <span class="sr-only">Restart forwarder</span>
            <Icon class="h-5 w-5" aria-hidden="true" />
          </button>
          <ConfirmModal
            show={confirmStopModalOpen.value}
            title="Stopping Forwarder"
            descriptions={[
              "Are you sure you want to stop this forwarder?",
              "All established connections will be disconnected.",
            ]}
            onConfirmed={toggleForwarderState}
            onUpdate:show={(v: boolean) => {
              confirmStopModalOpen.value = v;
            }}
          />
        </span>
      );
    };
  },
});
