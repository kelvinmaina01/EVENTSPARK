import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Check, 
  X, 
  Star, 
  ArrowRight, 
  Users, 
  Zap, 
  BarChart3,
  Mail,
  Calendar,
  Shield,
  Crown,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started with small events",
      price: "$0",
      annualPrice: "$0",
      icon: Users,
      color: "from-gray-500 to-gray-600",
      features: [
        "Up to 50 attendees per event",
        "3 events per month",
        "Basic event pages",
        "Email confirmations",
        "Public event discovery",
        "Mobile check-in",
      ],
      notIncluded: [
        "Custom branding",
        "Advanced analytics",
        "Waitlist management",
        "Email broadcasts",
        "Team collaboration",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      description: "For growing event organizers who need more power",
      price: "$29",
      annualPrice: "$24",
      icon: Zap,
      color: "from-primary to-primary/80",
      features: [
        "Up to 500 attendees per event",
        "Unlimited events",
        "Custom branding & colors",
        "Advanced analytics dashboard",
        "Waitlist with auto-promote",
        "Email broadcasts (1,000/month)",
        "Team collaboration (3 members)",
        "Custom event slugs",
        "Priority support",
      ],
      notIncluded: [
        "White-label options",
        "API access",
        "Dedicated account manager",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Plus",
      description: "For professional event organizers and agencies",
      price: "$99",
      annualPrice: "$79",
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      features: [
        "Unlimited attendees",
        "Everything in Pro, plus:",
        "White-label event pages",
        "API access & webhooks",
        "Custom domains",
        "Advanced integrations",
        "Team collaboration (10 members)",
        "Dedicated support",
        "Custom email templates",
        "Event series management",
      ],
      notIncluded: [
        "SLA guarantee",
        "Custom development",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
  ];

  const enterpriseFeatures = [
    "Everything in Plus, plus:",
    "Unlimited team members",
    "99.9% uptime SLA",
    "Dedicated account manager",
    "Custom development & integrations",
    "Advanced security & compliance",
    "White-label mobile app",
    "Priority phone support",
    "Custom training & onboarding",
    "Advanced reporting & insights",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Simple, transparent pricing
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-display font-bold mb-6"
            >
              Choose your
              <span className="text-primary"> event platform</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              From intimate gatherings to large-scale conferences, Events Spark has the perfect plan for your needs
            </motion.p>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4 mb-12"
            >
              <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
                <Badge variant="secondary" className="ml-2 text-xs">
                  Save 20%
                </Badge>
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`relative ${plan.popular ? 'md:-mt-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full relative overflow-hidden border-2 ${
                plan.popular ? 'border-primary shadow-lg' : 'border-border'
              }`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-[0.02]`} />
                
                <CardContent className="p-8 relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-display font-bold">
                        {isAnnual ? plan.annualPrice : plan.price}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {isAnnual && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed annually (${parseInt(plan.price.slice(1)) * 12}/year)
                      </p>
                    )}
                  </div>

                  <Button 
                    className={`w-full mb-8 ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/register">
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.notIncluded.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 opacity-50">
                        <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-4">Enterprise</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Custom solutions for large organizations with unique requirements
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                  <Link to="/contact">
                    Contact Sales
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enterpriseFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 max-w-3xl mx-auto text-center"
        >
          <h2 className="text-2xl font-display font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-sm text-muted-foreground">
                We offer a 14-day money-back guarantee for all paid plans.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, we use industry-standard encryption and are GDPR compliant.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
