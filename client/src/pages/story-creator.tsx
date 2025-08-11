import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { 
  Sparkles, 
  Camera, 
  Upload, 
  Copy, 
  Instagram, 
  Share2, 
  RefreshCw,
  MapPin,
  Heart,
  Zap,
  BookOpen,
  Smile,
  Mountain,
  Palette
} from "lucide-react";
import type { TravelStory, InsertTravelStory, StoryPreferences } from "@shared/schema";

interface GeneratedStory {
  title: string;
  story: string;
  instagramCaption: string;
  hashtags: string[];
  mood: string;
  style: string;
}

const MOODS = [
  { value: 'happy', label: 'Happy & Joyful', icon: Smile, color: 'text-yellow-500' },
  { value: 'adventurous', label: 'Adventurous', icon: Mountain, color: 'text-orange-500' },
  { value: 'romantic', label: 'Romantic', icon: Heart, color: 'text-pink-500' },
  { value: 'cultural', label: 'Cultural', icon: BookOpen, color: 'text-purple-500' },
  { value: 'peaceful', label: 'Peaceful', icon: Zap, color: 'text-green-500' },
  { value: 'energetic', label: 'Energetic', icon: Zap, color: 'text-red-500' }
];

const STYLES = [
  { value: 'casual', label: 'Casual & Friendly', description: 'Like chatting with a friend' },
  { value: 'poetic', label: 'Poetic & Lyrical', description: 'Beautiful, artistic language' },
  { value: 'humorous', label: 'Fun & Humorous', description: 'Light-hearted and witty' },
  { value: 'inspirational', label: 'Inspirational', description: 'Uplifting and motivational' }
];

const ODESA_LOCATIONS = [
  'Potemkin Steps',
  'Opera House', 
  'Deribasovskaya Street',
  'Arcadia Beach',
  'City Garden',
  'Vorontsov Palace',
  'Odesa Port',
  'Primorsky Boulevard',
  'Spaso-Preobrazhensky Cathedral',
  'Odesa Catacombs'
];

