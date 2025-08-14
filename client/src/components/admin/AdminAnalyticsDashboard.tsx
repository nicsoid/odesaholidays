import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, Users, FileImage, ShoppingCart, 
  DollarSign, TrendingUp, Activity, Clock,
  UserPlus, Star, Target, Calendar
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export default function AdminAnalyticsDashboard() {
  // Fetch admin statistics
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });

  // Fetch monthly analytics
  const { data: monthlyData = [], isLoading: monthlyLoading } = useQuery({
    queryKey: ['/api/admin/analytics/monthly'],
    retry: false,
  });

  if (statsLoading || monthlyLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Chart colors
  const chartColors = {
    primary: '#004C9F',
    secondary: '#FFD300',
    accent: '#0066CC',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
  };

  // Pie chart colors
  const pieColors = [chartColors.primary, chartColors.secondary, chartColors.accent, chartColors.success, chartColors.warning];

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</p>
                <p className="text-blue-200 text-xs mt-1">
                  +{stats?.newUsersThisMonth || 0} this month
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Total Postcards</p>
                <p className="text-3xl font-bold">{stats?.totalPostcards?.toLocaleString() || 0}</p>
                <p className="text-yellow-200 text-xs mt-1">
                  {stats?.activeUsers || 0} active users
                </p>
              </div>
              <FileImage className="h-12 w-12 text-yellow-200" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold">{stats?.totalOrders?.toLocaleString() || 0}</p>
                <p className="text-green-200 text-xs mt-1">Print orders</p>
              </div>
              <ShoppingCart className="h-12 w-12 text-green-200" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
                <p className="text-purple-200 text-xs mt-1">All time</p>
              </div>
              <DollarSign className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats?.totalStories?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">AI Stories Created</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats?.activeUsers?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Active Users (30d)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <UserPlus className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats?.newUsersThisMonth?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">New This Month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats?.popularTemplates?.length || 0}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Popular Templates</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Monthly Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stackId="1"
                      stroke={chartColors.primary} 
                      fill={chartColors.primary}
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="postcards" 
                      stackId="1"
                      stroke={chartColors.secondary} 
                      fill={chartColors.secondary}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill={chartColors.success} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">User & Content Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke={chartColors.primary} 
                    strokeWidth={3}
                    name="New Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="postcards" 
                    stroke={chartColors.secondary} 
                    strokeWidth={3}
                    name="Postcards Created"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke={chartColors.success} 
                    strokeWidth={3}
                    name="Orders Placed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Most Popular Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.popularTemplates?.slice(0, 10).map((template: any, index: number) => (
                    <div key={template.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                          ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-yellow-600' : 'bg-blue-500'}`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-100">{template.name}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">{template.category}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {template.usageCount} uses
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Template Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Template Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats?.popularTemplates?.reduce((acc: any[], template: any) => {
                        const existing = acc.find(item => item.name === template.category);
                        if (existing) {
                          existing.value += template.usageCount;
                        } else {
                          acc.push({ name: template.category, value: template.usageCount });
                        }
                        return acc;
                      }, []) || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats?.popularTemplates?.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentActivity?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                      ${activity.type === 'postcard_created' ? 'bg-blue-500' : 
                        activity.type === 'order_created' ? 'bg-green-500' : 'bg-purple-500'} text-white`}>
                      {activity.type === 'postcard_created' ? (
                        <FileImage className="h-5 w-5" />
                      ) : activity.type === 'order_created' ? (
                        <ShoppingCart className="h-5 w-5" />
                      ) : (
                        <Activity className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {activity.description}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {new Date(activity.timestamp).toLocaleString()}
                        {activity.userId && ` • User ID: ${activity.userId}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}