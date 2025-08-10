import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Camera, Star, Sparkles, Eye, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface LandmarkRecommendation {
  name: string;
  description: string;
  category: string;
  historicalSignificance: string;
  bestTimeToVisit: string;
  nearbyAttractions: string[];
  photoTips: string;
  personalizedReason: string;
}

export default function AIRecommendations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Get user preferences
  const { data: userPreferences } = useQuery({
    queryKey: ["/api/user/preferences"],
  });

  // Get AI recommendations
  const { data: recommendations = [], isLoading } = useQuery<LandmarkRecommendation[]>({
    queryKey: ["/api/ai/recommendations"],
    enabled: !!userPreferences?.completedOnboarding,
  });

  // Refresh recommendations mutation
  const refreshRecommendationsMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await apiRequest("POST", "/api/ai/recommendations/refresh", {});
      return response.json();
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      queryClient.setQueryData(["/api/ai/recommendations"], data.recommendations);
      toast({
        title: "✨ New Recommendations!",
        description: "Fresh AI-powered suggestions based on your preferences.",
      });
    },
    onError: (error: any) => {
      setIsGenerating(false);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to refresh recommendations",
        variant: "destructive",
      });
    },
  });

  const categories = ['all', 'Architecture', 'Culture', 'History', 'Nature', 'Entertainment'];
  
  const filteredRecommendations = recommendations.filter(rec => 
    activeCategory === 'all' || rec.category === activeCategory
  );

  const getCategoryIcon = (category: string) => {
    const icons = {
      Architecture: '🏛️',
      Culture: '🎭',
      History: '📚',
      Nature: '🌊',
      Entertainment: '🎪'
    };
    return icons[category as keyof typeof icons] || '📍';
  };

  if (!userPreferences?.completedOnboarding) {
    return (
      <Card className="h-fit sticky top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ukrainian-blue" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription>
            Complete your onboarding to get personalized landmark suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-yellow-50 p-4 rounded-lg">
              <Star className="h-8 w-8 text-ukrainian-blue mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-2">Unlock Personal Recommendations</h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete your setup to get AI-powered suggestions tailored to your interests and travel style.
              </p>
            </div>
            <Link href="/onboarding">
              <Button className="w-full bg-ukrainian-blue hover:bg-blue-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Complete Setup
              </Button>
            </Link>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500">
                Preview: Get suggestions for landmarks like Potemkin Stairs, Opera House, and hidden gems based on your interests!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || isGenerating) {
    return (
      <Card className="h-fit sticky top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ukrainian-blue animate-spin" />
            Generating AI Recommendations...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit sticky top-24">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-ukrainian-blue" />
              Personalized for You
            </CardTitle>
            <CardDescription>
              AI-curated landmarks based on your interests and preferences
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshRecommendationsMutation.mutate()}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Sparkles className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Category Filters */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="text-xs"
              >
                {category === 'all' ? 'All' : `${getCategoryIcon(category)}`}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="space-y-4">
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recommendations in this category</p>
              </div>
            ) : (
              filteredRecommendations.map((rec, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span>{getCategoryIcon(rec.category)}</span>
                          {rec.name}
                        </CardTitle>
                        <Badge variant="secondary" className="w-fit mt-1">
                          {rec.category}
                        </Badge>
                      </div>
                      <Link href={`/creator?landmark=${encodeURIComponent(rec.name)}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Create
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {rec.description}
                    </p>

                    {/* Why recommended */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Why this matches you:
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {rec.personalizedReason}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Best Time:</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 ml-6">
                          {rec.bestTimeToVisit}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Photo Tips:</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 ml-6">
                          {rec.photoTips}
                        </p>
                      </div>
                    </div>

                    {/* Nearby attractions */}
                    {rec.nearbyAttractions.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm">Nearby:</span>
                        </div>
                        <div className="flex flex-wrap gap-1 ml-6">
                          {rec.nearbyAttractions.map((attraction, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {attraction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}