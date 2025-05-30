import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CreditCard, Truck } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Postcard, InsertOrder } from '@shared/schema';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ order, amount }: { order: any, amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
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
        title: "Payment Successful",
        description: "Your postcard order has been confirmed!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || !elements}
        className="w-full bg-ukrainian-blue hover:bg-blue-700 text-lg py-3"
      >
        <CreditCard className="h-5 w-5 mr-2" />
        Complete Order (${amount.toFixed(2)})
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { postcardId } = useParams();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [orderData, setOrderData] = useState({
    quantity: 1,
    shippingAddress: "",
  });
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const { data: postcard, isLoading: postcardLoading } = useQuery<Postcard>({
    queryKey: [`/api/postcards/${postcardId}`],
    enabled: !!postcardId,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderRequest: InsertOrder) => {
      const response = await apiRequest("POST", "/api/orders", orderRequest);
      return response.json();
    },
    onSuccess: async (order) => {
      setCurrentOrder(order);
      // Create payment intent
      const amount = parseFloat(order.totalAmount);
      const paymentResponse = await apiRequest("POST", "/api/create-payment-intent", { 
        amount,
        orderId: order.id 
      });
      const paymentData = await paymentResponse.json();
      setClientSecret(paymentData.clientSecret);
    },
    onError: (error) => {
      toast({
        title: "Order Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unitPrice = 3.99;
  const totalAmount = unitPrice * orderData.quantity;

  const handleCreateOrder = () => {
    if (!postcard) return;
    
    if (!orderData.shippingAddress.trim()) {
      toast({
        title: "Shipping Address Required",
        description: "Please enter your shipping address.",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({
      userId: 1, // In real app, get from auth
      postcardId: postcard.id,
      quantity: orderData.quantity,
      unitPrice: unitPrice.toString(),
      totalAmount: totalAmount.toString(),
      shippingAddress: orderData.shippingAddress,
    });
  };

  if (postcardLoading) {
    return (
      <div className="min-h-screen bg-warm-white pt-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-ukrainian-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!postcard) {
    return (
      <div className="min-h-screen bg-warm-white pt-20">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Postcard Not Found</h1>
          <Link href="/creator">
            <Button>Create a Postcard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href={`/creator/${postcard.templateId}`}>
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
          </Link>
          <div>
            <h1 className="font-playfair text-3xl font-bold text-gray-900">Order Your Postcard</h1>
            <p className="text-gray-600">Premium quality printing and worldwide shipping</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Order Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <select
                    id="quantity"
                    value={orderData.quantity}
                    onChange={(e) => setOrderData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md mt-1"
                  >
                    {[1, 2, 3, 4, 5, 10].map(num => (
                      <option key={num} value={num}>{num} postcard{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="shippingAddress">Shipping Address</Label>
                  <Textarea
                    id="shippingAddress"
                    value={orderData.shippingAddress}
                    onChange={(e) => setOrderData(prev => ({ ...prev, shippingAddress: e.target.value }))}
                    placeholder="Enter your complete shipping address..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Unit Price:</span>
                    <span>${unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Quantity:</span>
                    <span>{orderData.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-lg border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>✓ Premium 300gsm paper</p>
                  <p>✓ Worldwide shipping included</p>
                  <p>✓ Tracking number provided</p>
                  <p>✓ 7-14 business days delivery</p>
                </div>
              </CardContent>
            </Card>

            {!clientSecret && (
              <Button 
                onClick={handleCreateOrder}
                disabled={createOrderMutation.isPending}
                className="w-full bg-ukrainian-blue hover:bg-blue-700 text-lg py-3"
              >
                {createOrderMutation.isPending ? "Creating Order..." : "Continue to Payment"}
              </Button>
            )}
          </div>

          {/* Postcard Preview & Payment */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Postcard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="h-48 bg-gradient-to-br from-ukrainian-blue to-ocean-blue rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-white font-playfair text-lg">Template Preview</span>
                  </div>
                  <h3 className="font-playfair text-lg font-semibold mb-2">{postcard.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{postcard.message}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Created with Odesa Postcards</span>
                    <span>♥ You</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {clientSecret && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm order={currentOrder} amount={totalAmount} />
                  </Elements>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
