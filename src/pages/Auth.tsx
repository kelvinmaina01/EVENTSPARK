import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";
import authBg from "@/assets/auth-bg.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard/events", { replace: true });
  }, [user, navigate]);

  const handleOAuth = async (provider: "google" | "apple") => {
    const { error } = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin + "/dashboard/events",
    });
    if (error) toast.error(error.message || `${provider} sign-in failed`);
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
            Welcome to eventspark
          </h1>
          <p className="mt-2 text-white/85 text-sm font-body drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
            Create events people actually want to attend
          </p>
        </div>

        <div className="bg-card/95 backdrop-blur-xl rounded-3xl p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)]">
          <div className="space-y-3">
            <Button
              onClick={() => handleOAuth("google")}
              className="w-full h-14 rounded-full text-base font-medium bg-foreground text-background hover:bg-foreground/90 shadow-md"
            >
              <svg className="!w-5 !h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            <Button
              onClick={() => handleOAuth("apple")}
              className="w-full h-14 rounded-full text-base font-medium bg-white text-black hover:bg-white/95 shadow-md"
            >
              <svg className="!w-5 !h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 12.04c-.03-3.02 2.47-4.48 2.58-4.55-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.1-4.59 1.1-.95 0-2.41-1.07-3.96-1.04-2.04.03-3.92 1.18-4.97 3.01-2.13 3.69-.54 9.13 1.52 12.12 1.01 1.46 2.21 3.1 3.78 3.04 1.52-.06 2.09-.98 3.93-.98 1.83 0 2.36.98 3.96.95 1.64-.03 2.67-1.49 3.67-2.96 1.16-1.7 1.63-3.34 1.65-3.43-.04-.01-3.16-1.21-3.19-4.79zM14.13 3.28c.83-1 1.39-2.4 1.24-3.79-1.2.05-2.65.8-3.51 1.8-.77.89-1.45 2.31-1.27 3.67 1.34.1 2.71-.68 3.54-1.68z"/>
              </svg>
              Continue with Apple
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
