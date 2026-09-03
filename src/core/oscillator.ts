import { createEffect, createRoot, createSignal, useContext } from "solid-js";
import { AudioCtx } from "./audio-context";

export interface Oscillator {
  hertz: number;
  volume: number;
  active: boolean;
  setHertz(hz: number): void;
  setVolume(volume: number): void;
  setActive(active: boolean): void;
  destroy(): void;
}

const MIDDLE_A_HERTZ = 440;
const DEFAULT_GAIN = 0.3;

export function createOscillator(): Oscillator {
  const audioCtx = useContext(AudioCtx);
  const o = audioCtx.createOscillator();
  o.type = "sine";
  const gain = audioCtx.createGain();
  o.connect(gain).connect(audioCtx.destination);
  o.start();

  const state = createRoot((dispose) => {
    const [hertz, setHertz] = createSignal(MIDDLE_A_HERTZ);
    const [volume, setVolume] = createSignal(DEFAULT_GAIN);
    const [active, setActive] = createSignal(true);

    createEffect(() => (o.frequency.value = hertz()));
    createEffect(() => (gain.gain.value = !active() ? 0 : volume()));

    return {
      dispose,
      hertz,
      setHertz,
      volume,
      setVolume,
      active,
      setActive,
    };
  });

  return {
    ...state,
    get hertz() {
      return state.hertz();
    },
    get volume() {
      return state.volume();
    },
    get active() {
      return state.active();
    },
    destroy() {
      state.dispose();
      o.stop();
      [o, gain].forEach((node) => node.disconnect());
    },
  };
}
