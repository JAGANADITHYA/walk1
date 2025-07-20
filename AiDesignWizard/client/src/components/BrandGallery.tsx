import { useState } from "react";
import { GlassPanel } from "./GlassPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface BrandAsset {
  id: string;
  name: string;
  category: string;
  logoSvg: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
}

const BRAND_ASSETS: BrandAsset[] = [
  {
    id: "nike",
    name: "Nike",
    category: "sports",
    primaryColor: "#000000",
    secondaryColor: "#FFFFFF",
    description: "Just Do It",
    logoSvg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M78.4 22.8c-2.4 0-4.3 1.9-4.3 4.3s1.9 4.3 4.3 4.3 4.3-1.9 4.3-4.3-1.9-4.3-4.3-4.3z" fill="currentColor"/>
      <path d="M8.2 38.4c-.8 0-1.5-.2-2.1-.6L32.8 14.1c.9-.9 2.4-.9 3.3 0l26.7 23.7c-.6.4-1.3.6-2.1.6H8.2z" fill="currentColor"/>
    </svg>`
  },
  {
    id: "adidas",
    name: "Adidas", 
    category: "sports",
    primaryColor: "#000000",
    secondaryColor: "#FFFFFF",
    description: "Impossible is Nothing",
    logoSvg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <polygon points="15,35 25,15 35,35" fill="currentColor"/>
      <polygon points="40,35 50,15 60,35" fill="currentColor"/>
      <polygon points="65,35 75,15 85,35" fill="currentColor"/>
      <rect x="10" y="25" width="80" height="3" fill="currentColor"/>
    </svg>`
  },
  {
    id: "cocacola",
    name: "Coca-Cola",
    category: "beverage",
    primaryColor: "#FF0000",
    secondaryColor: "#FFFFFF", 
    description: "Taste the Feeling",
    logoSvg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="20" rx="45" ry="15" fill="currentColor"/>
      <text x="50" y="25" text-anchor="middle" font-family="serif" font-size="12" font-weight="bold" fill="white">Coca-Cola</text>
    </svg>`
  },
  {
    id: "starbucks",
    name: "Starbucks",
    category: "beverage",
    primaryColor: "#00704A",
    secondaryColor: "#FFFFFF",
    description: "Coffee Culture",
    logoSvg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="20" r="18" fill="currentColor"/>
      <circle cx="50" cy="20" r="12" fill="white"/>
      <text x="50" y="25" text-anchor="middle" font-family="serif" font-size="8" font-weight="bold" fill="currentColor">★</text>
    </svg>`
  },
  {
    id: "apple",
    name: "Apple",
    category: "tech",
    primaryColor: "#000000",
    secondaryColor: "#F5F5F7",
    description: "Think Different",
    logoSvg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14zm4-6c2 2 2 4 0 6-2-2-2-4 0-6z" fill="currentColor"/>
    </svg>`
  },
  {
    id: "mcdonalds",
    name: "McDonald's",
    category: "food",
    primaryColor: "#FFC72C",
    secondaryColor: "#DA020E",
    description: "I'm Lovin' It",
    logoSvg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 35c0-10 8-18 18-18s18 8 18 18" fill="none" stroke="currentColor" stroke-width="6"/>
      <path d="M44 35c0-10 8-18 18-18s18 8 18 18" fill="none" stroke="currentColor" stroke-width="6"/>
    </svg>`
  },
  {
    id: "samsung",
    name: "Samsung",
    category: "tech", 
    primaryColor: "#1428A0",
    secondaryColor: "#FFFFFF",
    description: "Do What You Can't",
    logoSvg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="15" width="70" height="10" rx="5" fill="currentColor"/>
      <text x="50" y="25" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="white">SAMSUNG</text>
    </svg>`
  },
  {
    id: "google",
    name: "Google",
    category: "tech",
    primaryColor: "#4285F4",
    secondaryColor: "#EA4335", 
    description: "Don't Be Evil",
    logoSvg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="20" r="8" fill="#4285F4"/>
      <circle cx="40" cy="20" r="8" fill="#EA4335"/>
      <circle cx="55" cy="20" r="8" fill="#FBBC05"/>
      <circle cx="70" cy="20" r="8" fill="#34A853"/>
    </svg>`
  }
];

interface BrandGalleryProps {
  onSelectBrand: (brand: BrandAsset) => void;
  onClose: () => void;
}

export function BrandGallery({ onSelectBrand, onClose }: BrandGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [draggedBrand, setDraggedBrand] = useState<BrandAsset | null>(null);

  const categories = ["all", "sports", "tech", "beverage", "food"];
  
  const filteredBrands = selectedCategory === "all" 
    ? BRAND_ASSETS 
    : BRAND_ASSETS.filter(brand => brand.category === selectedCategory);

  const handleDragStart = (e: React.DragEvent, brand: BrandAsset) => {
    setDraggedBrand(brand);
    e.dataTransfer.setData("application/json", JSON.stringify(brand));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleBrandClick = (brand: BrandAsset) => {
    onSelectBrand(brand);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassPanel className="w-full max-w-6xl max-h-[80vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Brand Gallery</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              ✕
            </Button>
          </div>

          <p className="text-white/80 mb-6">
            Click on a brand to apply its theme, or drag and drop to position elements on your interface.
          </p>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="bg-white/10 border-white/20">
              {categories.map(category => (
                <TabsTrigger 
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-96">
            {filteredBrands.map(brand => (
              <Card 
                key={brand.id}
                className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
                draggable
                onDragStart={(e) => handleDragStart(e, brand)}
                onClick={() => handleBrandClick(brand)}
              >
                <CardContent className="p-4 text-center">
                  <div 
                    className="h-16 w-full mb-3 flex items-center justify-center rounded"
                    style={{ backgroundColor: brand.primaryColor }}
                    dangerouslySetInnerHTML={{ __html: brand.logoSvg }}
                  />
                  <h3 className="font-semibold text-white mb-1">{brand.name}</h3>
                  <p className="text-xs text-white/70 mb-2">{brand.description}</p>
                  <div className="flex gap-2 justify-center">
                    <div 
                      className="w-4 h-4 rounded-full border border-white/30"
                      style={{ backgroundColor: brand.primaryColor }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-white/30"
                      style={{ backgroundColor: brand.secondaryColor }}
                    />
                  </div>
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white/60">Click to apply • Drag to position</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {draggedBrand && (
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
              <p className="text-blue-200 text-sm">
                💡 Tip: Drag the {draggedBrand.name} logo to any part of your interface to position it there!
              </p>
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}