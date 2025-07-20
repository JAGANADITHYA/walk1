import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Position {
  x: number;
  y: number;
}

interface BrandElement {
  id: string;
  name: string;
  logoSvg: string;
  primaryColor: string;
  position: Position;
  size: number;
  rotation: number;
  opacity: number;
}

interface DraggableBrandElementProps {
  element: BrandElement;
  onUpdate: (id: string, updates: Partial<BrandElement>) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function DraggableBrandElement({ 
  element, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect 
}: DraggableBrandElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onSelect(element.id);
    
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const container = elementRef.current?.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    onUpdate(element.id, {
      position: {
        x: Math.max(0, Math.min(newX, containerRect.width - 100)),
        y: Math.max(0, Math.min(newY, containerRect.height - 100))
      }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move select-none transition-all ${
        isSelected ? 'ring-2 ring-blue-400 ring-opacity-70' : ''
      } ${isDragging ? 'z-50' : 'z-10'}`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size,
        height: element.size,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
    >
      <div
        className="w-full h-full flex items-center justify-center rounded-lg shadow-lg"
        style={{ 
          backgroundColor: element.primaryColor,
          color: element.primaryColor === '#FFFFFF' ? '#000000' : '#FFFFFF'
        }}
        dangerouslySetInnerHTML={{ __html: element.logoSvg }}
      />
      
      {isSelected && (
        <>
          {/* Corner resize handles */}
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full cursor-se-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              // Handle resize logic here
            }}
          />
          
          {/* Rotation handle */}
          <div 
            className="absolute -top-4 left-1/2 w-3 h-3 bg-green-400 rounded-full cursor-grab transform -translate-x-1/2"
            onMouseDown={(e) => {
              e.stopPropagation();
              // Handle rotation logic here
            }}
          />
          
          {/* Delete button */}
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-8 -right-8 w-6 h-6 p-0 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(element.id);
            }}
          >
            ×
          </Button>
          
          {/* Info tooltip */}
          <div className="absolute -bottom-8 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {element.name} • Click & drag to move
          </div>
        </>
      )}
    </div>
  );
}