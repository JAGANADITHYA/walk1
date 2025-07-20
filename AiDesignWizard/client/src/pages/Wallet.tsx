import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { GlassPanel } from "@/components/GlassPanel";
import { RainbowBackground } from "@/components/RainbowBackground";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

export default function Wallet() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: !!user,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error)) {
        return false;
      }
      return failureCount < 3;
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earning":
        return "fas fa-walking text-green-300";
      case "bonus":
        return "fas fa-gift text-yellow-300";
      case "redemption":
        return "fas fa-shopping-cart text-blue-300";
      default:
        return "fas fa-coins text-gray-300";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earning":
      case "bonus":
        return "text-green-300";
      case "redemption":
        return "text-red-300";
      default:
        return "text-gray-300";
    }
  };

  const formatAmount = (amount: string, type: string) => {
    const sign = type === "redemption" ? "-" : "+";
    return `${sign}₹${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RainbowBackground />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <RainbowBackground />
      
      <div className="relative z-10 p-4 pt-20">
        <BackButton />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div></div>
          <h1 className="text-2xl font-bold text-white">Wallet</h1>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-full p-3">
            <i className="fas fa-bell text-white text-xl"></i>
          </div>
        </div>
        
        {/* Total Balance */}
        <GlassPanel className="rounded-3xl p-8 mb-6 text-center animate-pulse">
          <p className="text-lg text-white/80 mb-2">Total Balance</p>
          <p className="text-5xl font-bold text-white mb-4">
            ₹{dashboardData?.user?.balance || "0.00"}
          </p>
          <div className="flex gap-3 justify-center">
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-xl text-white font-semibold transition-all duration-300">
              <i className="fas fa-plus mr-2"></i>Add Money
            </button>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-xl text-white font-semibold transition-all duration-300">
              <i className="fas fa-gift mr-2"></i>Redeem
            </button>
          </div>
        </GlassPanel>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <GlassPanel className="rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <i className="fas fa-calendar-day text-blue-300 text-xl"></i>
              <div>
                <p className="text-sm text-white/80">Today's Earning</p>
                <p className="text-xl font-bold text-white">
                  ₹{dashboardData?.todayEarnings?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </GlassPanel>
          <GlassPanel className="rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <i className="fas fa-chart-line text-green-300 text-xl"></i>
              <div>
                <p className="text-sm text-white/80">This Month</p>
                <p className="text-xl font-bold text-white">
                  ₹{dashboardData?.monthlyEarnings?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </GlassPanel>
        </div>
        
        {/* Transaction History */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
          
          {transactionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <GlassPanel key={i} variant="ultra-glass" className="rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                      <div>
                        <div className="w-24 h-4 bg-white/20 rounded mb-2"></div>
                        <div className="w-16 h-3 bg-white/20 rounded"></div>
                      </div>
                    </div>
                    <div className="w-16 h-6 bg-white/20 rounded"></div>
                  </div>
                </GlassPanel>
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <GlassPanel
                  key={transaction.id}
                  variant="ultra-glass"
                  className="rounded-2xl p-4 border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-full p-2">
                        <i className={getTransactionIcon(transaction.type)}></i>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{transaction.description}</p>
                        <p className="text-sm text-white/70">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                      {formatAmount(transaction.amount, transaction.type)}
                    </p>
                  </div>
                </GlassPanel>
              ))}
            </div>
          ) : (
            <GlassPanel variant="ultra-glass" className="rounded-2xl p-8 text-center">
              <i className="fas fa-history text-white/50 text-4xl mb-4"></i>
              <p className="text-white/80">No transactions yet</p>
              <p className="text-sm text-white/60 mt-2">
                Complete walks to earn your first rewards!
              </p>
            </GlassPanel>
          )}
        </div>
        
        {/* Redeem Section */}
        <GlassPanel className="rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Redeem Rewards</h3>
          <div className="grid grid-cols-2 gap-3">
            <GlassPanel variant="ultra-glass" className="rounded-xl p-4 text-center">
              <i className="fas fa-shopping-cart text-blue-300 text-2xl mb-2"></i>
              <p className="text-sm font-semibold text-white">Amazon</p>
              <p className="text-xs text-white/70">₹100 Voucher</p>
              <button className="mt-2 px-3 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-lg border border-blue-400/30 rounded-full text-blue-200 transition-all">
                Redeem
              </button>
            </GlassPanel>
            <GlassPanel variant="ultra-glass" className="rounded-xl p-4 text-center">
              <i className="fas fa-gift text-green-300 text-2xl mb-2"></i>
              <p className="text-sm font-semibold text-white">Flipkart</p>
              <p className="text-xs text-white/70">₹200 Voucher</p>
              <button className="mt-2 px-3 py-1 text-xs bg-green-500/20 hover:bg-green-500/30 backdrop-blur-lg border border-green-400/30 rounded-full text-green-200 transition-all">
                Redeem
              </button>
            </GlassPanel>
          </div>
        </GlassPanel>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <GlassPanel className="rounded-full px-2 py-2">
            <div className="flex gap-1">
              <Link href="/">
                <button className="p-3 rounded-full text-white hover:bg-white/20 transition-all duration-300">
                  <i className="fas fa-home text-xl"></i>
                </button>
              </Link>
              <Link href="/walk">
                <button className="p-3 rounded-full text-white hover:bg-white/20 transition-all duration-300">
                  <i className="fas fa-walking text-xl"></i>
                </button>
              </Link>
              <button className="p-3 rounded-full text-white bg-white/20 transition-all duration-300">
                <i className="fas fa-wallet text-xl"></i>
              </button>
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
    </div>
  );
}
