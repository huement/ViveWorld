import React, {
  type FC,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  Play as PlayIcon,
  CaretBigRight as NextIcon,
  CaretBigLeft as PrevIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
} from "@boxicons/react";

import { useSceneControls } from "../../SceneContext";
import { SpectrumPanelWrapper } from "./SpectrumPanel.styled";
import defaultTrack from "../../assets/techno.mp3";

const SpectrumPanel: FC = () => {
  // 1. Read Global Shared Scene Controls
  const { analyser, setAnalyser } = useSceneControls();

  // Local Media Control States
  const [trackName, setTrackName] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioSensitivity, setAudioSensitivity] = useState(5.0);

  // Structural Workspace References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frequencyDataRef = useRef<Uint8Array | null>(null);

  // 2. 🟢 INTERACTIVE DRAG-AND-DROP COORDINATION ENGINE
  // Automatically locations panel near the bottom right quadrant of screen on initialize
  const [position, setPosition] = useState({
    x: window.innerWidth - 440,
    y: window.innerHeight - 340,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    setIsDragging(true);
    // Calculate precise offset difference between clicking location and wrapper position
    dragStartOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!isDragging) return;
    // Bound current tracking coordinates to ensure interface container can't fly completely offscreen
    const newX = Math.max(
      10,
      Math.min(window.innerWidth - 410, e.clientX - dragStartOffset.current.x),
    );
    const newY = Math.max(
      10,
      Math.min(window.innerHeight - 330, e.clientY - dragStartOffset.current.y),
    );
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLSpanElement>) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // 3. CORE HARDWARE AUDIO PIPELINE INITIALIZER
  const initAudioPipeline = useCallback(
    (audioUrl: string, displayName: string) => {
      setTrackName(displayName);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      const audio = new Audio(audioUrl);
      audio.crossOrigin = "anonymous";
      audio.loop = true;
      audioRef.current = audio;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      }
      const ctx = audioCtxRef.current;

      const source = ctx.createMediaElementSource(audio);
      const newAnalyser = ctx.createAnalyser();
      newAnalyser.fftSize = 512; // Adjusted granularity for clean layout visualization
      newAnalyser.smoothingTimeConstant = 0.75;

      source.connect(newAnalyser);
      newAnalyser.connect(ctx.destination);

      frequencyDataRef.current = new Uint8Array(newAnalyser.frequencyBinCount);

      // Share analyzer node reference globally so the 3D meshes instantly respond
      setAnalyser(newAnalyser);

      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          console.log(
            "🔊 Autoplay intercepted. Controls operational on your first interface gesture.",
          );
          const unlockAudio = () => {
            ctx.resume().then(() => {
              audio.play();
              setIsPlaying(true);
              window.removeEventListener("click", unlockAudio);
            });
          };
          window.addEventListener("click", unlockAudio);
        });
    },
    [setAnalyser],
  );

  // Dev Env Auto-Mount Loop
  useEffect(() => {
    const timer = setTimeout(() => {
      initAudioPipeline(defaultTrack, "techno.mp3");
    }, 0);

    return () => {
      clearTimeout(timer);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [initAudioPipeline]);

  // Media Player Actions
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const audioUrl = URL.createObjectURL(file);
    initAudioPipeline(audioUrl, file.name);
  };

  const handlePlay = () => {
    if (!audioRef.current) return;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  // 4. GRAPH CANVA RECT RENDERER (Reads directly from the unified analyser variable)
  const drawSpectrumAnalyzer = useCallback(() => {
    const canvas = spectrumCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    const frequencyData = frequencyDataRef.current;

    if (!ctx || !canvas || !analyser || !frequencyData) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Extract dynamic frequencies
    analyser.getByteFrequencyData(frequencyData as unknown as Uint8Array<ArrayBuffer>);

    const activeBins = 80; // Limit rendering visualization to audio payload bounds
    const barWidth = width / activeBins;
    let x = 0;

    for (let i = 0; i < activeBins; i++) {
      // Calculate layout metric multipliers fed by our local sensitivity slider
      const barHeight =
        (frequencyData[i] / 255) * height * (audioSensitivity / 4);

      ctx.fillStyle = "rgba(255, 78, 66, 0.85)";
      ctx.fillRect(x, height - barHeight, barWidth - 1.5, barHeight);
      x += barWidth;
    }

    // Grid Matrix Line Draw Layers
    ctx.strokeStyle = "rgba(255, 78, 66, 0.12)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = height * (i / 4);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let i = 0; i < 9; i++) {
      const lx = width * (i / 8);
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, height);
      ctx.stroke();
    }
  }, [analyser, audioSensitivity]);

  // Framerate execution loop trigger hook
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      drawSpectrumAnalyzer();
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [drawSpectrumAnalyzer]);

  useEffect(() => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <SpectrumPanelWrapper
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      <div className="spectrum-analyzer">
        {/* HEADER AREA - Captures Pointer Drag Lifecycle Controls */}
        <div className="spectrum-header">
          <span>AUDIO COMMAND CONSOLE</span>
          <span
            className="drag-handle"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {isDragging ? "✊ DRAG" : "⋮⋮ MOVE"}
          </span>
        </div>

        <div className="spectrum-content">
          <canvas className="spectrum-canvas" ref={spectrumCanvasRef}></canvas>
        </div>

        {/* INTEGRATED MASTER AUDIO CONTROLS DECK */}
        <div className="audio-controls">
          <label className="audio-controls-label uppercase tracking-wider block">
            Audio Feed
          </label>

          <label className="uploader-card">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
            />
            <span className="text-neutral-400 block truncate text-xs">
              {trackName ? `🎵 ${trackName}` : "DROP TRACK OR CLICK TO DEPLOY"}
            </span>
          </label>

          {/* Unified hardware deck button cluster layout row */}
          <div className="grid grid-cols-5 gap-1 bg-neutral-950/80 p-1 border border-neutral-800 rounded">
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime -= 5;
              }}
              className="flex items-center justify-center p-2 rounded bg-neutral-900/40 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer border border-neutral-800/40"
              title="-5s"
            >
              <PrevIcon className="w-3.5 h-3.5" />
            </button>

            {isPlaying ? (
              <button
                onClick={handlePause}
                className="flex items-center justify-center p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
                title="Pause"
              >
                <PauseIcon className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handlePlay}
                className="flex items-center justify-center p-2 rounded bg-neutral-900/40 text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-all cursor-pointer border border-neutral-800/40"
                title="Play"
              >
                <PlayIcon className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleStop}
              className="flex items-center justify-center p-2 rounded bg-neutral-900/40 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-all cursor-pointer border border-neutral-800/40"
              title="Stop"
            >
              <StopIcon className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime += 5;
              }}
              className="flex items-center justify-center p-2 rounded bg-neutral-900/40 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer border border-neutral-800/40"
              title="+5s"
            >
              <NextIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sensitivity Modifier Bar */}
          <div className="sensitivity-container">
            <div className="sensitivity-header">
              <span>DECK GAIN SENSITIVITY</span>
              <span className="audio-sensitivity-value">
                {audioSensitivity.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={audioSensitivity}
              step="0.1"
              className="slider"
              onChange={(e) => setAudioSensitivity(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </SpectrumPanelWrapper>
  );
};

export default SpectrumPanel;
