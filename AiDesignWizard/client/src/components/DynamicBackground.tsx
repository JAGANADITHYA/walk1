import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface BackgroundConfig {
  type: "rainbow" | "gradient" | "video" | "image";
  url?: string;
  primaryColor?: string;
  accentColor?: string;
  customCss?: string;
}

interface AdPlacement {
  id: string;
  placement: string;
  contentUrl: string;
  contentType: "image" | "video" | "html";
  width?: number;
  height?: number;
  opacity: number;
  isActive: boolean;
}

export function DynamicBackground() {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>({
    type: "rainbow",
    primaryColor: "#00FF00",
    accentColor: "#FFD700"
  });

  // Fetch brand configuration (for now using default)
  const { data: brandConfig } = useQuery({
    queryKey: ["/api/brand-config"],
    enabled: false, // Will enable when we add the API endpoint
  });

  // Fetch ad placements
  const { data: adPlacements = [] } = useQuery({
    queryKey: ["/api/ad-placements"], 
    enabled: false, // Will enable when we add the API endpoint
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 400);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Update background config when brand config changes
  useEffect(() => {
    if (brandConfig) {
      setBackgroundConfig({
        type: brandConfig.backgroundType || "rainbow",
        url: brandConfig.backgroundUrl,
        primaryColor: brandConfig.primaryColor || "#00FF00",
        accentColor: brandConfig.accentColor || "#FFD700",
        customCss: brandConfig.customCss
      });
    }
  }, [brandConfig]);

  const renderBackground = () => {
    switch (backgroundConfig.type) {
      case "video":
        return (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.7 }}
          >
            <source src={backgroundConfig.url} type="video/mp4" />
            {/* Fallback to rainbow */}
            <div
              className="absolute inset-0 rainbow-bg"
              style={{ backgroundPosition: `${animationPhase}% 50%` }}
            />
          </video>
        );
      
      case "image":
        return (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${backgroundConfig.url})`,
              opacity: 0.8
            }}
          />
        );
      
      case "gradient":
        return (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(45deg, ${backgroundConfig.primaryColor}, ${backgroundConfig.accentColor})`,
              backgroundSize: "400% 400%",
              animation: "rainbow-slide 8s ease-in-out infinite"
            }}
          />
        );
      
      default: // rainbow
        return (
          <div
            className="absolute inset-0 rainbow-bg"
            style={{ backgroundPosition: `${animationPhase}% 50%` }}
          />
        );
    }
  };

  const renderAdPlacement = (ad: AdPlacement) => {
    const baseClasses = "absolute border border-white/10 backdrop-blur-sm";
    const positionClasses = {
      top_banner: "top-0 left-0 right-0 h-16",
      bottom_banner: "bottom-0 left-0 right-0 h-16", 
      side_left: "left-0 top-16 bottom-16 w-20 hidden md:block",
      side_right: "right-0 top-16 bottom-16 w-20 hidden md:block",
      fullscreen: "inset-0",
      overlay: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    };

    const className = `${baseClasses} ${positionClasses[ad.placement as keyof typeof positionClasses]}`;

    if (ad.contentType === "video") {
      return (
        <div key={ad.id} className={className} style={{ opacity: ad.opacity }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover rounded"
          >
            <source src={ad.contentUrl} type="video/mp4" />
          </video>
        </div>
      );
    }

    if (ad.contentType === "image") {
      return (
        <div 
          key={ad.id} 
          className={className}
          style={{ 
            opacity: ad.opacity,
            backgroundImage: `url(${ad.contentUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
      );
    }

    if (ad.contentType === "html") {
      return (
        <div 
          key={ad.id} 
          className={className}
          style={{ opacity: ad.opacity }}
          dangerouslySetInnerHTML={{ __html: ad.contentUrl }}
        />
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-0">
      {/* Main Background */}
      {renderBackground()}
      
      {/* Custom CSS injection */}
      {backgroundConfig.customCss && (
        <style dangerouslySetInnerHTML={{ __html: backgroundConfig.customCss }} />
      )}
      
      {/* Ad Placements */}
      {adPlacements
        .filter((ad: AdPlacement) => ad.isActive)
        .map(renderAdPlacement)}
      
      {/* Default ad spaces for demo */}
      {adPlacements.length === 0 && (
        <>
          {/* Top banner ad space */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-white/2 backdrop-blur-sm border-b border-white/10">
            <div className="h-full flex items-center justify-center text-white/60 text-sm">
              Brand Logo / Top Banner Ad Space
            </div>
          </div>
          
          {/* Bottom banner ad space */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/2 backdrop-blur-sm border-t border-white/10">
            <div className="h-full flex items-center justify-center text-white/60 text-sm">
              Promotional Content / Bottom Banner Ad Space
            </div>
          </div>
          
          {/* Side ad spaces */}
          <div className="hidden md:block absolute left-0 top-16 bottom-16 w-20 bg-white/2 backdrop-blur-sm border-r border-white/10">
            <div className="h-full flex items-center justify-center text-white/60 text-xs writing-mode-vertical">
              Left Side Ad
            </div>
          </div>
          
          <div className="hidden md:block absolute right-0 top-16 bottom-16 w-20 bg-white/2 backdrop-blur-sm border-l border-white/10">
            <div className="h-full flex items-center justify-center text-white/60 text-xs writing-mode-vertical">
              Right Side Ad
            </div>
          </div>
        </>
      )}
      
      {/* Overlay gradient for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />
    </div>
  );
}