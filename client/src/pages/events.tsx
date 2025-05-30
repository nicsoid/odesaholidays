import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, MapPin, Plus, Clock, Users, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Event {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  locationId?: string;
  organizer: string;
  category: string;
  ticketUrl?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export default function Events() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
      const response = await apiRequest("GET", `/api/events${params}`);
      return response.json();
    },
  });

  const { data: upcomingEvents = [] } = useQuery<Event[]>({
    queryKey: ["/api/events/upcoming"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/events/upcoming?limit=5");
      return response.json();
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Event Created",
        description: "Your event has been added successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    organizer: "",
    category: "",
    ticketUrl: "",
    imageUrl: "",
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.description || !newEvent.startDate || !newEvent.organizer || !newEvent.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createEventMutation.mutate(newEvent);
  };

  const categories = [
    { value: "all", label: "All Events" },
    { value: "festival", label: "Festivals" },
    { value: "cultural", label: "Cultural" },
    { value: "music", label: "Music" },
    { value: "art", label: "Art & Exhibitions" },
    { value: "food", label: "Food & Dining" },
    { value: "sports", label: "Sports" },
    { value: "business", label: "Business" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">
              Odesa Events
            </h1>
            <p className="text-gray-600">
              Discover exciting events happening in beautiful Odesa
            </p>
          </div>
          {isAuthenticated && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 mt-4 sm:mt-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Event Name *</Label>
                    <Input
                      id="name"
                      value={newEvent.name}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter event name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the event"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="organizer">Organizer *</Label>
                    <Input
                      id="organizer"
                      value={newEvent.organizer}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, organizer: e.target.value }))}
                      placeholder="Event organizer"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={newEvent.category} onValueChange={(value) => setNewEvent(prev => ({ ...prev, category: value }))}>
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
                    <Label htmlFor="ticketUrl">Ticket URL</Label>
                    <Input
                      id="ticketUrl"
                      type="url"
                      value={newEvent.ticketUrl}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, ticketUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={newEvent.imageUrl}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? "Creating..." : "Create Event"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">
              Upcoming Events
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center text-blue-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {format(new Date(event.startDate), "MMM dd, yyyy 'at' HH:mm")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{event.organizer}</span>
                    </div>
                    {event.ticketUrl && (
                      <Button asChild size="sm" className="w-full">
                        <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get Tickets
                        </a>
                      </Button>
                    )}
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

        {/* All Events */}
        <section>
          <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">
            All Events
          </h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
              <p className="text-gray-500">
                {isAuthenticated 
                  ? "Be the first to add an event to this category!" 
                  : "Check back later for upcoming events."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event._id} className="hover:shadow-lg transition-shadow">
                  {event.imageUrl && (
                    <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img 
                        src={event.imageUrl} 
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center text-blue-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {format(new Date(event.startDate), "MMM dd, yyyy 'at' HH:mm")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
                    <p className="text-gray-600 mb-3">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{event.organizer}</span>
                    </div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-3">
                      {categories.find(c => c.value === event.category)?.label || event.category}
                    </span>
                    {event.ticketUrl && (
                      <Button asChild size="sm" className="w-full">
                        <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get Tickets
                        </a>
                      </Button>
                    )}
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