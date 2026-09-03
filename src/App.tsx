import { createSignal } from "solid-js";
import { AudioCtx } from "./core/audio-context";
import heroImg from "./assets/hero.png";
import solidLogo from "./assets/solid.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";
import { TimbreController } from "./core/timbre-controller";

function App() {
  return (
    <AudioCtx.Provider value={new AudioContext()}>
      <section id="center">
        <div class="hero">
          <img src={heroImg} class="base" width="170" height="179" alt="" />
          <img src={solidLogo} class="framework" alt="Solid logo" />
          <img src={viteLogo} class="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <TimbreController />
        </div>
      </section>
    </AudioCtx.Provider>
  );
}

export default App;
