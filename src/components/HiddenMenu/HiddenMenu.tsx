import React, { useState, useRef } from "react";
import { useSceneControls } from "../../SceneContext";
import { ControlsPanelWrapper } from "./HiddenMenu.styled";
import logoSvg from "../../assets/huement-logo.svg";

export function HiddenMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { controls, setControls } = useSceneControls();

  // 1. Interactive Pointer Drag-and-Drop Management
  // Sets default initial console layout positioning offset clear of other items
  const [position, setPosition] = useState({ x: 380, y: 20 });
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
      Math.min(window.innerWidth - 330, e.clientX - dragStartOffset.current.x),
    );
    const newY = Math.max(
      10,
      Math.min(window.innerHeight - 350, e.clientY - dragStartOffset.current.y),
    );
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLSpanElement>) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // 2. State Input Change Interceptors
  const handleStarCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setControls((prev) => ({ ...prev, starCount: Number(e.target.value) }));
  };

  const handleAsteroidCountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setControls((prev) => ({ ...prev, asteroidCount: Number(e.target.value) }));
  };

  const handleSunSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setControls((prev) => ({ ...prev, sunSize: Number(e.target.value) }));
  };

  const handleSunPositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [x, y, z] = e.target.value.split(",").map(Number);
    setControls((prev) => ({ ...prev, sunPosition: { x, y, z } }));
  };

  return (
    <ControlsPanelWrapper
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      {/* PERSISTENT FLOATING CONTROLS TOGGLE TRIGGER */}
      <button onClick={() => setIsOpen(!isOpen)} className="trigger-btn">
        {isOpen ? "✕ HIDE METRICS" : "☰ SCENE CONFIG"}
      </button>

      {/* RENDER SYSTEM PANEL ONLY IF VISIBILITY OPEN IS ACTIVE */}
      {isOpen && (
        <div className="controls-analyzer">
          {/* HEADER LAYER - POINTER CAPTURE TRACKER */}
          <div className="controls-header">
            <span>SCENE CONSOLE</span>
            <span
              className="drag-handle"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              ⋮⋮ MOVE
            </span>
          </div>

          <div className="controls-body">
            <img
              src={logoSvg}
              alt="Cosmic Logo"
              className="panel-logo select-none pointer-events-none"
            />

            <div className="section-title">Matrix Configurations</div>

            {/* Star Count Modifier */}
            <div className="control-group">
              <div className="control-label-row">
                <span>STAR DEBRIS DENSITY</span>
                <span className="control-value">{controls.starCount}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={controls.starCount}
                onChange={handleStarCountChange}
                className="slider"
              />
            </div>

            {/* Asteroid Count Modifier */}
            <div className="control-group">
              <div className="control-label-row">
                <span>ASTEROID FIELD THICKNESS</span>
                <span className="control-value">{controls.asteroidCount}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={controls.asteroidCount}
                onChange={handleAsteroidCountChange}
                className="slider"
              />
            </div>

            {/* Sun Size Modifier */}
            <div className="control-group">
              <div className="control-label-row">
                <span>STELLAR MASS SCALE</span>
                <span className="control-value">
                  {controls.sunSize.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={controls.sunSize}
                onChange={handleSunSizeChange}
                className="slider"
              />
            </div>

            {/* Sun Orbit Position Selector */}
            <div className="control-group mt-1">
              <div className="control-label-row mb-1">
                <span>HELIOCENTRIC ORIENTATION</span>
              </div>
              <select
                value={`${controls.sunPosition.x},${controls.sunPosition.y},${controls.sunPosition.z}`}
                onChange={handleSunPositionChange}
                className="select-input"
              >
                <option value="-50,30,-100">
                  DEFAULT COORDINATES (-50, 30, -100)
                </option>
                <option value="0,0,-200">FAR DEPTH CENTER (0, 0, -200)</option>
                <option value="-100,50,0">
                  LEFT APEX VECTOR (-100, 50, 0)
                </option>
                <option value="100,-50,0">
                  RIGHT LOW PROFILE (100, -50, 0)
                </option>
              </select>
            </div>
          </div>
        </div>
      )}
    </ControlsPanelWrapper>
  );
}
