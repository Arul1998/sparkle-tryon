import { useState, useRef, useCallback } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import type { JewelleryItem } from "@/data/jewellery";

interface JewelleryOverlayProps {
  item: JewelleryItem;
  onRemove: () => void;
}

const JewelleryOverlay = ({ item, onRemove }: JewelleryOverlayProps) => {
  const [position, setPosition] = useState({ x: 50, y: 40 });
  const [size, setSize] = useState(120);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      const parent = containerRef.current?.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - (rect.width * position.x) / 100,
        y: e.clientY - (rect.height * position.y) / 100,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        const r = parent.getBoundingClientRect();
        const x = ((ev.clientX - dragOffset.current.x) / r.width) * 100;
        const y = ((ev.clientY - dragOffset.current.y) / r.height) * 100;
        setPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [position]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const parent = containerRef.current?.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      dragOffset.current = {
        x: touch.clientX - (rect.width * position.x) / 100,
        y: touch.clientY - (rect.height * position.y) / 100,
      };

      const handleTouchMove = (ev: TouchEvent) => {
        ev.preventDefault();
        const t = ev.touches[0];
        const r = parent.getBoundingClientRect();
        const x = ((t.clientX - dragOffset.current.x) / r.width) * 100;
        const y = ((t.clientY - dragOffset.current.y) / r.height) * 100;
        setPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      };

      const handleTouchEnd = () => {
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };

      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    },
    [position]
  );

  return (
    <div
      ref={containerRef}
      className={`absolute select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 20,
      }}
    >
      <div className="relative group">
        <img
          src={item.image}
          alt={item.name}
          className="pointer-events-none"
          style={{ width: size, height: size, objectFit: "contain" }}
          draggable={false}
        />

        {/* Drag handle area */}
        <div
          className="absolute inset-0"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />

        {/* Controls */}
        <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setSize(Math.min(size + 30, 300))}
            className="glass-dark p-1 rounded-sm border border-border"
          >
            <Maximize2 className="w-3 h-3 text-foreground" />
          </button>
          <button
            onClick={() => setSize(Math.max(size - 30, 40))}
            className="glass-dark p-1 rounded-sm border border-border"
          >
            <Minimize2 className="w-3 h-3 text-foreground" />
          </button>
          <button
            onClick={onRemove}
            className="glass-dark p-1 rounded-sm border border-destructive/50"
          >
            <X className="w-3 h-3 text-destructive" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JewelleryOverlay;
