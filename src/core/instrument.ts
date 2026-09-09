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
  play(options: Note): void;
}

export interface SimpleInstrumentDefinition {
  envelope: Adsr;
}

export interface InstrumentDefinition extends SimpleInstrumentDefinition {
  overtones(tone: ToneDefinition): ToneDefinition[];
}

export interface Note {
  hertz: Hertz;
  volume: Volume;
  sustainDuration?: Seconds;
}

export interface ToneDefinition {
  instrument: SimpleInstrumentDefinition;
  note: Note;
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

export function createInstrument(instrument: InstrumentDefinition): Instrument {
  return {
    play(note: Note) {
      const overtones = instrument.overtones({ instrument, note });
      const tones = [{ instrument, note }, ...overtones];
      tones.forEach((t) => playSimpleInstrument(t.instrument, t.note));
      playSimpleInstrument(instrument, note);
    },
  };
}

function playSimpleInstrument(
  instrument: SimpleInstrumentDefinition,
  note: Note,
) {
  const audioCtx = useContext(AudioCtx);
  const now = seconds(audioCtx.currentTime);
  const sustainDuration: Seconds = note.sustainDuration ?? seconds(0);

  const oscillator = audioCtx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = note.hertz.number;

  const primaryGain = audioCtx.createGain();
  primaryGain.gain.value = note.volume.number;
  const gain = audioCtx.createGain();
  const { attack, decay, sustain, release } = instrument.envelope;
  const durations = [attack, decay, sustainDuration, release];
  const timings = durations.reduce(
    (acc, t) => [...acc, acc.at(-1)!.add(t)],
    [now],
  );
  const gains = [volume(0), note.volume, sustain, sustain, volume(0)];
  const [initGainTarget, ...gainTargets]: GainTarget[] = timings.map(
    (t, i) => ({
      t,
      gain: gains[i],
    }),
  );
  gain.gain.setValueAtTime(initGainTarget.gain.number, initGainTarget.t.number);
  gainTargets.forEach((gt) =>
    gain.gain.linearRampToValueAtTime(gt.gain.number, gt.t.number),
  );

  oscillator.connect(gain);
  gain.connect(primaryGain);
  primaryGain.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(timings.at(-1)!.number);
}
