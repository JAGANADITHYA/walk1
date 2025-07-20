import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Gift, Music, Film, Tv, Star, Percent, Coins, CreditCard } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { RainbowBackground } from "@/components/RainbowBackground";
import { GlassPanel } from "@/components/GlassPanel";
import type { RewardRedemption, User } from "@shared/schema";

// Reward offers data
const REWARD_OFFERS = [
  // Spotify Subscriptions
  {
    id: "spotify-premium-1month",
    type: "spotify" as const,
    provider: "spotify",
    title: "Spotify Premium",
    duration: "1 Month",
    originalPrice: 119,
    discountPercent: 25,
    coinsRequired: 30,
    description: "Ad-free music, offline downloads, unlimited skips",
    icon: Music,
    color: "bg-green-500"
  },
  {
    id: "spotify-premium-3month",
    type: "spotify" as const,
    provider: "spotify",
    title: "Spotify Premium",
    duration: "3 Months",
    originalPrice: 357,
    discountPercent: 35,
    coinsRequired: 125,
    description: "3 months of premium music streaming",
    icon: Music,
    color: "bg-green-500"
  },

  // Movie Tickets
  {
    id: "bookmyshow-movie",
    type: "movie_ticket" as const,
    provider: "bookmyshow",
    title: "Movie Ticket",
    duration: "Any Show",
    originalPrice: 250,
    discountPercent: 40,
    coinsRequired: 100,
    description: "Valid for any movie at participating theaters",
    icon: Film,
    color: "bg-red-500"
  },
  {
    id: "pvr-premium-movie",
    type: "movie_ticket" as const,
    provider: "pvr",
    title: "PVR Premium Ticket",
    duration: "Any Show",
    originalPrice: 400,
    discountPercent: 30,
    coinsRequired: 120,
    description: "Premium movie experience with recliner seats",
    icon: Film,
    color: "bg-yellow-500"
  },

  // OTT Subscriptions
  {
    id: "netflix-mobile",
    type: "ott_subscription" as const,
    provider: "netflix",
    title: "Netflix Mobile",
    duration: "1 Month",
    originalPrice: 149,
    discountPercent: 50,
    coinsRequired: 75,
    description: "Mobile-only Netflix subscription",
    icon: Tv,
    color: "bg-red-600"
  },
  {
    id: "prime-video-1month",
    type: "ott_subscription" as const,
    provider: "amazon-prime",
    title: "Prime Video",
    duration: "1 Month",
    originalPrice: 179,
    discountPercent: 35,
    coinsRequired: 65,
    description: "Amazon Prime Video subscription",
    icon: Tv,
    color: "bg-blue-600"
  },
  {
    id: "hotstar-super-3month",
    type: "ott_subscription" as const,
    provider: "hotstar",
    title: "Disney+ Hotstar Super",
    duration: "3 Months",
    originalPrice: 299,
    discountPercent: 45,
    coinsRequired: 135,
    description: "Sports, movies, and TV shows",
    icon: Tv,
    color: "bg-purple-600"
  },
  {
    id: "zee5-premium-1month",
    type: "ott_subscription" as const,
    provider: "zee5",
    title: "ZEE5 Premium",
    duration: "1 Month",
    originalPrice: 99,
    discountPercent: 60,
    coinsRequired: 60,
    description: "Regional and Bollywood content",
    icon: Tv,
    color: "bg-indigo-600"
  }
];

