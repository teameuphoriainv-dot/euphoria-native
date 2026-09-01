const FADE_UP_MS = 350;
const STAGGER_MS = 70;
const FLOW_SIGNAL_START_MS = 180;
const FLOW_SIGNAL_LINK_MS = 260;
const FLOW_DOT_MS = 200;
const FLOW_RING_MS = 700;

export type MetricMotionPlan = {
  titleDelay: number;
  spriteDelay: number | null;
  valueDelay: number;
  detailDelay: number;
  duration: number;
  translateY: number;
};

export function buildMetricMotionPlan(hasSprite: boolean, reducedMotion: boolean): MetricMotionPlan {
  if (reducedMotion) {
    return {
      titleDelay: 0,
      spriteDelay: hasSprite ? 0 : null,
      valueDelay: 0,
      detailDelay: 0,
      duration: 0,
      translateY: 0,
    };
  }

  return {
    titleDelay: 0,
    spriteDelay: hasSprite ? STAGGER_MS : null,
    valueDelay: hasSprite ? STAGGER_MS * 2 : STAGGER_MS,
    detailDelay: hasSprite ? STAGGER_MS * 3 : STAGGER_MS * 2,
    duration: FADE_UP_MS,
    translateY: 10,
  };
}

export type FlowNodeMotion = {
  entranceDelay: number;
  signalDelay: number;
  dotDuration: number;
  connectorDuration: number;
  ringDuration: number;
};

export type FlowMotionPlan = {
  headerDelay: number;
  titleDelay: number;
  duration: number;
  translateY: number;
  nodes: FlowNodeMotion[];
};

export function buildFlowMotionPlan(nodeCount: number, hasHeaderSprite: boolean, reducedMotion: boolean): FlowMotionPlan {
  const count = Math.max(0, Math.floor(nodeCount));
  if (reducedMotion) {
    return {
      headerDelay: 0,
      titleDelay: 0,
      duration: 0,
      translateY: 0,
      nodes: Array.from({ length: count }, () => ({
        entranceDelay: 0,
        signalDelay: 0,
        dotDuration: 0,
        connectorDuration: 0,
        ringDuration: 0,
      })),
    };
  }

  const nodeOffset = hasHeaderSprite ? 2 : 1;
  return {
    headerDelay: 0,
    titleDelay: hasHeaderSprite ? STAGGER_MS : 0,
    duration: FADE_UP_MS,
    translateY: 10,
    nodes: Array.from({ length: count }, (_, index) => ({
      entranceDelay: (nodeOffset + index) * STAGGER_MS,
      signalDelay: FLOW_SIGNAL_START_MS + index * FLOW_SIGNAL_LINK_MS,
      dotDuration: FLOW_DOT_MS,
      connectorDuration: index === count - 1 ? 0 : FLOW_SIGNAL_LINK_MS,
      ringDuration: index === count - 1 ? FLOW_RING_MS : 0,
    })),
  };
}
