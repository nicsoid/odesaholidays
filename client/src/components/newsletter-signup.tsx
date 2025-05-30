import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { Mail, Gift, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", {
        email: emailAddress,
        source: "homepage",
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubscribed(true);
      setEmail("");
      toast({
        title: "Successfully Subscribed!",
        description: "Welcome to Odesa Postcards! Check your email for a 20% discount code.",
      });
    },
    onError: (error) => {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    subscribeMutation.mutate(email);
  };

  if (isSubscribed) {
    return (
      <section className="py-20 bg-sunflower">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <Check className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Welcome to Odesa Postcards!
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Check your email for a special 20% discount on your first printed postcard.
          </p>
          <div className="bg-white bg-opacity-20 rounded-xl p-6 max-w-md mx-auto">
            <Gift className="h-8 w-8 text-gray-900 mx-auto mb-3" />
            <p className="text-gray-800 font-medium">
              Your discount code will arrive in the next few minutes!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-sunflower">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Stay Updated with Odesa
        </h2>
        <p className="text-xl text-gray-700 mb-8">
          Get new templates, exclusive discounts, and travel tips delivered to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ukrainian-blue focus:border-transparent bg-white"
            disabled={subscribeMutation.isPending}
          />
          <Button
            type="submit"
            disabled={subscribeMutation.isPending}
            className="bg-ukrainian-blue hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            {subscribeMutation.isPending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Subscribe
              </>
            )}
          </Button>
        </form>
        
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Gift className="h-4 w-4 mr-2 text-sunset-orange" />
            <span>20% off first print</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-ukrainian-blue" />
            <span>Weekly updates</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          No spam, unsubscribe anytime. Join 15,000+ happy travelers!
        </p>
      </div>
    </section>
  );
}
