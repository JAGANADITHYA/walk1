import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Train, Coins, CreditCard, QrCode, MapPin } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { RainbowBackground } from "@/components/RainbowBackground";
import { GlassPanel } from "@/components/GlassPanel";
import type { MetroTicket, User } from "@shared/schema";

// Metro stations data
const METRO_STATIONS = [
  "Central Metro Station", "City Center", "Business District", "University Campus",
  "Shopping Mall", "Airport Terminal", "Sports Complex", "Medical Center",
  "Tech Park", "Old Town", "Marina Bay", "Green Valley"
];

// Ticket pricing
const TICKET_PRICES = {
  single: { base: 25, perStation: 5 },
  return: { base: 45, perStation: 8 },
  day_pass: { base: 150, perStation: 0 }
};

export default function Metro() {
  const { toast } = useToast();
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [ticketType, setTicketType] = useState<"single" | "return" | "day_pass">("single");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: tickets = [] } = useQuery<MetroTicket[]>({
    queryKey: ["/api/metro/tickets"],
  });

  const purchaseTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/metro/purchase", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Ticket Purchased Successfully!",
        description: "Your metro ticket has been generated. Check the QR code below.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/metro/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setFromStation("");
      setToStation("");
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase metro ticket",
        variant: "destructive",
      });
    },
  });

  const calculatePrice = () => {
    if (!fromStation || !toStation) return 0;
    const stationDistance = Math.abs(
      METRO_STATIONS.indexOf(fromStation) - METRO_STATIONS.indexOf(toStation)
    );
    const pricing = TICKET_PRICES[ticketType];
    return pricing.base + (pricing.perStation * stationDistance);
  };

  const totalPrice = calculatePrice();
  const userBalance = parseFloat(user?.balance || "0");
  const maxCoinsUsable = Math.min(userBalance, totalPrice * 0.7); // Max 70% can be paid with coins
  const [coinsToUse, setCoinsToUse] = useState(0);
  const cashToPay = Math.max(0, totalPrice - coinsToUse);

  const handlePurchase = () => {
    if (!fromStation || !toStation || !user) return;

    purchaseTicketMutation.mutate({
      fromStation,
      toStation,
      ticketType,
      totalAmount: totalPrice,
      coinsUsed: coinsToUse,
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
              <Train className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Metro Tickets</h1>
              <p className="text-white/70">Buy metro tickets using your earned coins</p>
            </div>
          </div>
        </GlassPanel>

        {/* Purchase New Ticket */}
        <GlassPanel className="rounded-2xl p-6">
          <div className="flex items-center gap-2 text-white mb-6">
            <Train className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Purchase Metro Ticket</h3>
          </div>
          <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from" className="text-white/90">From Station</Label>
              <Select value={fromStation} onValueChange={setFromStation}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select departure" />
                </SelectTrigger>
                <SelectContent>
                  {METRO_STATIONS.map((station) => (
                    <SelectItem key={station} value={station}>
                      {station}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="to" className="text-white/90">To Station</Label>
              <Select value={toStation} onValueChange={setToStation}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {METRO_STATIONS.filter(s => s !== fromStation).map((station) => (
                    <SelectItem key={station} value={station}>
                      {station}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/90">Ticket Type</Label>
            <Select value={ticketType} onValueChange={(value: any) => setTicketType(value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Journey</SelectItem>
                <SelectItem value="return">Return Journey</SelectItem>
                <SelectItem value="day_pass">Day Pass</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {totalPrice > 0 && (
            <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex justify-between items-center text-white">
                <span>Total Price:</span>
                <span className="font-bold">₹{totalPrice}</span>
              </div>

              <div className="space-y-2">
                <Label className="text-white/90">Use Coins (Max: ₹{maxCoinsUsable.toFixed(2)})</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max={maxCoinsUsable}
                    step="0.01"
                    value={coinsToUse}
                    onChange={(e) => setCoinsToUse(Math.min(parseFloat(e.target.value) || 0, maxCoinsUsable))}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="0.00"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCoinsToUse(maxCoinsUsable)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Max
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-white/80">
                  <span className="flex items-center gap-1">
                    <Coins className="h-4 w-4" />
                    Coins Used:
                  </span>
                  <span>₹{coinsToUse.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-semibold">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    Cash to Pay:
                  </span>
                  <span>₹{cashToPay.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={!fromStation || !toStation || purchaseTicketMutation.isPending || userBalance < coinsToUse}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {purchaseTicketMutation.isPending ? "Processing..." : "Purchase Ticket"}
              </Button>
            </div>
          )}
          </div>
        </GlassPanel>

        {/* Active Tickets */}
        <GlassPanel className="rounded-2xl p-6">
          <div className="flex items-center gap-2 text-white mb-6">
            <QrCode className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Your Tickets</h3>
          </div>
            {tickets.length === 0 ? (
              <p className="text-white/70 text-center py-8">No tickets purchased yet</p>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        <span className="text-white font-medium">
                          {ticket.fromStation} → {ticket.toStation}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        ticket.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : ticket.status === 'used'
                          ? 'bg-gray-500/20 text-gray-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
                      <div>Type: {ticket.ticketType.replace('_', ' ').toUpperCase()}</div>
                      <div>Total: ₹{ticket.totalAmount}</div>
                      <div>Coins Used: ₹{ticket.coinsUsed}</div>
                      <div>Cash Paid: ₹{ticket.cashAmount}</div>
                    </div>

                    {ticket.qrCode && ticket.status === 'active' && (
                      <div className="mt-4 p-3 bg-white rounded-lg text-center">
                        <div className="text-2xl font-mono bg-gray-100 p-2 rounded">
                          {ticket.qrCode}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Show this QR code at metro gates</p>
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