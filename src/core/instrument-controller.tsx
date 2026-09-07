import { createStore } from "solid-js/store";
import {
  createInstrument,
  type Instrument,
  type InstrumentOptions,
  type PlayOptions,
} from "./instrument";
import { hertz, seconds, volume } from "./units";

const MIN_HERTZ = hertz(20);
const MAX_HERTZ = hertz(20_000);
const T = MAX_HERTZ.divide(MIN_HERTZ);

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
            value={playOptions.volume.number}
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
            min={MIN_HERTZ.number}
            max={MAX_HERTZ.number}
            value={playOptions.hertz.number}
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
            value={logBase(T, playOptions.hertz.divide(MIN_HERTZ))}
            onInput={(e) =>
              setPlayOptions({
                ...playOptions,
                hertz: hertz(
                  Math.round(
                    MIN_HERTZ.multiply(Math.pow(T, parseFloat(e.target.value)))
                      .number,
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
