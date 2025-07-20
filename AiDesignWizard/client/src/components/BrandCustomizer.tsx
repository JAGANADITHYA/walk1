import { useState, useEffect } from "react";
import { GlassPanel } from "./GlassPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Palette, Eye, Zap, Save, Images } from "lucide-react";
import { BrandGallery } from "./BrandGallery";
import { DraggableBrandElement } from "./DraggableBrandElement";
import { BrandElementControls } from "./BrandElementControls";
import { nanoid } from "nanoid";

interface BrandConfig {
  name: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  backgroundType: "rainbow" | "gradient" | "video" | "image";
  backgroundUrl: string;
  customCss: string;
  isActive: boolean;
}

interface AdPlacement {
  placement: string;
  contentUrl: string;
  contentType: "image" | "video" | "html";
  width: number;
  height: number;
  opacity: number;
  isActive: boolean;
}

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

interface BrandAsset {
  id: string;
  name: string;
  category: string;
  logoSvg: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
}

export function BrandCustomizer() {
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
    name: "Walk & Earn",
    logoUrl: "",
    primaryColor: "#00FF00",
    accentColor: "#FFD700",
    backgroundType: "rainbow",
    backgroundUrl: "",
    customCss: "",
    isActive: true,
  });

  const [adPlacements, setAdPlacements] = useState<AdPlacement[]>([
    {
      placement: "top_banner",
      contentUrl: "",
      contentType: "image",
      width: 100,
      height: 64,
      opacity: 0.8,
      isActive: true,
    },
  ]);

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showBrandGallery, setShowBrandGallery] = useState(false);
  const [livePreview, setLivePreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [brandElements, setBrandElements] = useState<BrandElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const handleBrandConfigChange = (field: keyof BrandConfig, value: string | boolean) => {
    setBrandConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Apply live preview immediately
    if (livePreview) {
      applyLivePreview({ ...brandConfig, [field]: value });
    }
  };

  const handleSelectBrand = (brand: BrandAsset) => {
    // Add brand element to the interface
    const newElement: BrandElement = {
      id: nanoid(),
      name: brand.name,
      logoSvg: brand.logoSvg,
      primaryColor: brand.primaryColor,
      position: { x: 100, y: 100 },
      size: 80,
      rotation: 0,
      opacity: 1
    };
    
    setBrandElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  const handleUpdateBrandElement = (id: string, updates: Partial<BrandElement>) => {
    setBrandElements(prev => prev.map(element => 
      element.id === id ? { ...element, ...updates } : element
    ));
  };

  const handleDeleteBrandElement = (id: string) => {
    setBrandElements(prev => prev.filter(element => element.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const handleDeselectElement = () => {
    setSelectedElementId(null);
  };

  const applyLivePreview = (config: BrandConfig) => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', config.primaryColor);
    root.style.setProperty('--brand-accent', config.accentColor);
    
    // Remove existing dynamic styles
    const existingStyle = document.getElementById('brand-live-preview');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Apply custom CSS for live preview
    if (config.customCss) {
      const styleElement = document.createElement('style');
      styleElement.id = 'brand-live-preview';
      styleElement.textContent = config.customCss;
      document.head.appendChild(styleElement);
    }
  };

  const addAdPlacement = () => {
    setAdPlacements(prev => [
      ...prev,
      {
        placement: "overlay",
        contentUrl: "",
        contentType: "image",
        width: 300,
        height: 200,
        opacity: 0.8,
        isActive: true,
      }
    ]);
  };

  const updateAdPlacement = (index: number, field: keyof AdPlacement, value: string | number | boolean) => {
    setAdPlacements(prev => prev.map((ad, i) => 
      i === index ? { ...ad, [field]: value } : ad
    ));
  };

  const removeAdPlacement = (index: number) => {
    setAdPlacements(prev => prev.filter((_, i) => i !== index));
  };

  const applyConfiguration = () => {
    // Apply the final configuration to the app
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', brandConfig.primaryColor);
    root.style.setProperty('--brand-accent', brandConfig.accentColor);
    
    // Remove live preview and apply final styles
    const existingStyle = document.getElementById('brand-live-preview');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Inject final custom CSS
    if (brandConfig.customCss) {
      const finalStyleElement = document.createElement('style');
      finalStyleElement.id = 'brand-final-styles';
      finalStyleElement.textContent = brandConfig.customCss;
      document.head.appendChild(finalStyleElement);
    }
    
    // Save configuration to localStorage for persistence
    localStorage.setItem('brandConfig', JSON.stringify(brandConfig));
    localStorage.setItem('adPlacements', JSON.stringify(adPlacements));
    
    console.log('Brand Configuration Applied:', { brandConfig, adPlacements });
    setShowCustomizer(false);
  };

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('brandConfig');
    const savedAds = localStorage.getItem('adPlacements');
    
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setBrandConfig(config);
      if (livePreview) {
        applyLivePreview(config);
      }
    }
    
    if (savedAds) {
      setAdPlacements(JSON.parse(savedAds));
    }
  }, []);

  const presetConfigurations = {
    nike: {
      name: "Nike Walk",
      primaryColor: "#000000",
      accentColor: "#FF6B00",
      backgroundType: "gradient" as const,
      customCss: `
        .glass-panel { 
          background: rgba(0, 0, 0, 0.3); 
          border: 1px solid rgba(255, 107, 0, 0.3);
        }
        .nike-swoosh::after {
          content: "✓";
          color: #FF6B00;
          font-weight: bold;
        }
      `
    },
    adidas: {
      name: "Adidas Run",
      primaryColor: "#000000",
      accentColor: "#FFFFFF",
      backgroundType: "gradient" as const,
      customCss: `
        .glass-panel { 
          background: rgba(0, 0, 0, 0.4); 
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .adidas-stripes::before {
          content: "⟫";
          color: white;
          font-weight: bold;
        }
      `
    },
    cocacola: {
      name: "Coca-Cola Move",
      primaryColor: "#FF0000",
      accentColor: "#FFFFFF",
      backgroundType: "gradient" as const,
      customCss: `
        .glass-panel { 
          background: rgba(255, 0, 0, 0.2); 
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .coke-bubble::after {
          content: "🥤";
        }
      `
    },
    starbucks: {
      name: "Starbucks Walk",
      primaryColor: "#00704A",
      accentColor: "#D4AA7A",
      backgroundType: "gradient" as const,
      customCss: `
        .glass-panel { 
          background: rgba(0, 112, 74, 0.3); 
          border: 1px solid rgba(212, 170, 122, 0.4);
        }
      `
    },
    apple: {
      name: "Apple Fitness",
      primaryColor: "#000000",
      accentColor: "#007AFF",
      backgroundType: "gradient" as const,
      customCss: `
        .glass-panel { 
          background: rgba(0, 0, 0, 0.4); 
          border: 1px solid rgba(0, 122, 255, 0.3);
        }
      `
    }
  };

  const applyPreset = (preset: keyof typeof presetConfigurations) => {
    const config = presetConfigurations[preset];
    const newConfig = { ...brandConfig, ...config };
    setBrandConfig(newConfig);
    
    if (livePreview) {
      applyLivePreview(newConfig);
    }
  };

  const resetToDefault = () => {
    const defaultConfig = {
      name: "Walk & Earn",
      logoUrl: "",
      primaryColor: "#00FF00",
      accentColor: "#FFD700",
      backgroundType: "rainbow" as const,
      backgroundUrl: "",
      customCss: "",
      isActive: true,
    };
    setBrandConfig(defaultConfig);
    if (livePreview) {
      applyLivePreview(defaultConfig);
    }
  };

  if (!showCustomizer) {
    return (
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => setShowCustomizer(true)}
          className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-lg border border-white/30 rounded-2xl text-white transition-all shadow-lg group"
        >
          <Palette className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
        <Badge className="bg-white/10 text-white border-white/20 text-xs px-2 py-1">
          Customize
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassPanel className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Brand Customizer</h2>
              <p className="text-white/60 text-sm">Live preview your brand changes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowBrandGallery(true)}
              className="bg-gradient-to-r from-green-500/20 to-blue-500/20 hover:from-green-500/30 hover:to-blue-500/30 border border-white/20 text-white"
            >
              <Images className="h-4 w-4 mr-2" />
              Brand Gallery
            </Button>
            
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
              <Eye className="h-4 w-4 text-white" />
              <Switch
                checked={livePreview}
                onCheckedChange={setLivePreview}
              />
              <span className="text-white text-sm">Live Preview</span>
            </div>
            
            <button
              onClick={() => setShowCustomizer(false)}
              className="p-2 hover:bg-white/20 rounded-full text-white transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Brand Settings</h3>
            
            {/* Quick Presets */}
            <div className="mb-6">
              <Label className="text-white mb-3 block flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Brand Presets
              </Label>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {Object.entries(presetConfigurations).map(([preset, config]) => (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset as keyof typeof presetConfigurations)}
                    className="p-4 bg-white/5 hover:bg-white/15 border border-white/20 rounded-xl text-left transition-all group hover:scale-[1.02]"
                    style={{ 
                      borderColor: config.accentColor + '40',
                      background: `linear-gradient(135deg, ${config.primaryColor}15, ${config.accentColor}08)`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: config.primaryColor }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: config.accentColor }}
                          />
                        </div>
                        <div>
                          <div className="text-white font-medium capitalize">{preset}</div>
                          <div className="text-white/60 text-xs">{config.name}</div>
                        </div>
                      </div>
                      <div className="text-white/40 group-hover:text-white/60 transition-colors">
                        →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <Button
                onClick={resetToDefault}
                variant="outline"
                size="sm"
                className="mt-2 w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                Reset to Default
              </Button>
            </div>

            <div>
              <Label htmlFor="brandName" className="text-white">Brand Name</Label>
              <Input
                id="brandName"
                value={brandConfig.name}
                onChange={(e) => handleBrandConfigChange("name", e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Walk & Earn"
              />
            </div>

            <div>
              <Label htmlFor="logoUrl" className="text-white">Logo URL</Label>
              <Input
                id="logoUrl"
                value={brandConfig.logoUrl}
                onChange={(e) => handleBrandConfigChange("logoUrl", e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-white flex items-center gap-2">
                  Primary Color
                  <div 
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: brandConfig.primaryColor }}
                  />
                </Label>
                <div className="relative">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={brandConfig.primaryColor}
                    onChange={(e) => handleBrandConfigChange("primaryColor", e.target.value)}
                    className="bg-white/10 border-white/20 h-12 cursor-pointer"
                  />
                  <div className="absolute top-2 right-2 text-white/60 text-xs font-mono">
                    {brandConfig.primaryColor}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor" className="text-white flex items-center gap-2">
                  Accent Color
                  <div 
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: brandConfig.accentColor }}
                  />
                </Label>
                <div className="relative">
                  <Input
                    id="accentColor"
                    type="color"
                    value={brandConfig.accentColor}
                    onChange={(e) => handleBrandConfigChange("accentColor", e.target.value)}
                    className="bg-white/10 border-white/20 h-12 cursor-pointer"
                  />
                  <div className="absolute top-2 right-2 text-white/60 text-xs font-mono">
                    {brandConfig.accentColor}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white">Background Type</Label>
              <Select 
                value={brandConfig.backgroundType} 
                onValueChange={(value) => handleBrandConfigChange("backgroundType", value)}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rainbow">Rainbow Animation</SelectItem>
                  <SelectItem value="gradient">Color Gradient</SelectItem>
                  <SelectItem value="video">Video Background</SelectItem>
                  <SelectItem value="image">Static Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(brandConfig.backgroundType === "video" || brandConfig.backgroundType === "image") && (
              <div>
                <Label htmlFor="backgroundUrl" className="text-white">
                  {brandConfig.backgroundType === "video" ? "Video URL" : "Image URL"}
                </Label>
                <Input
                  id="backgroundUrl"
                  value={brandConfig.backgroundUrl}
                  onChange={(e) => handleBrandConfigChange("backgroundUrl", e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder={`https://example.com/background.${brandConfig.backgroundType === "video" ? "mp4" : "jpg"}`}
                />
              </div>
            )}

            <div>
              <Label htmlFor="customCss" className="text-white flex items-center gap-2">
                Custom CSS
                <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/20">
                  Advanced
                </Badge>
              </Label>
              <Textarea
                id="customCss"
                value={brandConfig.customCss}
                onChange={(e) => handleBrandConfigChange("customCss", e.target.value)}
                className="bg-white/10 border-white/20 text-white font-mono text-sm"
                placeholder={`.glass-panel { 
  background: rgba(255, 0, 0, 0.3); 
  border: 1px solid rgba(255, 255, 255, 0.4);
}
.custom-style { 
  color: #FF6B00; 
}`}
                rows={6}
              />
              <div className="text-white/50 text-xs mt-1">
                💡 Tip: Use CSS variables like --brand-primary and --brand-accent
              </div>
            </div>
          </div>

          {/* Ad Placements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Ad Placements</h3>
              <Button
                onClick={addAdPlacement}
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <i className="fas fa-plus mr-2"></i>Add Placement
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {adPlacements.map((ad, index) => (
                <GlassPanel key={index} variant="ultra-glass" className="p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">Placement {index + 1}</span>
                    <button
                      onClick={() => removeAdPlacement(index)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white text-sm">Position</Label>
                      <Select 
                        value={ad.placement}
                        onValueChange={(value) => updateAdPlacement(index, "placement", value)}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top_banner">Top Banner</SelectItem>
                          <SelectItem value="bottom_banner">Bottom Banner</SelectItem>
                          <SelectItem value="side_left">Left Side</SelectItem>
                          <SelectItem value="side_right">Right Side</SelectItem>
                          <SelectItem value="overlay">Center Overlay</SelectItem>
                          <SelectItem value="fullscreen">Fullscreen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white text-sm">Content Type</Label>
                      <Select 
                        value={ad.contentType}
                        onValueChange={(value) => updateAdPlacement(index, "contentType", value)}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Label className="text-white text-sm">Content URL</Label>
                    <Input
                      value={ad.contentUrl}
                      onChange={(e) => updateAdPlacement(index, "contentUrl", e.target.value)}
                      className="bg-white/10 border-white/20 text-white text-sm"
                      placeholder="https://example.com/content"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div>
                      <Label className="text-white text-xs">Opacity</Label>
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={ad.opacity}
                        onChange={(e) => updateAdPlacement(index, "opacity", parseFloat(e.target.value))}
                        className="bg-white/10"
                      />
                      <span className="text-white text-xs">{ad.opacity}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={ad.isActive}
                        onCheckedChange={(checked) => updateAdPlacement(index, "isActive", checked)}
                      />
                      <Label className="text-white text-xs">Active</Label>
                    </div>
                  </div>
                </GlassPanel>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/20">
          <div className="text-white/60 text-sm">
            {livePreview ? "✨ Changes apply instantly" : "💡 Enable live preview to see changes"}
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCustomizer(false)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={applyConfiguration}
              className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/40 hover:to-emerald-500/40 text-white border-green-400/30 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </div>
      </GlassPanel>

      {/* Brand Elements Overlay */}
      {brandElements.map(element => (
        <DraggableBrandElement
          key={element.id}
          element={element}
          onUpdate={handleUpdateBrandElement}
          onDelete={handleDeleteBrandElement}
          isSelected={selectedElementId === element.id}
          onSelect={setSelectedElementId}
        />
      ))}

      {/* Brand Gallery Modal */}
      {showBrandGallery && (
        <BrandGallery
          onSelectBrand={handleSelectBrand}
          onClose={() => setShowBrandGallery(false)}
        />
      )}

      {/* Brand Element Controls */}
      {selectedElementId && (
        <BrandElementControls
          element={brandElements.find(el => el.id === selectedElementId) || null}
          onUpdate={handleUpdateBrandElement}
          onClose={handleDeselectElement}
        />
      )}

      {/* Click outside to deselect */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={handleDeselectElement}
      />
    </div>
  );
}