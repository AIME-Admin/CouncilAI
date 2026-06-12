import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { PLAN_CONFIG } from "@shared/schema";

const PLAN_FEATURES = {
  free: [
    "3 consensus queries per month",
    "Access to all 5 AI models",
    "Basic query history",
    "Standard support",
  ],
  basic: [
    "100 consensus queries per month",
    "Access to all 5 AI models",
    "Full query history",
    "Export to JSON/Markdown",
    "Priority support",
  ],
  pro: [
    "500 consensus queries per month",
    "Access to all 5 AI models",
    "Full query history & analytics",
    "Export to JSON/Markdown",
    "Model weight customization",
    "Priority support",
    "Advanced analytics dashboard",
  ],
  team: [
    "2000 consensus queries per month",
    "Access to all 5 AI models",
    "Full query history & analytics",
    "Export to JSON/Markdown",
    "Model weight customization",
    "Dedicated support",
    "Advanced analytics dashboard",
    "Higher query limits for teams",
  ],
};

export default function Upgrade() {
  const { user, isLoading } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  const { data: stripeConfig } = useQuery<{ testMode: boolean; enabled: boolean }>({
    queryKey: ["/api/stripe/config"],
  });

  const handleUpgrade = async (planTier: string) => {
    if (!user) {
      return;
    }

    setLoadingPlan(planTier);
    
    try {
      // Create Stripe checkout session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier }),
      });

      const { url, error } = await response.json();
      
      if (error) {
        console.error("Stripe error:", error);
        alert("Failed to create checkout session. Please try again.");
        setLoadingPlan(null);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to create checkout session. Please try again.");
      setLoadingPlan(null);
    }
  };

  const currentPlan = user?.planTier || "free";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Upgrade Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get more consensus queries and unlock advanced features
        </p>
        {stripeConfig?.testMode && (
          <Badge variant="outline" className="mt-4">
            Test Mode - Use card: 4242 4242 4242 4242
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {Object.entries(PLAN_CONFIG).map(([tier, config]) => {
          const isCurrent = currentPlan === tier;
          const isPopular = tier === "pro";
          
          return (
            <Card
              key={tier}
              className={`relative ${isPopular ? "border-primary shadow-lg scale-105" : ""}`}
              data-testid={`card-plan-${tier}`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl capitalize">{config.name}</CardTitle>
                  {isCurrent && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    €{config.price}
                  </span>
                  {config.price > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {config.queries} queries per month
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {PLAN_FEATURES[tier as keyof typeof PLAN_FEATURES].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isPopular ? "default" : "outline"}
                  disabled={isCurrent || loadingPlan !== null || isLoading}
                  onClick={() => handleUpgrade(tier)}
                  data-testid={`button-upgrade-${tier}`}
                >
                  {loadingPlan === tier ? (
                    "Processing..."
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : tier === "free" ? (
                    "Current Plan"
                  ) : (
                    `Upgrade to ${config.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>All plans include access to GPT-5.5, Claude Fable 5, Gemini 3.5 Flash, Perplexity Sonar, and Grok 4.3</p>
        <p className="mt-2">Prices in EUR • Cancel anytime • Secure payment via Stripe</p>
      </div>
    </div>
  );
}
