import styled from "styled-components";

export const ControlsPanelWrapper = styled.div`
  --text-primary: #f3ede9;
  --text-secondary: #c2b8b2;
  --accent-primary: #ff4e42; /* Cyberpunk Scanner Red */
  --panel-bg: rgba(20, 18, 16, 0.85);
  --panel-border: rgba(255, 78, 66, 0.3);
  --panel-highlight: rgba(255, 78, 66, 0.1);

  position: absolute;
  z-index: 45;
  pointer-events: auto;
  user-select: none;
  font-family: monospace;

  /* FLOATING TOGGLE TRIGGER TRIGGER BUTTON */
  .trigger-btn {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 55;
    padding: 0.5rem 1rem;
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    color: var(--text-primary);
    border-radius: 4px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.2s ease-in-out;

    &:hover {
      background: var(--panel-border);
      color: white;
      box-shadow: 0 0 8px rgba(255, 78, 66, 0.3);
    }
  }

  .controls-analyzer {
    width: 320px;
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    overflow: hidden;
    backdrop-filter: blur(12px);
    color: var(--text-primary);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  }

  .controls-header {
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

    &:hover {
      background: rgba(255, 78, 66, 0.25);
    }
  }

  .controls-body {
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .panel-logo {
    height: 32px;
    width: 100%;
    object-contain: contain;
    opacity: 0.85;
    margin-bottom: 0.2rem;
    filter: drop-shadow(0px 0px 4px rgba(255, 78, 66, 0.2));
  }

  .section-title {
    font-size: 0.7rem;
    color: var(--accent-primary);
    letter-spacing: 0.5px;
    font-weight: bold;
    opacity: 0.8;
    border-bottom: 1px solid rgba(255, 78, 66, 0.15);
    padding-bottom: 0.2rem;
    margin-bottom: 0.4rem;
    text-transform: uppercase;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .control-label-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
    color: var(--text-secondary);
  }

  .control-value {
    color: var(--accent-primary);
    font-weight: bold;
  }

  /* Cyberpunk Input Components Overrides */
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

  .select-input {
    width: 100%;
    padding: 0.4rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 0.72rem;
    font-family: inherit;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;

    &:focus {
      border-color: var(--accent-primary);
    }

    option {
      background: #1a1614;
      color: var(--text-primary);
    }
  }
`;
