import React, { useState, useRef, useEffect } from 'react';
import '../styles/ScrollableChartContainer.css';

/**
 * ScrollableChartContainer
 * 
 * Composant pour les graphiques avec scroll horizontal.
 * Permet:
 * - Scroll gauche/droite
 * - Drag horizontal
 * - Responsive
 * - Zoom temporel
 * 
 * Les données restent cohérentes lors du zoom.
 */
const ScrollableChartContainer = ({ children, width, height, onZoomChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [zoom, setZoom] = useState(100);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Scroll avec la souris (drag)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Vitesse du scroll
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Zoom
  const handleZoomIn = () => {
    const newZoom = Math.min(200, zoom + 25);
    setZoom(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(50, zoom - 25);
    setZoom(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  // Scroll avec la molette
  const handleWheel = (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      containerRef.current.scrollLeft += e.deltaY;
    }
  };

  // Appliquer le zoom au contenu
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.transform = `scaleX(${zoom / 100})`;
    }
  }, [zoom]);

  return (
    <div className="scrollable-chart-wrapper">
      <div className="zoom-controls">
        <button className="zoom-btn" onClick={handleZoomOut} disabled={zoom <= 50}>
          <i className="bi bi-dash"></i>
        </button>
        <span className="zoom-level">{zoom}%</span>
        <button className="zoom-btn" onClick={handleZoomIn} disabled={zoom >= 200}>
          <i className="bi bi-plus"></i>
        </button>
      </div>

      <div
        ref={containerRef}
        className={`scrollable-chart-container ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        style={{ width, height }}
      >
        <div ref={contentRef} className="scrollable-chart-content">
          {children}
        </div>
      </div>

      <div className="scroll-hint">
        <i className="bi bi-arrows-left-right"></i>
        <span>Glissez pour scroller ou utilisez la molette</span>
      </div>
    </div>
  );
};

export default ScrollableChartContainer;
