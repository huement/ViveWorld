import styled from "styled-components";

export const MetricsPanelWrapper = styled.div`
  --text-primary: #f3ede9;
  --text-secondary: #c2b8b2;
  --accent-primary: #ff4e42; /* Cyberpunk Red Scanner Highlight */
  --panel-bg: rgba(20, 18, 16, 0.85);
  --panel-border: rgba(255, 78, 66, 0.3);
  --panel-highlight: rgba(255, 78, 66, 0.1);

  position: absolute;
  z-index: 50;
  pointer-events: auto;
  user-select: none;

  .metrics-analyzer {
    width: 340px;
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    overflow: hidden;
    backdrop-filter: blur(12px);
    font-family: monospace;
    color: var(--text-primary);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  }

  .metrics-header {
    padding: 0.625rem 0.8rem;
    background: rgba(0, 0, 0, 0.5);
    font-size: 0.75rem;
    color: var(--accent-primary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    letter-spacing: 1.5px;
    border-bottom: 1px solid var(--panel-border);
  }

  .drag-handle {
    cursor: move;
    padding: 0.2rem 0.5rem;
    background: rgba(255, 78, 66, 0.1);
    border-radius: 3px;
    font-weight: bold;
    font-size: 0.85rem;
  }

  .metrics-body {
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .metrics-section-title {
    font-size: 0.7rem;
    color: var(--accent-primary);
    letter-spacing: 0.5px;
    font-weight: bold;
    opacity: 0.8;
  }

  /* Progress Bar Layouts */
  .data-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    position: relative;
    border-radius: 3px;
    margin: 0.2rem 0;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .data-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition:
      width 0.1s ease-out,
      background-color 0.3s ease;
  }

  /* Oscilloscope Waveform Canvas */
  .waveform-box {
    width: 100%;
    height: 60px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 78, 66, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .waveform-canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  /* Digital Readout Matrix grids */
  .data-readouts {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    background: rgba(0, 0, 0, 0.15);
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.02);
  }

  .data-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
    line-height: 1.2;
  }

  .data-label {
    color: var(--text-secondary);
  }

  .data-value {
    color: var(--text-primary);
    font-weight: bold;
  }
`;
