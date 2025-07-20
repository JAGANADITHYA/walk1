import { GlassPanel } from "@/components/GlassPanel";
import { RainbowBackground } from "@/components/RainbowBackground";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RainbowBackground />
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* App Logo/Title */}
        <div className="text-center mb-8 animate-bounce">
          <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">Walk & Earn</h1>
          <p className="text-lg text-white/80">Get paid for staying healthy</p>
        </div>
        
        {/* Login Panel */}
        <GlassPanel className="rounded-3xl p-6">
          <h2 className="text-2xl font-semibold mb-6 text-center text-white">Welcome</h2>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-white/90 mb-6">
                Start your fitness journey and earn rewards for every step you take.
              </p>
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-white/70">
              Join thousands of users earning rewards for walking!
            </p>
          </div>
        </GlassPanel>
        
        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <GlassPanel variant="ultra-glass" className="rounded-2xl p-4 text-center">
            <i className="fas fa-walking text-blue-300 text-2xl mb-2"></i>
            <p className="text-sm text-white/80">Track Steps</p>
          </GlassPanel>
          <GlassPanel variant="ultra-glass" className="rounded-2xl p-4 text-center">
            <i className="fas fa-coins text-yellow-300 text-2xl mb-2"></i>
            <p className="text-sm text-white/80">Earn Money</p>
          </GlassPanel>
          <GlassPanel variant="ultra-glass" className="rounded-2xl p-4 text-center">
            <i className="fas fa-gift text-green-300 text-2xl mb-2"></i>
            <p className="text-sm text-white/80">Redeem Rewards</p>
          </GlassPanel>
        </div>
        
        {/* Terms */}
        <p className="text-center text-sm text-white/70 mt-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
