import mitt from "mitt";

export type Events = {
  "forwarder:Started": string;
  "forwarder:Stopped": string;
  "specter:Connected": void;
  "specter:Connecting": void;
  "specter:Disconnected": void;
};

const emitter = mitt<Events>();

export default emitter;
