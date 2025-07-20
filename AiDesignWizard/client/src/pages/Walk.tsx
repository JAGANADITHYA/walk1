import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { GlassPanel } from "@/components/GlassPanel";
import { RainbowBackground } from "@/components/RainbowBackground";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Walk() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [isWalking, setIsWalking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepCounterRef = useRef<NodeJS.Timeout | null>(null);
  const positionRef = useRef<{ lat: number; lng: number } | null>(null);

  const startWalkMutation = useMutation({
    mutationFn: async () => {
      const startLocation = positionRef.current ? JSON.stringify(positionRef.current) : null;
      const res = await apiRequest("POST", "/api/walks/start", { startLocation });
      return res.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session.id);
      setIsWalking(true);
      startTimer();
      startStepCounter();
      toast({
        title: "Walk Started!",
        description: "Good luck on your 30-minute journey!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to start walk session",
        variant: "destructive",
      });
    },
  });

  const completeWalkMutation = useMutation({
    mutationFn: async () => {
      if (!currentSession) throw new Error("No active session");
      const endLocation = positionRef.current ? JSON.stringify(positionRef.current) : null;
      const res = await apiRequest("PUT", `/api/walks/${currentSession}/complete`, {
        steps,
        distance: distance.toString(),
        endLocation,
      });
      return res.json();
    },
    onSuccess: (completedSession) => {
      toast({
        title: "Walk Completed!",
        description: `Great job! You earned ₹${completedSession.earnings}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setLocation("/");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to complete walk session",
        variant: "destructive",
      });
    },
  });

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleCompleteWalk();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startStepCounter = () => {
    stepCounterRef.current = setInterval(() => {
      // Simulate step counting (in real app, use device accelerometer)
      setSteps((prev) => {
        const newSteps = prev + Math.floor(Math.random() * 3) + 1;
        const newDistance = newSteps * 0.0008; // Rough conversion: steps to km
        const newEarnings = newSteps * 0.01; // ₹0.01 per step
        
        setDistance(newDistance);
        setEarnings(newEarnings);
        return newSteps;
      });
    }, 1000);
  };

  const handleStartWalk = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to start walking",
        variant: "destructive",
      });
      return;
    }

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          positionRef.current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          startWalkMutation.mutate();
        },
        (error) => {
          console.warn("Location access denied:", error);
          startWalkMutation.mutate(); // Start without location
        }
      );
    } else {
      startWalkMutation.mutate(); // Start without location
    }
  };

  const handleCompleteWalk = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (stepCounterRef.current) clearInterval(stepCounterRef.current);
    
    setIsWalking(false);
    if (currentSession) {
      completeWalkMutation.mutate();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepCounterRef.current) clearInterval(stepCounterRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <RainbowBackground />
      
      <div className="relative z-10 h-screen flex flex-col pt-20">
        <BackButton />
        
        {/* Top Stats */}
        <div className="flex justify-between p-4">
          <div></div>
          <GlassPanel className="rounded-2xl px-4 py-2">
            <p className="text-sm text-white/80">
              {isWalking ? "Walking Session Active" : "Ready to Walk"}
            </p>
          </GlassPanel>
          <button
            onClick={isWalking ? handleCompleteWalk : () => {}}
            disabled={!isWalking}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-full p-3 text-white transition-all disabled:opacity-50"
          >
            <i className={`fas ${isWalking ? "fa-pause" : "fa-play"} text-xl`}></i>
          </button>
        </div>
        
        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          {!isWalking ? (
            <GlassPanel className="rounded-full p-8 text-center">
              <i className="fas fa-walking text-6xl text-white mb-4"></i>
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Walk?</h2>
              <p className="text-white/80 mb-6">Start your 30-minute walking session and earn rewards!</p>
              <button
                onClick={handleStartWalk}
                disabled={startWalkMutation.isPending}
                className="px-8 py-4 bg-green-500/30 hover:bg-green-500/40 backdrop-blur-lg border border-green-400/30 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {startWalkMutation.isPending ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Starting...</>
                ) : (
                  <><i className="fas fa-play mr-2"></i>Start Walking</>
                )}
              </button>
            </GlassPanel>
          ) : (
            <GlassPanel className="rounded-full p-8 text-center animate-pulse">
              <i className="fas fa-walking text-6xl text-green-300 mb-4 animate-bounce"></i>
              <h2 className="text-2xl font-bold text-white mb-2">Keep Going!</h2>
              <p className="text-white/80">You're doing great!</p>
            </GlassPanel>
          )}
        </div>
        
        {/* Bottom Stats Panel */}
        <div className="p-4">
          <GlassPanel className="rounded-3xl p-6">
            {/* Timer */}
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-white mb-2">
                {formatTime(timeRemaining)}
              </p>
              <p className="text-lg text-white/80">
                {timeRemaining > 0 ? "Remaining Time" : "Completed!"}
              </p>
            </div>
            
            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <i className="fas fa-walking text-blue-300 text-xl mb-2"></i>
                <p className="text-xl font-bold text-white">{steps.toLocaleString()}</p>
                <p className="text-sm text-white/70">Steps</p>
              </div>
              <div className="text-center">
                <i className="fas fa-route text-green-300 text-xl mb-2"></i>
                <p className="text-xl font-bold text-white">{distance.toFixed(2)} km</p>
                <p className="text-sm text-white/70">Distance</p>
              </div>
              <div className="text-center">
                <i className="fas fa-coins text-yellow-300 text-xl mb-2"></i>
                <p className="text-xl font-bold text-white">₹{earnings.toFixed(2)}</p>
                <p className="text-sm text-white/70">Earning</p>
              </div>
            </div>
            
            {/* Action Button */}
            {isWalking && (
              <button
                onClick={handleCompleteWalk}
                disabled={completeWalkMutation.isPending}
                className="w-full py-4 px-6 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-lg border border-red-400/30 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {completeWalkMutation.isPending ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Completing...</>
                ) : (
                  <><i className="fas fa-stop mr-2"></i>Complete Walk</>
                )}
              </button>
            )}
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
