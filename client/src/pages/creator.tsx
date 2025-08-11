import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Share2, ShoppingCart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TemplateGallery from "@/components/template-gallery";
import PostcardCanvas from "@/components/postcard-canvas";
import SocialShare from "@/components/social-share";
import AIRecommendations from "@/components/ai-recommendations";
import SocialMediaPreview from "@/components/social-media-preview";
import { apiRequest } from "@/lib/queryClient";
import { 
  InteractiveButton, 
  InteractiveColorPicker, 
  InteractiveFontSelector,
  DraggableElement,
  FloatingNotification,
  InteractiveLoadingSpinner 
} from "@/components/micro-interactions";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useAuth } from "@/hooks/useAuth";
import type { Template, Postcard, InsertPostcard } from "@shared/schema";

export default function Creator() {
  const { templateId, postcardId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  
  // Get URL parameters for landmark suggestions
  const urlParams = new URLSearchParams(window.location.search);
  const landmarkParam = urlParams.get('landmark');

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [postcardData, setPostcardData] = useState<Partial<InsertPostcard>>({
    title: landmarkParam ? `Greetings from ${landmarkParam}!` : "Greetings from Odesa!",
    message: landmarkParam ? `Having an amazing time exploring ${landmarkParam} in this beautiful coastal city!` : "Having an amazing time exploring this beautiful coastal city!",
    fontFamily: "Inter",
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    isPublic: false,
  });
  const [currentPostcard, setCurrentPostcard] = useState<Postcard | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info', isVisible: boolean}>({
    message: '', type: 'info', isVisible: false
  });
  const [landmarkImagesLoaded, setLandmarkImagesLoaded] = useState(false);
  
  const sounds = useSoundEffects();

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  // Load shared postcard if postcardId is provided
  const { data: sharedPostcard } = useQuery<Postcard>({
    queryKey: ["/api/postcards", postcardId],
    enabled: !!postcardId,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/postcards/${postcardId}`);
      return response.json();
    },
  });

  const createPostcardMutation = useMutation({
    mutationFn: async (data: InsertPostcard) => {
      const response = await apiRequest("POST", "/api/postcards", data);
      return response.json();
    },
    onSuccess: (newPostcard: Postcard) => {
      setCurrentPostcard(newPostcard);
      queryClient.invalidateQueries({ queryKey: ["/api/postcards"] });
      sounds.success();
      setNotification({ message: 'Postcard created successfully!', type: 'success', isVisible: true });
      setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 3000);
      toast({
        title: "Postcard Created!",
        description: "Your beautiful postcard is ready to share.",
      });
    },
    onError: (error: any) => {
      sounds.error();
      setNotification({ message: 'Failed to create postcard', type: 'error', isVisible: true });
      setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 3000);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create postcard",
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (postcardId: number) => {
      const response = await apiRequest("POST", `/api/postcards/${postcardId}/download`);
      return response.json();
    },
    onSuccess: () => {
      // Generate and download the postcard image
      downloadPostcardImage();
      sounds.success();
      toast({
        title: "Download Complete",
        description: "Your postcard has been downloaded.",
      });
    },
  });

  const downloadPostcardImage = () => {
    // Find the canvas element
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      toast({
        title: "Download Failed",
        description: "Unable to generate postcard image.",
        variant: "destructive",
      });
      return;
    }

    // Create download link
    const link = document.createElement('a');
    link.download = `odesa-postcard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareMutation = useMutation({
    mutationFn: async (postcardId: number) => {
      const response = await apiRequest("POST", `/api/postcards/${postcardId}/share`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Shared Successfully",
        description: "Your postcard link has been copied to clipboard.",
      });
    },
  });

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [templateId, templates]);

  useEffect(() => {
    if (sharedPostcard && templates.length > 0) {
      const template = templates.find(t => t.id === sharedPostcard.templateId);
      if (template) {
        setSelectedTemplate(template);
        setPostcardData({
          title: sharedPostcard.title,
          message: sharedPostcard.message,
          fontFamily: sharedPostcard.fontFamily || "Inter",
          backgroundColor: sharedPostcard.backgroundColor || "#FFFFFF",
          textColor: sharedPostcard.textColor || "#000000",
          customImageUrl: sharedPostcard.customImageUrl || undefined,
        });
        setCurrentPostcard(sharedPostcard);
      }
    }
  }, [sharedPostcard, templates]);

  // Handle landmark parameter from AI recommendations
  useEffect(() => {
    if (landmarkParam && templates.length > 0 && !selectedTemplate && !landmarkImagesLoaded) {
      // Try to find a template that matches the landmark
      const matchingTemplate = templates.find(t => 
        t.name.toLowerCase().includes(landmarkParam.toLowerCase()) ||
        t.description?.toLowerCase().includes(landmarkParam.toLowerCase())
      ) || templates[0]; // Fallback to first template if no match
      
      setSelectedTemplate(matchingTemplate);
      sounds?.templateSelect?.();
      
      // Load relevant images for the landmark - only once
      fetchLandmarkImages(landmarkParam);
      setLandmarkImagesLoaded(true);
      
      // Show notification about AI suggestion
      setNotification({ 
        message: `AI suggested: Creating postcard for ${landmarkParam}`, 
        type: 'info', 
        isVisible: true 
      });
      setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 4000);
    }
  }, [landmarkParam, templates.length, selectedTemplate, landmarkImagesLoaded, sounds]);

  const fetchLandmarkImages = async (landmark: string) => {
    try {
      const response = await apiRequest("GET", `/api/images/search?query=${encodeURIComponent(landmark)}`);
      const data = await response.json();
      if (data.images && data.images.length > 0) {
        // Set the first image as custom image URL
        setPostcardData(prev => ({
          ...prev,
          customImageUrl: data.images[0].url
        }));
      }
    } catch (error) {
      console.error('Failed to fetch landmark images:', error);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setLocation(`/creator/${template.id}`);
  };

  const handleCreatePostcard = (skipEmailPrompt = false) => {
    if (!selectedTemplate) {
      toast({
        title: "Select a Template",
        description: "Please choose a template to create your postcard.",
        variant: "destructive",
      });
      return;
    }

    // Skip email prompt if user is authenticated or has already provided email or chooses to skip
    if (!isAuthenticated && !userEmail && !currentPostcard && !skipEmailPrompt) {
      setShowEmailPrompt(true);
      return;
    }

    createPostcardMutation.mutate({
      ...postcardData as InsertPostcard,
      templateId: selectedTemplate.id,
      userId: isAuthenticated ? (typeof user?._id === 'string' ? parseInt(user._id) : 1) : 1, // Use authenticated user ID or fallback
    });
  };

  const handleDownload = () => {
    if (!currentPostcard) {
      handleCreatePostcard();
      return;
    }
    downloadMutation.mutate(currentPostcard.id);
  };

  const handleOrderPrint = () => {
    if (!currentPostcard) {
      handleCreatePostcard();
      return;
    }
    setLocation(`/checkout/${currentPostcard.id}`);
  };

  if (showEmailPrompt) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-md mx-auto px-4 py-20">
          <Card>
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 text-ukrainian-blue mx-auto mb-4" />
              <h2 className="font-playfair text-2xl font-bold mb-4">Almost Ready!</h2>
              <p className="text-gray-600 mb-6">
                Enter your email to create your free digital postcard and get exclusive updates.
              </p>
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEmailPrompt(false);
                      handleCreatePostcard(true);
                    }}
                    className="flex-1"
                  >
                    Skip for Now
                  </Button>
                  <Button
                    onClick={() => {
                      setShowEmailPrompt(false);
                      handleCreatePostcard(true);
                    }}
                    className="flex-1 bg-ukrainian-blue hover:bg-blue-700"
                    disabled={!userEmail}
                  >
                    Create Postcard
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                No spam, unsubscribe anytime. Get 20% off your first printed postcard!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="font-playfair text-3xl font-bold text-gray-900">Postcard Creator</h1>
              <p className="text-gray-600">Design your perfect Odesa memory</p>
            </div>
          </div>
          {currentPostcard && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownload} disabled={downloadMutation.isPending}>
                <Download className="h-4 w-4 mr-2" />
                Download Free
              </Button>
              <Button onClick={handleOrderPrint} className="bg-ukrainian-blue hover:bg-blue-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Order Print ($3.99)
              </Button>
            </div>
          )}
        </div>

        {!selectedTemplate ? (
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <h2 className="font-playfair text-2xl font-bold mb-6">Choose Your Template</h2>
              <TemplateGallery 
                templates={templates} 
                showFilters={true}
                onTemplateSelect={handleTemplateSelect}
              />
            </div>
            <div>
              <AIRecommendations />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Editor */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-playfair text-2xl font-bold">Customize Your Postcard</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setLocation("/creator");
                    }}
                  >
                    Change Template
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Postcard Title</Label>
                    <Input
                      id="title"
                      value={postcardData.title || ""}
                      onChange={(e) => setPostcardData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter your postcard title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea
                      id="message"
                      value={postcardData.message || ""}
                      onChange={(e) => setPostcardData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Write your personal message..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fontFamily">Font Family</Label>
                      <select
                        id="fontFamily"
                        value={postcardData.fontFamily || "Inter"}
                        onChange={(e) => setPostcardData(prev => ({ ...prev, fontFamily: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Arial">Arial</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="textColor">Text Color</Label>
                      <Input
                        id="textColor"
                        type="color"
                        value={postcardData.textColor || "#000000"}
                        onChange={(e) => setPostcardData(prev => ({ ...prev, textColor: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={postcardData.backgroundColor || "#FFFFFF"}
                        onChange={(e) => setPostcardData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customImageUrl">Custom Image URL</Label>
                      <Input
                        id="customImageUrl"
                        type="url"
                        value={postcardData.customImageUrl || ""}
                        onChange={(e) => setPostcardData(prev => ({ ...prev, customImageUrl: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={postcardData.isPublic || false}
                      onChange={(e) => setPostcardData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="isPublic">Share in public gallery</Label>
                  </div>
                  
                  {!currentPostcard && (
                    <InteractiveButton 
                      onClick={() => handleCreatePostcard()}
                      disabled={createPostcardMutation.isPending}
                      className="w-full"
                      variant="primary"
                      soundEffect="success"
                    >
                      {createPostcardMutation.isPending ? "Creating..." : "Create Postcard"}
                    </InteractiveButton>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <div>
                <h3 className="font-playfair text-xl font-bold mb-4">Preview</h3>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  {selectedTemplate && (
                    <PostcardCanvas 
                      template={selectedTemplate}
                      postcardData={{
                        title: postcardData.title || undefined,
                        message: postcardData.message || undefined,
                        fontFamily: postcardData.fontFamily || undefined,
                        backgroundColor: postcardData.backgroundColor || undefined,
                        textColor: postcardData.textColor || undefined,
                        customImageUrl: postcardData.customImageUrl || undefined,
                      }}
                      className="w-full max-w-md mx-auto"
                    />
                  )}
                </div>
              </div>

              {currentPostcard && selectedTemplate && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <SocialShare postcard={currentPostcard} />
                    
                    <div className="flex gap-2">
                      <InteractiveButton
                        variant="secondary"
                        onClick={handleDownload}
                        disabled={downloadMutation.isPending}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Free
                      </InteractiveButton>
                      <InteractiveButton
                        onClick={handleOrderPrint}
                        className="flex-1"
                        variant="primary"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Order Print ($3.99)
                      </InteractiveButton>
                    </div>
                    
                    <SocialMediaPreview
                      postcardId={currentPostcard.id.toString()}
                      templateName={selectedTemplate.name}
                      message={currentPostcard.message}
                      landmark={selectedTemplate.name}
                      imageUrl={selectedTemplate.imageUrl}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <FloatingNotification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}