import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { 
  BarChart3, 
  Download, 
  Share2, 
  ShoppingCart, 
  Eye,
  Instagram,
  Facebook,
  Mail,
  Users,
  TrendingUp,
  Gift,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Analytics, Template, Postcard, Order } from '@shared/schema';

export default function Dashboard() {
  const { toast } = useToast();
  const [referralCode] = useState("REF000001"); // In real app, get from user data
  
  const { data: analytics = [] } = useQuery<Analytics[]>({
    queryKey: ["/api/analytics/user"],
  });

  const { data: userPostcards = [] } = useQuery<Postcard[]>({
    queryKey: ["/api/postcards/user"],
  });

  const { data: userOrders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders/user"],
  });

  const { data: popularTemplates = [] } = useQuery<Template[]>({
    queryKey: ["/api/analytics/popular-templates?limit=5"],
  });

  // Calculate stats
  const totalCreated = userPostcards.length;
  const totalDownloads = userPostcards.reduce((sum, p) => sum + (p.downloadCount || 0), 0);
  const totalShares = userPostcards.reduce((sum, p) => sum + (p.shareCount || 0), 0);
  const totalOrders = userOrders.length;
  const totalRevenue = userOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

  // Platform share breakdown
  const sharesByPlatform = analytics
    .filter(a => a.eventType === 'share')
    .reduce((acc, a) => {
      acc[a.platform || 'other'] = (acc[a.platform || 'other'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const copyReferralLink = () => {
    const referralUrl = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(referralUrl).then(() => {
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard.",
      });
    });
  };

  return (
    <div className="min-h-screen bg-warm-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-gray-900">Your Dashboard</h1>
            <p className="text-gray-600">Track your postcard success and earnings</p>
          </div>
          <Link href="/creator">
            <Button className="bg-ukrainian-blue hover:bg-blue-700">
              Create New Postcard
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Postcards Created</p>
                  <p className="text-3xl font-bold text-ukrainian-blue">{totalCreated}</p>
                </div>
                <Eye className="h-8 w-8 text-ukrainian-blue" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Downloads</p>
                  <p className="text-3xl font-bold text-sunflower">{totalDownloads}</p>
                </div>
                <Download className="h-8 w-8 text-sunflower" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Social Shares</p>
                  <p className="text-3xl font-bold text-sunset-orange">{totalShares}</p>
                </div>
                <Share2 className="h-8 w-8 text-sunset-orange" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Print Orders</p>
                  <p className="text-3xl font-bold text-ocean-blue">{totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-ocean-blue" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="postcards">My Postcards</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Popular Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Popular Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {popularTemplates.map((template, index) => (
                      <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Badge variant="secondary" className="mr-3">#{index + 1}</Badge>
                          <span className="text-sm font-medium">{template.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-ukrainian-blue">
                          {template.usageCount} uses
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sharing Platforms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="h-5 w-5 mr-2" />
                    Sharing Platforms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(sharesByPlatform).map(([platform, count]) => {
                      const getIcon = () => {
                        switch (platform) {
                          case 'instagram': return <Instagram className="h-4 w-4 text-pink-500" />;
                          case 'facebook': return <Facebook className="h-4 w-4 text-blue-600" />;
                          case 'email': return <Mail className="h-4 w-4 text-gray-600" />;
                          default: return <Share2 className="h-4 w-4 text-gray-600" />;
                        }
                      };
                      
                      const percentage = Math.round((count / totalShares) * 100) || 0;
                      
                      return (
                        <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            {getIcon()}
                            <span className="text-sm font-medium ml-3 capitalize">{platform}</span>
                          </div>
                          <span className="text-sm font-semibold text-ukrainian-blue">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="postcards" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPostcards.map((postcard) => (
                <Card key={postcard.id} className="overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-ukrainian-blue to-ocean-blue"></div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{postcard.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{postcard.message}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{postcard.downloadCount} downloads</span>
                      <span>{postcard.shareCount} shares</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link href={`/creator/${postcard.templateId}`}>
                        <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                      </Link>
                      <Link href={`/checkout/${postcard.id}`}>
                        <Button size="sm" className="flex-1 bg-ukrainian-blue hover:bg-blue-700">Print</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {userOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No orders yet</p>
                    <Link href="/creator">
                      <Button className="mt-4 bg-ukrainian-blue hover:bg-blue-700">
                        Create Your First Postcard
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">{order.quantity} postcard(s)</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${order.totalAmount}</p>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Referral Program
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-br from-ukrainian-blue to-ocean-blue text-white p-6 rounded-xl">
                    <h3 className="font-semibold mb-4">Share & Earn</h3>
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
                      <div>
                        <div className="text-2xl font-bold text-sunflower">12</div>
                        <div className="text-sm text-blue-100">Referrals</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-sunflower">$48</div>
                        <div className="text-sm text-blue-100">Credits Earned</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-sunflower">Gold</div>
                        <div className="text-sm text-blue-100">Status Level</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <input 
                        type="text" 
                        value={`${window.location.origin}?ref=${referralCode}`}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-gray-700"
                      />
                      <Button size="sm" variant="outline" onClick={copyReferralLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3">
                      <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                        <Instagram className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Facebook className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="bg-blue-400 hover:bg-blue-500">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="bg-green-500 hover:bg-green-600">
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-center text-sm text-gray-600">
                      Earn $4 credit for each friend who creates their first postcard!
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-sunflower text-gray-900 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">1</div>
                    <div>
                      <h3 className="font-semibold mb-1">Share Your Link</h3>
                      <p className="text-sm text-gray-600">Get your personalized referral link and share it with friends and family.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-sunflower text-gray-900 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">2</div>
                    <div>
                      <h3 className="font-semibold mb-1">Friends Join</h3>
                      <p className="text-sm text-gray-600">When they sign up and create their first postcard, you both get rewarded.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-sunflower text-gray-900 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">3</div>
                    <div>
                      <h3 className="font-semibold mb-1">Earn Credits</h3>
                      <p className="text-sm text-gray-600">Use your credits for free printed postcards or premium features.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
