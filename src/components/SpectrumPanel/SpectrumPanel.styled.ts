import styled from "styled-components";

export const SpectrumPanelWrapper = styled.div`
  --text-primary: #f3ede9;
  --text-secondary: #c2b8b2;
  --accent-primary: #ff4e42; /* Cyberpunk Scanner Red */
  --panel-bg: rgba(20, 18, 16, 0.85);
  --panel-border: rgba(255, 78, 66, 0.3);
  --panel-highlight: rgba(255, 78, 66, 0.1);

  /* Set absolute positioning so dynamic positioning updates apply cleanly */
  position: absolute;
  z-index: 50;
  pointer-events: auto;
  user-select: none;

  .spectrum-analyzer {
    width: 400px;
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    overflow: hidden;
    backdrop-filter: blur(12px);
    font-family: monospace;
    color: var(--text-primary);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  }

  .spectrum-header {
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
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 78, 66, 0.25);
    }
  }

  .spectrum-content {
    padding: 0.8rem;
    position: relative;
  }

  .spectrum-canvas {
    width: 100%;
    height: 110px;
    display: block;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 78, 66, 0.1);
    border-radius: 4px;
  }

  .audio-controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0 0.8rem 0.8rem;
  }

  .audio-controls-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    letter-spacing: 1px;
  }

  /* File Drop Box styling */
  .uploader-card {
    display: block;
    border: 1px dashed rgba(255, 78, 66, 0.4);
    border-radius: 4px;
    padding: 0.75rem;
    text-align: center;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease-in-out;

    &:hover {
      border-color: var(--accent-primary);
      background: rgba(255, 78, 66, 0.05);
    }
  }

  .audio-player-element {
    display: none; /* Keep the native audio node completely hidden */
  }

  .sensitivity-container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }

  .sensitivity-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: var(--text-secondary);
  }

  .slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    outline: none;
    border-radius: 2px;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    box-shadow: 0 0 6px var(--accent-primary);
  }
`;
