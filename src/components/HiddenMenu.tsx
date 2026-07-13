import { useState, useRef } from "react";
import { useSceneControls } from "../SceneContext";

import logoSvg from "../assets/huement-logo.svg";

export function HiddenMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { controls, setControls, setAnalyser } = useSceneControls();
  const [trackName, setTrackName] = useState<string>("");

  // Keep a persistent reference to the active audio stream to prevent track overlapping
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTrackName(file.name);

    // 1. Clean up existing playing audio if it exists
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    // 2. Initialize the HTML5 Audio player instance
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    // 3. Set up Web Audio API Node Pipeline
    if (!audioCtxRef.current) {
      // Modern browsers require a user gesture (like a file upload click) to unlock this constructor
      audioCtxRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    const ctx = audioCtxRef.current;

    // Resume context if suspended by browser security policy
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const source = ctx.createMediaElementSource(audio);
    const newAnalyser = ctx.createAnalyser();

    // fftSize dictactes how granular our frequency cuts are (higher = more detailed data)
    newAnalyser.fftSize = 512;

    // 4. Complete the circuit connection: Source -> Analyser -> Speakers
    source.connect(newAnalyser);
    newAnalyser.connect(ctx.destination);

    // 5. Store analyser globally & fire up the audio track
    setAnalyser(newAnalyser);
    audio.play();
  };

  const handleStarCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setControls((prev) => ({
      ...prev,
      starCount: Number(e.target.value),
    }));
  };

  const handleAsteroidCountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setControls((prev) => ({
      ...prev,
      asteroidCount: Number(e.target.value),
    }));
  };

  const handleSunSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setControls((prev) => ({
      ...prev,
      sunSize: Number(e.target.value),
    }));
  };

  const handleSunPositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [x, y, z] = e.target.value.split(",").map(Number);
    setControls((prev) => ({
      ...prev,
      sunPosition: { x, y, z },
    }));
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 left-4 z-50 px-4 py-2 bg-neutral-900/80 border border-neutral-700 text-white rounded-md font-mono text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors duration-200 backdrop-blur-sm cursor-pointer"
      >
        {isOpen ? "✕ Close Menu" : "☰ Controls"}
      </button>

      {/* SLIDE-OUT SIDEBAR PANEL */}
      <div
        className={`fixed top-0 left-0 h-screen w-80 z-40 border-r border-neutral-800/80 text-white p-6 pt-20 transition-transform duration-300 ease-in-out backdrop-blur-md bg-black/50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <img
          src={logoSvg}
          alt="Cosmic Deck Logo"
          className="h-20 w-full max-w-7xl object-contain select-none pointer-events-none"
        />
        <h2 className="text-xl text-center font-mono font-bold tracking-widest border-b border-neutral-800 pb-3 uppercase text-emerald-400">
          Cosmic Deck
        </h2>

        <div className="mt-6 space-y-6 font-mono text-xs">
          {/* FUNCTIONAL AUDIO INTERFACE DECK */}
          <div className="space-y-2">
            <label className="text-neutral-400 block uppercase tracking-wider">
              Audio Deck
            </label>
            <label className="block border border-dashed border-neutral-700 rounded-md p-4 text-center cursor-pointer hover:border-emerald-500 transition-colors bg-neutral-900/40 relative overflow-hidden">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
              <span className="text-neutral-500 block truncate">
                {trackName
                  ? `🎵 ${trackName}`
                  : "Drop audio file or click to load"}
              </span>
            </label>
          </div>

          {/* Scene Controls */}
          <div className="space-y-4">
            <h3 className="text-neutral-400 uppercase tracking-wider border-b border-neutral-950 pb-1">
              Scene Tweaks
            </h3>

            {/* Star Count Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-neutral-500">
                <span>Star Count</span>
                <span>{controls.starCount}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={controls.starCount}
                onChange={handleStarCountChange}
                className="w-full accent-emerald-500 bg-neutral-800 rounded-lg appearance-none h-1 cursor-pointer"
              />
            </div>

            {/* Asteroid Count Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-neutral-500">
                <span>Asteroid Count</span>
                <span>{controls.asteroidCount}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={controls.asteroidCount}
                onChange={handleAsteroidCountChange}
                className="w-full accent-emerald-500 bg-neutral-800 rounded-lg appearance-none h-1 cursor-pointer"
              />
            </div>

            {/* Sun Size Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-neutral-500">
                <span>Sun Size</span>
                <span>{controls.sunSize.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={controls.sunSize}
                onChange={handleSunSizeChange}
                className="w-full accent-emerald-500 bg-neutral-800 rounded-lg appearance-none h-1 cursor-pointer"
              />
            </div>

            {/* Sun Position Select */}
            <div className="space-y-1">
              <label className="text-neutral-400 block uppercase tracking-wider">
                Sun Position
              </label>
              <select
                value={`${controls.sunPosition.x},${controls.sunPosition.y},${controls.sunPosition.z}`}
                onChange={handleSunPositionChange}
                className="w-full p-2 bg-neutral-900/40 border border-neutral-700 rounded-md text-neutral-300 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="-50,30,-100">Default (-50, 30, -100)</option>
                <option value="0,0,-200">Far Center (0, 0, -200)</option>
                <option value="-100,50,0">Left High (-100, 50, 0)</option>
                <option value="100,-50,0">Right Low (100, -50, 0)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
