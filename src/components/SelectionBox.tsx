import { useEffect, useState } from "react";

interface SelectionBoxProps {
  isSelecting: boolean;
  onSelectionComplete: (rect: { x: number; y: number; width: number; height: number }) => void;
}

export const SelectionBox = ({ isSelecting, onSelectionComplete }: SelectionBoxProps) => {
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isSelecting) {
      setStartPos(null);
      setCurrentPos(null);
      return;
    }

    const handleMouseDown = (e: MouseEvent) => {
      setStartPos({ x: e.clientX, y: e.clientY });
      setCurrentPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (startPos) {
        setCurrentPos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (startPos) {
        const endPos = { x: e.clientX, y: e.clientY };
        const rect = {
          x: Math.min(startPos.x, endPos.x),
          y: Math.min(startPos.y, endPos.y),
          width: Math.abs(endPos.x - startPos.x),
          height: Math.abs(endPos.y - startPos.y),
        };
        
        if (rect.width > 20 && rect.height > 20) {
          onSelectionComplete(rect);
        }
        
        setStartPos(null);
        setCurrentPos(null);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSelecting, startPos, onSelectionComplete]);

  if (!startPos || !currentPos) return null;

  const rect = {
    x: Math.min(startPos.x, currentPos.x),
    y: Math.min(startPos.y, currentPos.y),
    width: Math.abs(currentPos.x - startPos.x),
    height: Math.abs(currentPos.y - startPos.y),
  };

  return (
    <div
      className="fixed pointer-events-none border-2 border-selection-border bg-selection-border/10 transition-all duration-75"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      }}
    />
  );
};
