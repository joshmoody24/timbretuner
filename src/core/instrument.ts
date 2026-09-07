import { useContext } from "solid-js";
import { AudioCtx } from "./audio-context";

export type Hertz = number & {
  __type: "hertz";
};

export function hertz(n: number): Hertz {
  return n as Hertz;
}

export type Seconds = number & {
  __type: "seconds";
};

export function seconds(n: number) {
  return n as Seconds;
}

/** Between 0 and 1, inclusive */
export type Volume = number & {
  __type: "unit-interval-value";
};

export function volume(n: number) {
  if (n > 1 || n < 0) {
    throw new Error("Volume must be between 0 and 1");
  }
  return n as Volume;
}

export interface Instrument {
  play(options: PlayOptions): void;
}

export interface InstrumentOptions {
  envelope: Adsr;
}

export interface PlayOptions {
  hertz: Hertz;
  volume: Volume;
  sustainDuration?: Seconds;
}

export interface Adsr {
  attack: Seconds;
  decay: Seconds;
  sustain: Volume;
  release: Seconds;
}

interface GainTarget {
  gain: Volume;
  t: Seconds;
}

export function createInstrument(options: InstrumentOptions): Instrument {
  const audioCtx = useContext(AudioCtx);
  const { attack, decay, sustain, release } = options.envelope;
  return {
    play(playOptions: PlayOptions) {
      const now = seconds(audioCtx.currentTime);
      const sustainDuration: Seconds =
        playOptions.sustainDuration ?? seconds(0);

      const oscillator = audioCtx.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = playOptions.hertz;

      const primaryGain = audioCtx.createGain();
      primaryGain.gain.value = playOptions.volume;
      const gain = audioCtx.createGain();
      const durations = [attack, decay, sustainDuration, release];
      const timings = durations.reduce(
        (acc, t) => [...acc, seconds(acc.at(-1)! + t)],
        [now],
      );
      const gains = [
        volume(0),
        playOptions.volume,
        sustain,
        sustain,
        volume(0),
      ];
      const [initGainTarget, ...gainTargets]: GainTarget[] = timings.map(
        (t, i) => ({
          t,
          gain: gains[i],
        }),
      );
      gain.gain.setValueAtTime(initGainTarget.gain, initGainTarget.t);
      gainTargets.forEach((gt) =>
        gain.gain.linearRampToValueAtTime(gt.gain, gt.t),
      );

      oscillator.connect(gain).connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(timings.at(-1));
    },
  };
}
