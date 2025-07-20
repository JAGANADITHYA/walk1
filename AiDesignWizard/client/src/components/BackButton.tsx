import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { GlassPanel } from "./GlassPanel";

interface BackButtonProps {
  className?: string;
  to?: string;
}

export const BackButton = ({ className, to = "/" }: BackButtonProps) => {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (to) {
      setLocation(to);
    } else {
      // Go back to previous page or home
      window.history.length > 1 ? window.history.back() : setLocation("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`fixed top-6 left-4 z-50 ${className}`}
    >
      <GlassPanel className="p-3 rounded-full hover:bg-white/30 transition-all duration-300">
        <ArrowLeft className="w-6 h-6 text-white" />
      </GlassPanel>
    </button>
  );
};