export default function Rewards() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<"all" | "spotify" | "movie_ticket" | "ott_subscription">("all");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: redemptions = [] } = useQuery<RewardRedemption[]>({
    queryKey: ["/api/rewards/redemptions"],
  });

  const redeemRewardMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/rewards/redeem", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Reward Redeemed Successfully!",
        description: "Your redemption is being processed. Check your redemptions below.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to redeem reward",
        variant: "destructive",
      });
    },
  });

  const userBalance = parseFloat(user?.balance || "0");

  const filteredRewards = selectedCategory === "all" 
    ? REWARD_OFFERS 
    : REWARD_OFFERS.filter(reward => reward.type === selectedCategory);

  const handleRedeem = (reward: typeof REWARD_OFFERS[0]) => {
    if (userBalance < reward.coinsRequired) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${reward.coinsRequired} coins to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }

    const discountAmount = (reward.originalPrice * reward.discountPercent) / 100;
    const finalPrice = reward.originalPrice - discountAmount;

    redeemRewardMutation.mutate({
      rewardType: reward.type,
      provider: reward.provider,
      originalPrice: reward.originalPrice,
      discountAmount: discountAmount,
      finalPrice: finalPrice,
      coinsUsed: reward.coinsRequired,
      metadata: JSON.stringify({
        title: reward.title,
        duration: reward.duration,
        description: reward.description
      })
    });
  };

  return (
    <div className="min-h-screen relative">
      <RainbowBackground />
      <BackButton />
      
      <div className="relative z-10 p-4 pt-20 space-y-6">
        <GlassPanel className="rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
              <Gift className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Rewards Store</h1>
              <p className="text-white/70">Redeem your earned coins for premium subscriptions & discounts</p>
            </div>
          </div>
        </GlassPanel>

        {/* Balance Display */}
        <GlassPanel className="rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Coins className="h-5 w-5 text-yellow-400" />
              <span>Available Balance:</span>
            </div>
            <span className="text-2xl font-bold text-yellow-400">₹{userBalance.toFixed(2)}</span>
          </div>
        </GlassPanel>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: "all", label: "All Rewards", icon: Star },
            { key: "spotify", label: "Spotify", icon: Music },
            { key: "movie_ticket", label: "Movies", icon: Film },
            { key: "ott_subscription", label: "OTT", icon: Tv }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(key as any)}
              className={`flex items-center gap-2 whitespace-nowrap ${
                selectedCategory === key
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRewards.map((reward) => {
            const discountAmount = (reward.originalPrice * reward.discountPercent) / 100;
            const finalPrice = reward.originalPrice - discountAmount;
            const canAfford = userBalance >= reward.coinsRequired;
            const Icon = reward.icon;

            return (
              <GlassPanel key={reward.id} className="rounded-2xl p-4 hover:bg-white/5 transition-colors">
                <div className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${reward.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {reward.discountPercent}% OFF
                    </Badge>
                  </div>
                  <h3 className="text-lg text-white font-semibold">{reward.title}</h3>
                  <p className="text-sm text-white/60">{reward.duration}</p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm text-white/70">{reward.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 line-through">₹{reward.originalPrice}</span>
                      <span className="text-xl font-bold text-white">₹{finalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Coins Required:</span>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-yellow-400" />
                        <span className="font-semibold text-yellow-400">{reward.coinsRequired}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">You Save:</span>
                      <span className="font-semibold text-green-400">₹{discountAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford || redeemRewardMutation.isPending}
                    className={`w-full ${
                      canAfford
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                        : "bg-gray-500/50 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {!canAfford 
                      ? `Need ${reward.coinsRequired - userBalance} more coins`
                      : redeemRewardMutation.isPending 
                      ? "Processing..." 
                      : "Redeem Now"
                    }
                  </Button>
                </div>
              </GlassPanel>
            );
          })}
        </div>

        {/* Your Redemptions */}
        <GlassPanel className="rounded-2xl p-6">
          <div className="flex items-center gap-2 text-white mb-6">
            <Gift className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Your Redemptions</h3>
          </div>
          {redemptions.length === 0 ? (
            <p className="text-white/70 text-center py-8">No redemptions yet</p>
          ) : (
            <div className="space-y-4">
              {redemptions.map((redemption) => (
                <div key={redemption.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-500/20 rounded">
                        <Gift className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{redemption.provider}</p>
                        <p className="text-white/60 text-sm">{redemption.rewardType.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      redemption.status === 'confirmed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : redemption.status === 'delivered'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {redemption.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
                    <div>Original: ₹{redemption.originalPrice}</div>
                    <div>Final: ₹{redemption.finalPrice}</div>
                    <div>Discount: ₹{redemption.discountAmount}</div>
                    <div>Coins Used: {redemption.coinsUsed}</div>
                  </div>

                  {redemption.redemptionCode && (
                    <div className="mt-3 p-2 bg-white/10 rounded text-center">
                      <p className="text-xs text-white/60 mb-1">Redemption Code:</p>
                      <p className="text-white font-mono font-bold">{redemption.redemptionCode}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}