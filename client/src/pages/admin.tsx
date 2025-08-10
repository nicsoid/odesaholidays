import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import UserManagement from "@/components/admin/UserManagement";
import TemplateManagement from "@/components/admin/TemplateManagement";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, FileImage, BarChart3, 
  Activity, DollarSign, Star, UserPlus, TrendingUp, Shield
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalPostcards: number;
  totalTemplates: number;
  totalEvents: number;
  totalLocations: number;
  revenueThisMonth: number;
  activeUsers: number;
  popularTemplates: Array<{ id: string; name: string; usage: number }>;
}

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Admin check - only favt@i.ua has admin access
  const isAdmin = user?.email === "favt@i.ua";

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, isAdmin, toast]);

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
    retry: false,
  });

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center">
        <Card className="w-96 bg-white dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">Access Denied</h2>
            <p className="text-blue-600 dark:text-blue-400 mb-6">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
      <Navigation />
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Control Panel</h1>
          <p className="text-blue-100">Manage Odesa Holiday Postcards platform</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:text-blue-900">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:text-blue-900">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-white data-[state=active]:text-blue-900">
              <FileImage className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-blue-900">
              <Activity className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
                  <UserPlus className="h-4 w-4 text-yellow-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-blue-100">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Postcards</CardTitle>
                  <FileImage className="h-4 w-4 text-yellow-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalPostcards || 0}</div>
                  <p className="text-xs text-blue-100">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Templates</CardTitle>
                  <Star className="h-4 w-4 text-yellow-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalTemplates || 0}</div>
                  <p className="text-xs text-blue-100">
                    Active templates
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-yellow-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">${stats?.revenueThisMonth?.toFixed(2) || "0.00"}</div>
                  <p className="text-xs text-blue-100">
                    This month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Active Users</span>
                    <span className="text-white font-semibold">{stats?.activeUsers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Total Events</span>
                    <span className="text-white font-semibold">{stats?.totalEvents || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Total Locations</span>
                    <span className="text-white font-semibold">{stats?.totalLocations || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <UserManagement />
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <TemplateManagement />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Analytics Coming Soon</h3>
                  <p className="text-blue-100">Detailed analytics and insights will be available here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}