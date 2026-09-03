import { For, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { createOscillator, type Oscillator } from "./oscillator";

const MIN_HERTZ = 20;
const MAX_HERTZ = 20_000;
const T = MAX_HERTZ / MIN_HERTZ;

export function TimbreController() {
  const [oscillators, setOscillators] = createStore<Oscillator[]>([]);

  onCleanup(() => oscillators.forEach((o) => o.destroy));

  return (
    <div>
      <For each={oscillators}>
        {(o, i) => (
          <div>
            <button
              onClick={() => (
                o.destroy(),
                setOscillators((x) => x.filter((_, j) => j !== i()))
              )}
            >
              X
            </button>
            <div>
              Frequency: <output>{Math.round(o.hertz)}</output>
            </div>
            <div>
              <input
                type="range"
                id={`osc-vol-slidier-${i}`}
                min={0}
                max={1}
                step={0.01}
                value={o.volume}
                onInput={(e) => o.setVolume(parseFloat(e.target.value))}
                style={{ "writing-mode": "vertical-lr", direction: "rtl" }}
              />
              <input
                id={`osc-freq-number-${i}`}
                type="number"
                min={MIN_HERTZ}
                max={MAX_HERTZ}
                value={o.hertz}
                onInput={(e) => o.setHertz(parseInt(e.target.value))}
              />
              <input
                id={`osc-freq-slider-${i}`}
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={logBase(T, o.hertz / MIN_HERTZ)}
                onInput={(e) =>
                  o.setHertz(
                    Math.round(
                      MIN_HERTZ * Math.pow(T, parseFloat(e.target.value)),
                    ),
                  )
                }
              />
              <button onClick={() => o.setActive(!o.active)}>
                {o.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        )}
      </For>
      <div>
        <button
          onClick={() =>
            setOscillators((prev) => [...prev, createOscillator()])
          }
        >
          Add Oscillator
        </button>
      </div>
    </div>
  );
}

function logBase(base: number, value: number) {
  return Math.log(value) / Math.log(base);
}
