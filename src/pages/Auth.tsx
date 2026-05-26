import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import authBg from "@/assets/auth-bg.jpg";
import { supabase } from "@/integrations/supabase/client";

const showSocialAuth = true;

const getEmailName = (value: string) => {
  const localPart = value.split("@")[0] || "there";
  return localPart
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "there";
};

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "sent">("email");
  const [loading, setLoading] = useState(false);
  const emailName = getEmailName(email);

  useEffect(() => {
    if (user) {
      // Check if profile is complete. If not, redirect to finish-signup
      const checkProfile = async () => {
        const mockProfileSaved = localStorage.getItem("mock_profile");
        if (mockProfileSaved) {
          navigate("/dashboard/events", { replace: true });
          return;
        }
        
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("company_slug")
            .eq("id", user.id)
            .maybeSingle();
            
          if (!data?.company_slug) {
            navigate("/finish-signup", { replace: true });
          } else {
            navigate("/dashboard/events", { replace: true });
          }
        } catch {
          navigate("/finish-signup", { replace: true });
        }
      };
      
      checkProfile();
    }
  }, [user, navigate]);

  const handleOAuth = async (provider: "google" | "apple") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard/events`,
      },
    });
    if (error) toast.error(error.message || `${provider} sign-in failed`);
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/finish-signup`,
          shouldCreateUser: true,
          data: {
            preferred_name: emailName,
            signup_source: "hostquill_magic_link",
          },
        }
      });

      if (error) throw error;

      toast.success("Magic link sent. Check your email.");
      setStep("sent");
    } catch (err: any) {
      toast.error(err.message || "Could not send magic link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      {/* Background image */}
      <img
        src={authBg}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Pinkish faint overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(340_75%_58%/0.35)] via-[hsl(340_60%_50%/0.25)] to-[hsl(20_80%_55%/0.30)]" />
      <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <h1 className="mt-6 font-display font-bold text-3xl sm:text-4xl tracking-[-0.02em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            Welcome to Hostquill
          </h1>
          <p className="mt-2 text-white/85 text-sm font-body drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
            Start hosting with a secure email sign-in
          </p>
        </div>

        <div className="bg-card/95 backdrop-blur-xl rounded-3xl p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)] border border-white/10">
          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Social Login Buttons */}
                {showSocialAuth && (
                  <>
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleOAuth("google")}
                        className="w-full h-12 rounded-full text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-md transition-all"
                      >
                        <svg className="!w-4 !h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </Button>
                      <Button
                        onClick={() => handleOAuth("apple")}
                        className="w-full h-12 rounded-full text-sm font-semibold bg-white text-black hover:bg-white/95 shadow-md transition-all"
                      >
                        <svg className="!w-4 !h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.05 12.04c-.03-3.02 2.47-4.48 2.58-4.55-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.1-4.59 1.1-.95 0-2.41-1.07-3.96-1.04-2.04.03-3.92 1.18-4.97 3.01-2.13 3.69-.54 9.13 1.52 12.12 1.01 1.46 2.21 3.1 3.78 3.04 1.52-.06 2.09-.98 3.93-.98 1.83 0 2.36.98 3.96.95 1.64-.03 2.67-1.49 3.67-2.96 1.16-1.7 1.63-3.34 1.65-3.43-.04-.01-3.16-1.21-3.19-4.79zM14.13 3.28c.83-1 1.39-2.4 1.24-3.79-1.2.05-2.65.8-3.51 1.8-.77.89-1.45 2.31-1.27 3.67 1.34.1 2.71-.68 3.54-1.68z"/>
                        </svg>
                        Continue with Apple
                      </Button>
                    </div>

                    <div className="flex items-center my-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] uppercase font-bold text-muted-foreground px-3">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  </>
                )}

                {/* Email Login Form */}
                <form onSubmit={handleSendMagicLink} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-foreground">
                      Email address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11 rounded-xl border-border bg-background"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-full text-sm font-semibold bg-[#19192E] text-white hover:bg-[#19192E]/90 transition-all"
                  >
                    {loading ? "Sending magic link..." : "Send magic link"}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="sent-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">Check your email</h3>
                  <p className="text-xs text-muted-foreground leading-normal">
                    {emailName}, we sent your Hostquill sign-in link to{" "}
                    <strong className="text-foreground">{email}</strong>. Open that email and click
                    the link to continue setting up your organizer account.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => setStep("email")}
                  className="w-full h-11 rounded-full text-sm font-semibold bg-[#19192E] text-white hover:bg-[#19192E]/90 transition-all"
                >
                  Use a different email
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-[10px] text-muted-foreground mt-6 leading-normal">
            By continuing, you agree to our <Link to="#" className="underline">Terms of Service</Link> and <Link to="#" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
