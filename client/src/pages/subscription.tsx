import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  features: string[];
  stripePriceId: string;
}

interface SubscriptionStatus {
  isSubscribed: boolean;
  plan?: SubscriptionPlan;
  status?: string;
}

function CheckoutForm({ planId, onSuccess }: { planId: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/subscription?success=true",
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subscription Successful",
          description: "Welcome to unlimited postcards!",
        });
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
        {isProcessing ? "Processing..." : "Subscribe Now"}
      </Button>
    </form>
  );
}

export default function Subscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Define the new subscription plans
  const newPlans: SubscriptionPlan[] = [
    {
      id: "digital-free",
      name: "Digital Free",
      description: "Perfect for digital postcard enthusiasts",
      monthlyPrice: 0,
      features: [
        "Free digital postcards",
        "5 AI stories per month",
        "Basic templates",
        "Standard quality exports"
      ],
      stripePriceId: ""
    },
    {
      id: "print-ship",
      name: "Print & Ship",
      description: "Digital plus physical postcards with AI stories",
      monthlyPrice: 4.99,
      features: [
        "Unlimited digital postcards",
        "1 free physical postcard per month",
        "20 AI stories per month",
        "No watermarks",
        "Standard templates",
        "Shipping costs apply separately"
      ],
      stripePriceId: "price_print_ship_monthly"
    },
    {
      id: "premium-access",
      name: "Premium Access",
      description: "Full access with premium features and unlimited AI",
      monthlyPrice: 9.99,
      features: [
        "Unlimited digital postcards",
        "Premium templates included",
        "200 AI stories per month",
        "No watermarks",
        "Priority customer support",
        "Advanced customization options",
        "High-resolution exports"
      ],
      stripePriceId: "price_premium_access_monthly"
    }
  ];

  // Use new plans structure
  const plans = newPlans;
  const plansLoading = false;

  // Get user's current subscription status
  const { data: subscriptionStatus, isLoading: statusLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("POST", "/api/subscription/create", { planId });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/cancel", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    createSubscriptionMutation.mutate(planId);
  };

  const handleCancelSubscription = () => {
    if (confirm("Are you sure you want to cancel your subscription?")) {
      cancelSubscriptionMutation.mutate();
    }
  };

  const handlePaymentSuccess = () => {
    setClientSecret(null);
    setSelectedPlan(null);
    queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
  };

  if (plansLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If user is already subscribed, show subscription management
  if (subscriptionStatus?.isSubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              You're Subscribed!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Enjoy unlimited physical postcards with your {subscriptionStatus.plan?.name} plan
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {subscriptionStatus.plan?.name}
              </CardTitle>
              <CardDescription>
                Status: <Badge variant="default">{subscriptionStatus.status}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subscriptionStatus.plan?.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={cancelSubscriptionMutation.isPending}
                className="w-full"
              >
                {cancelSubscriptionMutation.isPending ? "Canceling..." : "Cancel Subscription"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Show payment form if a subscription is being created
  if (clientSecret && selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription>
                Finish setting up your subscription for unlimited postcards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm planId={selectedPlan} onSuccess={handlePaymentSuccess} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show available subscription plans
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Start with 20 free digital postcards, then upgrade for unlimited creations and AI stories.
            Physical postcards available with shipping costs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan: SubscriptionPlan) => (
            <Card key={plan.id} className={`relative border-2 hover:border-blue-300 transition-all ${
              plan.id === 'monthly' ? 'border-ukrainian-blue ring-2 ring-blue-100' : ''
            }`}>
              {plan.id === 'monthly' && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-sunflower text-black">
                  Best Value
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold text-ukrainian-blue">
                  {plan.monthlyPrice === 0 ? 'Free' : `$${plan.monthlyPrice}`}
                  {plan.monthlyPrice > 0 && (
                    <span className="text-sm font-normal text-gray-500">
                      {plan.id === 'weekly' ? '/week' : '/month'}
                    </span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                {plan.id === 'free' ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={createSubscriptionMutation.isPending}
                    className={`w-full ${
                      plan.id === 'monthly' 
                        ? 'bg-ukrainian-blue hover:bg-blue-700' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {createSubscriptionMutation.isPending && selectedPlan === plan.id
                      ? "Creating..."
                      : `Subscribe - $${plan.monthlyPrice}${plan.id === 'weekly' ? '/week' : '/month'}`
                    }
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All subscriptions include free shipping worldwide and can be canceled anytime.
          </p>
        </div>
      </div>
    </div>
  );
}