import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { GlassPanel } from "@/components/GlassPanel";
import { RainbowBackground } from "@/components/RainbowBackground";
import { BrandCustomizer } from "@/components/BrandCustomizer";
import { CircularProgress } from "@/components/ui/circular-progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: !!user,
  });

  const streakBonusMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/bonus/streak");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.amount) {
        toast({
          title: "Bonus Earned!",
          description: `Daily streak bonus: ₹${data.amount}`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      }
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
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
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
  }, [user, authLoading, toast]);

  const handleClaimStreak = () => {
    streakBonusMutation.mutate();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RainbowBackground />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  const walkerProgress = 20; // Progress percentage for demo

  return (
    <div className="min-h-screen pb-20">
      <RainbowBackground />
      
      <div className="relative z-10 p-4 pt-20">
        {/* Header Stats */}
        <div className="flex gap-4 mb-8">
          <GlassPanel className="flex-1 rounded-2xl p-4 animate-bounce">
            <div className="flex items-center gap-3">
              <i className="fas fa-wallet text-yellow-300 text-xl"></i>
              <div>
                <p className="text-sm text-white/80">Wallet Balance</p>
                <p className="text-xl font-bold text-white">
                  ₹{dashboardData?.user?.balance || "0.00"}
                </p>
              </div>
            </div>
          </GlassPanel>
          
          <GlassPanel className="flex-1 rounded-2xl p-4 animate-bounce" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3">
              <i className="fas fa-fire text-orange-400 text-xl"></i>
              <div>
                <p className="text-sm text-white/80">Daily Streak</p>
                <p className="text-xl font-bold text-white">
                  {dashboardData?.user?.dailyStreak || 0} Days
                </p>
              </div>
            </div>
          </GlassPanel>
        </div>
        
        {/* Walk Timer Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <CircularProgress
              value={walkerProgress}
              size={256}
              strokeWidth={8}
              className="animate-pulse"
            >
              <GlassPanel className="rounded-full p-8">
                <div className="text-center">
                  <p className="text-sm text-white/80 mb-1">Walk Timer</p>
                  <p className="text-3xl font-bold text-white mb-2">30:00</p>
                  <Link href="/walk">
                    <button className="px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-full text-white font-semibold transition-all duration-300 transform hover:scale-105">
                      <i className="fas fa-play mr-2"></i>Start Walk
                    </button>
                  </Link>
                </div>
              </GlassPanel>
            </CircularProgress>
          </div>
        </div>
        
        {/* Today's Progress */}
        <GlassPanel className="rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Today's Progress</h3>
            <button
              onClick={handleClaimStreak}
              disabled={streakBonusMutation.isPending}
              className="px-3 py-1 text-sm bg-yellow-500/20 hover:bg-yellow-500/30 backdrop-blur-lg border border-yellow-400/30 rounded-full text-yellow-200 font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {streakBonusMutation.isPending ? "..." : "Claim Streak"}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <i className="fas fa-walking text-blue-300 text-2xl mb-2"></i>
              <p className="text-sm text-white/80">Steps</p>
              <p className="text-xl font-bold text-white">
                {dashboardData?.todaySteps?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="text-center">
              <i className="fas fa-route text-green-300 text-2xl mb-2"></i>
              <p className="text-sm text-white/80">Distance</p>
              <p className="text-xl font-bold text-white">
                {dashboardData?.todayDistance?.toFixed(1) || "0.0"} km
              </p>
            </div>
            <div className="text-center">
              <i className="fas fa-coins text-yellow-300 text-2xl mb-2"></i>
              <p className="text-sm text-white/80">Earned</p>
              <p className="text-xl font-bold text-white">
                ₹{dashboardData?.todayEarnings?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </GlassPanel>

        {/* Navigation */}
        <div className="flex justify-center">
          <GlassPanel className="rounded-full px-2 py-2">
            <div className="flex gap-1">
              <Link href="/">
                <button className="p-3 rounded-full text-white bg-white/20 transition-all duration-300">
                  <i className="fas fa-home text-xl"></i>
                </button>
              </Link>
              <Link href="/walk">
                <button className="p-3 rounded-full text-white hover:bg-white/20 transition-all duration-300">
                  <i className="fas fa-walking text-xl"></i>
                </button>
              </Link>
              <Link href="/wallet">
                <button className="p-3 rounded-full text-white hover:bg-white/20 transition-all duration-300">
                  <i className="fas fa-wallet text-xl"></i>
                </button>
              </Link>
              <Link href="/metro">
                <button className="p-3 rounded-full text-white hover:bg-white/20 transition-all duration-300">
                  <i className="fas fa-subway text-xl"></i>
                </button>
              </Link>
              <Link href="/rewards">
                <button className="p-3 rounded-full text-white hover:bg-white/20 transition-all duration-300">
                  <i className="fas fa-gift text-xl"></i>
                </button>
              </Link>
              <button 
                onClick={() => window.location.href = "/api/logout"}
                className="p-3 rounded-full text-white hover:bg-white/20 transition-all duration-300"
              >
                <i className="fas fa-sign-out-alt text-xl"></i>
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>
      
      {/* Brand Customizer */}
      <BrandCustomizer />
    </div>
  );
}
