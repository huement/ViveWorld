import React, {
  type FC,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSceneControls } from "../../SceneContext";
import { MetricsPanelWrapper } from "./MetricsPanel.styled";

export const MetricsPanel: FC = () => {
  const { analyser } = useSceneControls();

  // 1. Digital Telemetry State Drivers
  const [metrics, setMetrics] = useState({
    stability: 75,
    mass: "1.728",
    energy: "5.3e8 J",
    variance: "0.0042",
    peakFrequency: "0 HZ",
    amplitude: "0.00",
    phaseShift: "π/4",
  });

  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioDataBuffer = useRef<Uint8Array | null>(null);
  const freqDataBuffer = useRef<Uint8Array | null>(null);

  // 2. Drag-and-Drop Tracking Coordination
  const [position, setPosition] = useState({ x: 20, y: 80 }); // Top-Left Placement on boot
  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!isDragging) return;
    const newX = Math.max(
      10,
      Math.min(window.innerWidth - 350, e.clientX - dragStartOffset.current.x),
    );
    const newY = Math.max(
      10,
      Math.min(window.innerHeight - 450, e.clientY - dragStartOffset.current.y),
    );
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLSpanElement>) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // 3. Telemetry Mathematics Processor Loop
  const processTelemetry = useCallback(() => {
    const canvas = waveformCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Context A: Hardware Stream Engaged
    if (analyser) {
      if (
        !audioDataBuffer.current ||
        audioDataBuffer.current.length !== analyser.frequencyBinCount
      ) {
        audioDataBuffer.current = new Uint8Array(analyser.frequencyBinCount);
        freqDataBuffer.current = new Uint8Array(analyser.frequencyBinCount);
      }

      const timeData = audioDataBuffer.current;
      const freqData = freqDataBuffer.current!;

      analyser.getByteTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);

      // A1. Draw Oscilloscope Waveform Line Path
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 78, 66, 0.85)";
      ctx.lineWidth = 2;
      const sliceWidth = width / timeData.length;
      let x = 0;

      for (let i = 0; i < timeData.length; i++) {
        const v = timeData[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();

      // A2. Calculate Peak Frequencies & Metrics
      let maxValue = 0;
      let maxIndex = 0;
      let freqSum = 0;

      for (let i = 0; i < freqData.length; i++) {
        freqSum += freqData[i];
        if (freqData[i] > maxValue) {
          maxValue = freqData[i];
          maxIndex = i;
        }
      }

      const sampleRate = analyser.context.sampleRate || 44100;
      const peakFrequency =
        (maxIndex * sampleRate) / (analyser.frequencyBinCount * 2);
      const computedAmplitude = freqSum / (freqData.length * 255);
      const currentStability = Math.min(
        100,
        50 + Math.round(computedAmplitude * 80),
      );

      // Throttling structural random calculations to optimize execution
      if (Math.random() < 0.04) {
        const phases = ["π/4", "π/2", "π/6", "3π/4"];
        setMetrics({
          stability: currentStability,
          amplitude: computedAmplitude.toFixed(2),
          peakFrequency: `${Math.round(peakFrequency)} HZ`,
          mass: (1.2 + computedAmplitude * 2.5).toFixed(3),
          energy: `${(computedAmplitude * 12).toFixed(1)}e8 J`,
          variance: (computedAmplitude * 0.012).toFixed(4),
          phaseShift: phases[Math.floor(Math.random() * phases.length)],
        });
      } else {
        setMetrics((prev) => ({
          ...prev,
          stability: currentStability,
          amplitude: computedAmplitude.toFixed(2),
          peakFrequency: `${Math.round(peakFrequency)} HZ`,
        }));
      }
    }
    // Context B: Idle Scanning Simulation Mode
    else {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 78, 66, 0.4)";
      ctx.lineWidth = 1.5;
      const time = Date.now() / 800;
      const points = 80;
      const sliceWidth = width / points;
      let x = 0;

      for (let i = 0; i < points; i++) {
        const t = i / points;
        const y =
          height / 2 +
          Math.sin(t * 8 + time) * 8 +
          Math.cos(t * 15 + time * 1.6) * 4 +
          (Math.random() - 0.5) * 1.5;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();

      // Baseline ticking numbers
      if (Math.random() < 0.01) {
        setMetrics({
          stability: 70 + Math.round(Math.random() * 8),
          mass: (1.7 + Math.random() * 0.05).toFixed(3),
          energy: `${(5.1 + Math.random() * 0.4).toFixed(1)}e8 J`,
          variance: (0.004 + Math.random() * 0.0005).toFixed(4),
          peakFrequency: `${Math.round(120 + Math.random() * 15)} HZ`,
          amplitude: (0.12 + Math.random() * 0.05).toFixed(2),
          phaseShift: "π/4",
        });
      }
    }
  }, [analyser]);

  // Framerate animation render hooks
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      processTelemetry();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [processTelemetry]);

  // Setup scale resize bindings
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Determine dynamic color states for panel alerts
  const getStatusColor = () => {
    if (metrics.stability < 40) return "#ff00a0"; // Diagnostic Critical Pink
    if (metrics.stability < 68) return "#ffae00"; // Alert Yellow
    return "#ff4e42"; // Healthy UI Cyber Red
  };

  return (
    <MetricsPanelWrapper
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      <div className="metrics-analyzer">
        {/* HEADER ELEMENT - DRAGGABLE CONTROL CHANNEL */}
        <div className="metrics-header">
          <div className="flex items-center gap-1.5">
            <span style={{ color: getStatusColor(), transition: "color 0.3s" }}>
              ●
            </span>
            <span>TELEMETRY MONITOR</span>
          </div>
          <span
            className="drag-handle"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            ⋮⋮ MOVE
          </span>
        </div>

        <div className="metrics-body">
          {/* SECTION A: VECTOR STABILITYreadout */}
          <div className="flex flex-col">
            <span className="metrics-section-title">CORE MATRIX DYNAMICS</span>
            <div className="data-bar">
              <div
                className="data-bar-fill"
                style={{
                  width: `${metrics.stability}%`,
                  backgroundColor: getStatusColor(),
                }}
              ></div>
            </div>

            <div className="data-readouts">
              <div className="data-row">
                <span className="data-label">STABILITY INDEX:</span>
                <span
                  className="data-value"
                  style={{ color: getStatusColor() }}
                >
                  {metrics.stability}%
                </span>
              </div>
              <div className="data-row">
                <span className="data-label">MASS COEFFICIENT:</span>
                <span className="data-value">{metrics.mass}</span>
              </div>
              <div className="data-row">
                <span className="data-label">ENERGY SIGNATURE:</span>
                <span className="data-value">{metrics.energy}</span>
              </div>
              <div className="data-row">
                <span className="data-label">QUANTUM VARIANCE:</span>
                <span className="data-value">{metrics.variance}</span>
              </div>
            </div>
          </div>

          {/* SECTION B: SIGNAL OSCILLOSCOPE WAVEFORM */}
          <div className="flex flex-col gap-1">
            <span className="metrics-section-title">
              FREQUENCY SPEC readout
            </span>
            <div className="waveform-box">
              <canvas
                className="waveform-canvas"
                ref={waveformCanvasRef}
              ></canvas>
            </div>

            <div className="data-readouts">
              <div className="data-row">
                <span className="data-label">PEAK FREQUENCY:</span>
                <span className="data-value">{metrics.peakFrequency}</span>
              </div>
              <div className="data-row">
                <span className="data-label">AMPLITUDE:</span>
                <span className="data-value">{metrics.amplitude}</span>
              </div>
              <div className="data-row">
                <span className="data-label">PHASE SHIFT:</span>
                <span className="data-value">{metrics.phaseShift}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MetricsPanelWrapper>
  );
};
