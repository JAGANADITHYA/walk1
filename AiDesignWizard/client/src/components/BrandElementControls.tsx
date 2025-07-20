import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel } from "./GlassPanel";

interface BrandElement {
  id: string;
  name: string;
  logoSvg: string;
  primaryColor: string;
  position: { x: number; y: number };
  size: number;
  rotation: number;
  opacity: number;
}

interface BrandElementControlsProps {
  element: BrandElement | null;
  onUpdate: (id: string, updates: Partial<BrandElement>) => void;
  onClose: () => void;
}

export function BrandElementControls({ element, onUpdate, onClose }: BrandElementControlsProps) {
  if (!element) return null;

  const handleColorChange = (color: string) => {
    onUpdate(element.id, { primaryColor: color });
  };

  const handleSizeChange = (value: number[]) => {
    onUpdate(element.id, { size: value[0] });
  };

  const handleRotationChange = (value: number[]) => {
    onUpdate(element.id, { rotation: value[0] });
  };

  const handleOpacityChange = (value: number[]) => {
    onUpdate(element.id, { opacity: value[0] / 100 });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    const numValue = parseInt(value) || 0;
    onUpdate(element.id, {
      position: {
        ...element.position,
        [axis]: numValue
      }
    });
  };

  const presetColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#008000', '#800000', '#000080', '#808000',
    '#000000', '#FFFFFF', '#808080', '#C0C0C0', '#FFB6C1', '#98FB98'
  ];

  return (
    <div className="fixed top-4 right-4 w-80 z-40">
      <GlassPanel className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Edit {element.name}</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          {/* Position Controls */}
          <div>
            <Label className="text-white text-sm mb-2 block">Position</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-white/70 text-xs">X</Label>
                <Input
                  type="number"
                  value={Math.round(element.position.x)}
                  onChange={(e) => handlePositionChange('x', e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white/70 text-xs">Y</Label>
                <Input
                  type="number"
                  value={Math.round(element.position.y)}
                  onChange={(e) => handlePositionChange('y', e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </div>

          {/* Size Control */}
          <div>
            <Label className="text-white text-sm mb-2 block">
              Size: {element.size}px
            </Label>
            <Slider
              value={[element.size]}
              onValueChange={handleSizeChange}
              min={30}
              max={200}
              step={5}
              className="w-full"
            />
          </div>

          {/* Rotation Control */}
          <div>
            <Label className="text-white text-sm mb-2 block">
              Rotation: {element.rotation}°
            </Label>
            <Slider
              value={[element.rotation]}
              onValueChange={handleRotationChange}
              min={0}
              max={360}
              step={5}
              className="w-full"
            />
          </div>

          {/* Opacity Control */}
          <div>
            <Label className="text-white text-sm mb-2 block">
              Opacity: {Math.round(element.opacity * 100)}%
            </Label>
            <Slider
              value={[element.opacity * 100]}
              onValueChange={handleOpacityChange}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Color Picker */}
          <div>
            <Label className="text-white text-sm mb-2 block">Brand Color</Label>
            <div className="grid grid-cols-6 gap-2 mb-2">
              {presetColors.map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    element.primaryColor === color 
                      ? 'border-white scale-110' 
                      : 'border-white/30 hover:border-white/60'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
            <Input
              type="color"
              value={element.primaryColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-10 bg-white/10 border-white/20"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => onUpdate(element.id, { 
                rotation: 0, 
                opacity: 1, 
                size: 80 
              })}
            >
              Reset
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => onUpdate(element.id, {
                position: { x: 50, y: 50 }
              })}
            >
              Center
            </Button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}