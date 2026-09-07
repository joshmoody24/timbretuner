import { useContext } from "solid-js";
import { AudioCtx } from "./audio-context";
import {
  seconds,
  volume,
  type Hertz,
  type Seconds,
  type Volume,
} from "./units";

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
      oscillator.frequency.value = playOptions.hertz.number;

      const primaryGain = audioCtx.createGain();
      primaryGain.gain.value = playOptions.volume.number;
      const gain = audioCtx.createGain();
      const durations = [attack, decay, sustainDuration, release];
      const timings = durations.reduce(
        (acc, t) => [...acc, acc.at(-1)!.add(t)],
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
      gain.gain.setValueAtTime(
        initGainTarget.gain.number,
        initGainTarget.t.number,
      );
      gainTargets.forEach((gt) =>
        gain.gain.linearRampToValueAtTime(gt.gain.number, gt.t.number),
      );

      oscillator.connect(gain).connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(timings.at(-1)!.number);
    },
  };
}
