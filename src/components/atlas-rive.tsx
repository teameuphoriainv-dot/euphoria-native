/**
 * AtlasRive — Rive-backed Atlas mascot.
 * Loads the .riv via an Expo asset URL and drives the state-machine inputs.
 * Keep the SVG <Atlas> as fallback until this is solid (per AI_CONTEXT).
 * ponytail: url-via-expo-asset load (no native asset surgery). Swap to resourceName
 * if a production build needs the file embedded natively.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';
import { Asset } from 'expo-asset';
import Rive, { Alignment, Fit, RiveRef } from 'rive-react-native';

const RIV = require('@/assets/atlas.riv');
const DEFAULT_SM = 'State Machine 1';

export type AtlasRiveHandle = {
  /** Fire a trigger input (e.g. 'celebrate', 'happy', 'oops'). */
  fire: (trigger: string) => void;
  /** Set a boolean/number input by name. */
  setInput: (name: string, value: boolean | number) => void;
};

type Props = {
  size?: number;
  /** Omit to autoplay the file's default (used for generic .riv smoke tests). */
  stateMachineName?: string;
};

export const AtlasRive = forwardRef<AtlasRiveHandle, Props>(function AtlasRive(
  { size = 200, stateMachineName },
  ref,
) {
  const [uri, setUri] = useState<string | null>(null);
  const rive = useRef<RiveRef>(null);

  useEffect(() => {
    const asset = Asset.fromModule(RIV);
    asset
      .downloadAsync()
      .then(() => setUri(asset.localUri ?? asset.uri))
      .catch(() => {});
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      // rivemcp/Polymation .riv uses classic SM inputs -> fire by (stateMachine, trigger name).
      fire: (t) => rive.current?.fireState(stateMachineName ?? DEFAULT_SM, t),
      setInput: (n, v) => rive.current?.setInputState(stateMachineName ?? DEFAULT_SM, n, v),
    }),
    [stateMachineName],
  );

  if (!uri) return <View style={{ width: size, height: size }} />;

  return (
    <Rive
      ref={rive}
      url={uri}
      stateMachineName={stateMachineName ?? DEFAULT_SM}
      autoplay
      fit={Fit.Contain}
      alignment={Alignment.Center}
      onPlay={(name, isSM) => { if (__DEV__) console.log('[AtlasRive] onPlay', name, 'isSM:', isSM); }}
      onStateChanged={(sm, state) => { if (__DEV__) console.log('[AtlasRive] onStateChanged', sm, '->', state); }}
      onError={(err) => { if (__DEV__) console.warn('[AtlasRive] onError', JSON.stringify(err)); }}
      style={{ width: size, height: size }}
    />
  );
});
