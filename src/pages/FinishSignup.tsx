import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, ArrowLeft, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import finishSignupCollage from "@/assets/finish-signup-collage.png";

export default function FinishSignup() {
  const { user, setMockSession } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.email?.split("@")[0] || "");
  const [location, setLocation] = useState("Othaya, KE");
  const [isAdult, setIsAdult] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdult) {
      toast.error("You must be 18 years of age or older to register.");
      return;
    }

    setLoading(true);
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "user";
    
    // Create or update profile
    const profileData = {
      id: user?.id || "mock-user-id",
      full_name: name,
      company: name, // We use name as company name for simplicity
      company_slug: slug,
      company_description: "I love exploring and hosting amazing community events!",
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
      website: "",
      social_links: [
        { platform: "LinkedIn", url: "https://linkedin.com" }
      ]
    };

    try {
      if (user?.id && user.id !== "mock-user-id") {
        // Real Supabase Profile Update
        const { error } = await supabase
          .from("profiles")
          .upsert(profileData);
        
        if (error) throw error;
      } else {
        // Mock Session Update
        setMockSession({
          ...user,
          id: "mock-user-id",
          email: user?.email || "guest@hostquill.com",
          user_metadata: { full_name: name }
        });
        localStorage.setItem("mock_profile", JSON.stringify(profileData));
      }

      toast.success("Profile completed successfully!");
      // Redirect to the newly created profile page
      navigate(`/profile/${slug}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Column: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative">
        <button 
          onClick={() => navigate("/auth")}
          className="absolute top-8 left-8 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
              Finish signing up
            </h1>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-foreground">
                Your name
              </label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. today.dataiq"
                className="h-12 px-4 rounded-xl border-border bg-card/50 text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Your name will be public on your Meetup profile
              </p>
            </div>

            {/* Location Input */}
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-semibold text-foreground">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                  className="h-12 pl-12 pr-4 rounded-xl border-border bg-card/50 text-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We'll use your location to show Meetup events near you.
              </p>
            </div>

            {/* Age Verification Checkbox */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                  Age
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="age"
                  checked={isAdult}
                  onCheckedChange={(checked) => setIsAdult(!!checked)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="age"
                  className="text-sm font-semibold text-foreground cursor-pointer select-none"
                >
                  I am 18 years of age or older.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !isAdult}
              className={`w-full h-12 rounded-full text-base font-semibold transition-all ${
                isAdult
                  ? "bg-[#19192E] text-white hover:bg-[#19192E]/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Column: Creative Collage */}
      <div className="hidden md:flex flex-1 bg-muted/30 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative backdrop gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(340,75%,95%)] rounded-full blur-3xl" />

        <div className="relative max-w-lg w-full aspect-square rounded-3xl overflow-hidden shadow-2xl bg-white border border-border">
          {/* Main Collage Image */}
          <img 
            src={finishSignupCollage} 
            alt="Find new friends, connect with people in your city"
            className="w-full h-full object-cover"
          />

          {/* Floating Sticker Badges */}
          <div className="absolute top-8 left-12 bg-[#9B87F5] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg transform -rotate-6 hover:scale-105 transition-transform cursor-default">
            Find new friends
          </div>

          <div className="absolute bottom-28 left-8 bg-[#F2C94C] text-[#19192E] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg transform rotate-3 hover:scale-105 transition-transform cursor-default">
            Connect with people
          </div>

          <div className="absolute bottom-12 right-12 bg-[#FF758F] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg transform -rotate-3 hover:scale-105 transition-transform cursor-default">
            In your city
          </div>
        </div>
      </div>
    </div>
  );
}