export default function StoryCreator() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('happy');
  const [selectedStyle, setSelectedStyle] = useState<string>('casual');
  const [userContext, setUserContext] = useState<string>('');
  const [userImage, setUserImage] = useState<File | null>(null);
  const [userImageUrl, setUserImageUrl] = useState<string>('');
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load user's story preferences
  const { data: preferences } = useQuery<StoryPreferences>({
    queryKey: ["/api/story-preferences"],
    enabled: isAuthenticated,
  });

  // Load user's stories
  const { data: userStories = [] } = useQuery<TravelStory[]>({
    queryKey: ["/api/stories"],
    enabled: isAuthenticated,
  });

  const generateStoryMutation = useMutation({
    mutationFn: async (data: {
      location: string;
      mood: string;
      style: string;
      userContext?: string;
    }) => {
      const response = await apiRequest("POST", "/api/stories/generate", data);
      return response.json();
    },
    onSuccess: (story: GeneratedStory) => {
      setGeneratedStory(story);
      setIsGenerating(false);
      toast({
        title: "Story Generated!",
        description: "Your personalized travel story is ready.",
      });
    },
    onError: (error: any) => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed", 
        description: error.message || "Failed to generate story",
        variant: "destructive",
      });
    },
  });

  const saveStoryMutation = useMutation({
    mutationFn: async (storyData: InsertTravelStory) => {
      const response = await apiRequest("POST", "/api/stories", storyData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: "Story Saved!",
        description: "Your travel story has been saved to your collection.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save story",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUserImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateStory = () => {
    if (!selectedLocation) {
      toast({
        title: "Select Location",
        description: "Please choose an Odesa location for your story.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateStoryMutation.mutate({
      location: selectedLocation,
      mood: selectedMood,
      style: selectedStyle,
      userContext: userContext || undefined,
    });
  };

  const handleSaveStory = () => {
    if (!generatedStory || !isAuthenticated) return;

    saveStoryMutation.mutate({
      userId: typeof user?._id === 'string' ? parseInt(user._id) : 1,
      title: generatedStory.title,
      story: generatedStory.story,
      location: selectedLocation,
      mood: generatedStory.mood,
      style: generatedStory.style,
      userImageUrl: userImageUrl || undefined,
      instagramHashtags: generatedStory.hashtags.join(', '),
      instagramCaption: generatedStory.instagramCaption,
      isPublic: false,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`,
      });
    });
  };

  const selectedMoodData = MOODS.find(m => m.value === selectedMood);
  const MoodIcon = selectedMoodData?.icon || Smile;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Sparkles className="h-16 w-16 text-ukrainian-blue mx-auto mb-6" />
          <h1 className="font-playfair text-3xl font-bold mb-4">AI Travel Story Generator</h1>
          <p className="text-gray-600 mb-8">
            Create personalized, Instagram-ready travel stories about your Odesa adventures
          </p>
          <p className="text-gray-500">Please log in to start creating your travel stories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl font-bold mb-4">
            AI Travel Story Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your Odesa adventures into engaging, personalized stories ready for Instagram
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Story Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-ukrainian-blue" />
                  Choose Your Adventure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Location Selection */}
                <div>
                  <Label htmlFor="location">Odesa Location</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an Odesa landmark" />
                    </SelectTrigger>
                    <SelectContent>
                      {ODESA_LOCATIONS.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mood Selection */}
                <div>
                  <Label>Story Mood</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {MOODS.map((mood) => {
                      const Icon = mood.icon;
                      return (
                        <button
                          key={mood.value}
                          onClick={() => setSelectedMood(mood.value)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            selectedMood === mood.value
                              ? 'border-ukrainian-blue bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`h-4 w-4 ${mood.color}`} />
                            <span className="font-medium text-sm">{mood.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Writing Style */}
                <div>
                  <Label>Writing Style</Label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-gray-500">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Personal Context */}
                <div>
                  <Label htmlFor="context">Personal Touch (Optional)</Label>
                  <Textarea
                    id="context"
                    placeholder="Add personal details you'd like included in your story (e.g., traveling with friends, celebrating anniversary, first time visiting, etc.)"
                    value={userContext}
                    onChange={(e) => setUserContext(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <Label>Your Photo (Optional)</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    {userImageUrl ? (
                      <div className="relative">
                        <img
                          src={userImageUrl}
                          alt="User uploaded"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="h-4 w-4 mr-1" />
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 border-dashed"
                      >
                        <Upload className="h-6 w-6 mr-2" />
                        Upload Your Photo
                      </Button>
                    )}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateStory}
                  disabled={!selectedLocation || isGenerating}
                  className="w-full bg-ukrainian-blue hover:bg-blue-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Generating Story...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate AI Story
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated Story Display */}
          <div className="space-y-6">
            {generatedStory ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-ukrainian-blue" />
                      Your Story
                    </span>
                    <div className="flex items-center gap-2">
                      <MoodIcon className={`h-4 w-4 ${selectedMoodData?.color}`} />
                      <Badge variant="secondary">{selectedMoodData?.label}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Story Title */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Title</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generatedStory.title, "Title")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-playfair text-xl font-bold">{generatedStory.title}</h3>
                    </div>
                  </div>

                  {/* Full Story */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Full Story</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generatedStory.story, "Story")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {generatedStory.story}
                      </p>
                    </div>
                  </div>

                  {/* Instagram Caption */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <Instagram className="h-4 w-4 text-pink-500" />
                        Instagram Caption
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generatedStory.instagramCaption, "Caption")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                      <p className="text-gray-700">{generatedStory.instagramCaption}</p>
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Hashtags ({generatedStory.hashtags.length})</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard('#' + generatedStory.hashtags.join(' #'), "Hashtags")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {generatedStory.hashtags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-ukrainian-blue">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleSaveStory}
                      disabled={saveStoryMutation.isPending}
                      variant="outline"
                      className="flex-1"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Save Story
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(
                        `${generatedStory.instagramCaption}\n\n#${generatedStory.hashtags.join(' #')}`,
                        "Instagram post"
                      )}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Copy for Instagram
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Configure your story settings and click "Generate AI Story" to create your personalized travel story
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Previous Stories */}
            {userStories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Previous Stories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userStories.slice(0, 3).map((story) => (
                      <div key={story.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{story.title}</h4>
                          <Badge variant="outline">{story.location}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{story.story}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}