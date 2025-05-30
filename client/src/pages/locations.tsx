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
import { MapPin, Plus, Star, Navigation, Camera } from "lucide-react";

interface Location {
  _id: string;
  name: string;
  description: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
  category: string;
  isPopular: boolean;
  createdBy: string;
  createdAt: string;
}

export default function Locations() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
      const response = await apiRequest("GET", `/api/locations${params}`);
      return response.json();
    },
  });

  const { data: popularLocations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations/popular"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/locations/popular?limit=6");
      return response.json();
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: async (locationData: any) => {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(locationData),
      });
      if (!response.ok) throw new Error("Failed to create location");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Location Added",
        description: "Your location has been added successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create location",
        variant: "destructive",
      });
    },
  });

  const [newLocation, setNewLocation] = useState({
    name: "",
    description: "",
    address: "",
    coordinates: { lat: 46.4825, lng: 30.7233 }, // Default to Odesa center
    category: "",
    imageUrl: "",
  });

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.name || !newLocation.description || !newLocation.address || !newLocation.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createLocationMutation.mutate(newLocation);
  };

  const categories = [
    { value: "all", label: "All Locations" },
    { value: "landmark", label: "Landmarks" },
    { value: "museum", label: "Museums" },
    { value: "park", label: "Parks" },
    { value: "beach", label: "Beaches" },
    { value: "restaurant", label: "Restaurants" },
    { value: "cafe", label: "Cafes" },
    { value: "shopping", label: "Shopping" },
    { value: "hotel", label: "Hotels" },
    { value: "entertainment", label: "Entertainment" },
    { value: "historical", label: "Historical Sites" },
    { value: "other", label: "Other" },
  ];

  const openInMaps = (location: Location) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">
              Odesa Locations
            </h1>
            <p className="text-gray-600">
              Explore the most beautiful and interesting places in Odesa
            </p>
          </div>
          {isAuthenticated && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 mt-4 sm:mt-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Location</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateLocation} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Location Name *</Label>
                    <Input
                      id="name"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter location name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newLocation.description}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the location"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={newLocation.address}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter full address"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lat">Latitude</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        value={newLocation.coordinates.lat}
                        onChange={(e) => setNewLocation(prev => ({ 
                          ...prev, 
                          coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="46.4825"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng">Longitude</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        value={newLocation.coordinates.lng}
                        onChange={(e) => setNewLocation(prev => ({ 
                          ...prev, 
                          coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="30.7233"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={newLocation.category} onValueChange={(value) => setNewLocation(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={newLocation.imageUrl}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={createLocationMutation.isPending}
                  >
                    {createLocationMutation.isPending ? "Adding..." : "Add Location"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Popular Locations */}
        {popularLocations.length > 0 && (
          <section className="mb-12">
            <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              Popular Locations
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularLocations.map((location) => (
                <Card key={location._id} className="hover:shadow-lg transition-shadow">
                  {location.imageUrl && (
                    <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img 
                        src={location.imageUrl} 
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{location.name}</h3>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                    <div className="flex items-center text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{location.address}</span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{location.description}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => openInMaps(location)}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Open in Maps
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Filter */}
        <div className="mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* All Locations */}
        <section>
          <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">
            All Locations
          </h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading locations...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No locations found</h3>
              <p className="text-gray-500">
                {isAuthenticated 
                  ? "Be the first to add a location to this category!" 
                  : "Check back later for new locations."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <Card key={location._id} className="hover:shadow-lg transition-shadow">
                  {location.imageUrl && (
                    <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img 
                        src={location.imageUrl} 
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{location.name}</h3>
                      {location.isPopular && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{location.address}</span>
                    </div>
                    <p className="text-gray-600 mb-4">{location.description}</p>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-3">
                      {categories.find(c => c.value === location.category)?.label || location.category}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => openInMaps(location)}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Open in Maps
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}