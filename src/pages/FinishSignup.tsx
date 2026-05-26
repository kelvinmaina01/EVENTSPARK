import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

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
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      {/* Brand panel */}
      <section className="relative overflow-hidden bg-foreground text-background dark:bg-[#090914] dark:text-white">
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-primary/20 blur-3xl" />
        <div className="relative flex min-h-[360px] flex-col justify-between px-7 py-8 sm:px-10 lg:min-h-screen lg:px-16 lg:py-16 xl:px-24">
          <Logo size="md" className="[&_*:last-child]:text-background dark:[&_*:last-child]:text-white" />

          <div className="max-w-2xl py-12 lg:py-0">
            <p className="mb-7 text-xs font-bold uppercase tracking-[0.36em] text-primary">
              The event platform
            </p>
            <h1 className="font-display text-5xl font-extrabold leading-[0.98] tracking-normal text-background dark:text-white sm:text-6xl xl:text-7xl">
              Where <span className="italic text-primary">ideas</span> become communities.
            </h1>
            <p className="mt-8 max-w-xl text-base font-semibold leading-8 text-background/60 dark:text-white/58 sm:text-lg">
              Build branded registration pages, manage attendees, and grow the people around your events.
            </p>
          </div>

          <div className="grid gap-3 text-sm font-semibold text-background/65 dark:text-white/60 sm:grid-cols-3 lg:max-w-2xl">
            <div className="border-t border-background/15 pt-4">Branded pages</div>
            <div className="border-t border-background/15 pt-4">Attendee tracking</div>
            <div className="border-t border-background/15 pt-4">Organizer profiles</div>
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="flex items-center bg-background px-6 py-10 sm:px-10 lg:min-h-screen lg:px-14 xl:px-20">
        <div className="w-full max-w-[560px] mx-auto">
          <button
            onClick={() => navigate("/auth")}
            className="mb-10 inline-flex items-center gap-3 rounded-full text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background lg:mb-16"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mb-12">
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-normal text-foreground sm:text-5xl">
              Finish signing up
            </h2>
            <p className="mt-3 text-lg font-medium text-muted-foreground">
              Just a few details to get your Hostquill account started.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-8">
            {/* Name Input */}
            <div className="space-y-3">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/75">
                Your name
              </label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Wanjiku"
                className="h-16 rounded-2xl border-2 border-border bg-card px-5 text-base font-semibold text-foreground shadow-none transition-colors placeholder:text-muted-foreground/55 focus-visible:ring-2 focus-visible:ring-primary/25"
              />
              <p className="text-sm font-medium text-muted-foreground">
                Your name will be public on your Hostquill profile.
              </p>
            </div>

            {/* Location Input */}
            <div className="space-y-3">
              <label htmlFor="location" className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/75">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                  className="h-16 rounded-2xl border-2 border-border bg-card pl-14 pr-5 text-base font-semibold text-foreground shadow-none transition-colors placeholder:text-muted-foreground/55 focus-visible:ring-2 focus-visible:ring-primary/25"
                />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                We'll use your location to show events near you.
              </p>
            </div>

            {/* Age Verification Checkbox */}
            <div className="flex items-center gap-4 pt-1">
              <Checkbox
                id="age"
                checked={isAdult}
                onCheckedChange={(checked) => setIsAdult(!!checked)}
                className="h-7 w-7 rounded-lg border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label
                htmlFor="age"
                className="cursor-pointer select-none text-base font-semibold text-foreground/80"
              >
                I am 18 years of age or older.
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !isAdult}
              className={`h-14 w-full rounded-2xl text-base font-bold transition-all sm:h-16 sm:text-lg ${
                isAdult
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {loading ? "Creating account..." : (
                <span className="inline-flex items-center gap-2">
                  Create my account
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
