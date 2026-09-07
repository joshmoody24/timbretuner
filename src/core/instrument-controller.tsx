import { createStore } from "solid-js/store";
import {
  createInstrument,
  hertz,
  seconds,
  volume,
  type Instrument,
  type InstrumentOptions,
  type PlayOptions,
} from "./instrument";

const MIN_HERTZ = 20;
const MAX_HERTZ = 20_000;
const T = MAX_HERTZ / MIN_HERTZ;

const DEFAULT_INSTRUMENT: InstrumentOptions = {
  envelope: {
    attack: seconds(0),
    decay: seconds(0.5),
    sustain: volume(0.1),
    release: seconds(0.2),
  },
};

const DEFAULT_PLAY_OPTIONS: PlayOptions = {
  hertz: hertz(440),
  volume: volume(0.5),
};

export function TimbreController() {
  const [instrument, setInstrument] = createStore<Instrument>(
    createInstrument(DEFAULT_INSTRUMENT),
  );
  const [playOptions, setPlayOptions] =
    createStore<PlayOptions>(DEFAULT_PLAY_OPTIONS);

  return (
    <div>
      <div>
        <button onClick={() => instrument.play(playOptions)}>Play</button>
        <div>
          <input
            type="range"
            id={`volume-slider`}
            min={0}
            max={1}
            step={0.01}
            value={playOptions.volume}
            onInput={(e) =>
              setPlayOptions({
                ...playOptions,
                volume: volume(parseFloat(e.target.value)),
              })
            }
            style={{ "writing-mode": "vertical-lr", direction: "rtl" }}
          />
          <input
            id={`hertz-number`}
            type="number"
            min={MIN_HERTZ}
            max={MAX_HERTZ}
            value={playOptions.hertz}
            onInput={(e) =>
              setPlayOptions({
                ...playOptions,
                hertz: hertz(parseInt(e.target.value)),
              })
            }
          />
          <input
            id={`hertz-slider`}
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={logBase(T, playOptions.hertz / MIN_HERTZ)}
            onInput={(e) =>
              setPlayOptions({
                ...playOptions,
                hertz: hertz(
                  Math.round(
                    MIN_HERTZ * Math.pow(T, parseFloat(e.target.value)),
                  ),
                ),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

function logBase(base: number, value: number) {
  return Math.log(value) / Math.log(base);
}
