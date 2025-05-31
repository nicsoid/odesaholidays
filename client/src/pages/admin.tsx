import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Users, Image, Edit, Trash2, Eye, Settings } from "lucide-react";

interface AdminUser {
  _id: string;
  email: string;
  username?: string;
  credits: number;
  isAdmin?: boolean;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalPostcards: number;
  totalTemplates: number;
  totalEvents: number;
  totalLocations: number;
}

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);

  const [newTemplate, setNewTemplate] = useState({
    id: "",
    name: "",
    description: "",
    category: "",
    imageUrl: "",
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    isPopular: false,
  });

  // Check if user is admin (for demo purposes, checking if email contains "admin" or user ID is specific)
  const isAdmin = user?.email?.includes("admin") || user?._id === "6839cd39c5de6bc3b492e772";

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
    queryFn: async () => {
      // For demo, we'll simulate stats
      return {
        totalUsers: 156,
        totalPostcards: 1247,
        totalTemplates: 12,
        totalEvents: 8,
        totalLocations: 23,
      };
    },
  });

  const { data: users = [] } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin && activeTab === "users",
    queryFn: async () => {
      // For demo, return sample users
      return [
        {
          _id: "6839cd39c5de6bc3b492e772",
          email: "favt@i.ua",
          credits: 100,
          isAdmin: true,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "user2",
          email: "user@example.com",
          credits: 50,
          createdAt: new Date().toISOString(),
        },
      ];
    },
  });

  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ["/api/templates"],
    enabled: activeTab === "templates",
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const response = await apiRequest("POST", "/api/admin/templates", templateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setIsCreateTemplateOpen(false);
      setNewTemplate({
        id: "",
        name: "",
        description: "",
        category: "",
        imageUrl: "",
        backgroundColor: "#FFFFFF",
        textColor: "#000000",
        isPopular: false,
      });
      toast({
        title: "Template Created",
        description: "New template has been added successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.id || !newTemplate.name || !newTemplate.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createTemplateMutation.mutate(newTemplate);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Settings },
    { id: "users", label: "Users", icon: Users },
    { id: "templates", label: "Templates", icon: Image },
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage your Odesa Holiday Postcards platform</p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Administrator
          </Badge>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Image className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats?.totalPostcards || 0}</div>
                  <div className="text-sm text-gray-600">Postcards Created</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Image className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats?.totalTemplates || 0}</div>
                  <div className="text-sm text-gray-600">Templates</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Settings className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
                  <div className="text-sm text-gray-600">Events</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Settings className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats?.totalLocations || 0}</div>
                  <div className="text-sm text-gray-600">Locations</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveTab("templates")} 
                    className="flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Template
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab("users")}
                    className="flex items-center justify-center"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((adminUser) => (
                    <div key={adminUser._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{adminUser.email}</div>
                        <div className="text-sm text-gray-600">
                          Credits: {adminUser.credits} • Joined: {new Date(adminUser.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {adminUser.isAdmin && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">Admin</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Template Management</h2>
              <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Template</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTemplate} className="space-y-4">
                    <div>
                      <Label htmlFor="id">Template ID *</Label>
                      <Input
                        id="id"
                        value={newTemplate.id}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, id: e.target.value }))}
                        placeholder="e.g., new-landmark"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Template Name *</Label>
                      <Input
                        id="name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter template name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newTemplate.description}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the template"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="landmark">Landmark</SelectItem>
                          <SelectItem value="coastal">Coastal</SelectItem>
                          <SelectItem value="cultural">Cultural</SelectItem>
                          <SelectItem value="artistic">Artistic</SelectItem>
                          <SelectItem value="vintage">Vintage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        type="url"
                        value={newTemplate.imageUrl}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPopular"
                        checked={newTemplate.isPopular}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, isPopular: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="isPopular">Mark as popular template</Label>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={createTemplateMutation.isPending}
                    >
                      {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    {template.imageUrl ? (
                      <img 
                        src={template.imageUrl} 
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="h-16 w-16 text-blue-400" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}