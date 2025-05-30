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
import { apiRequest } from "@/lib/queryClient";
import type { Template, Postcard, InsertPostcard } from "@shared/schema";

export default function Creator() {
  const { templateId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [postcardData, setPostcardData] = useState<Partial<InsertPostcard>>({
    title: "Greetings from Odesa!",
    message: "Having an amazing time exploring this beautiful coastal city!",
    fontFamily: "Inter",
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    isPublic: false,
  });
  const [currentPostcard, setCurrentPostcard] = useState<Postcard | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const createPostcardMutation = useMutation({
    mutationFn: async (data: InsertPostcard) => {
      const response = await apiRequest("POST", "/api/postcards", data);
      return response.json();
    },
    onSuccess: (newPostcard: Postcard) => {
      setCurrentPostcard(newPostcard);
      queryClient.invalidateQueries({ queryKey: ["/api/postcards"] });
      toast({
        title: "Postcard Created!",
        description: "Your beautiful postcard is ready to share.",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (postcardId: number) => {
      await apiRequest("POST", `/api/postcards/${postcardId}/download`, { userId: 1 });
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Your postcard is being downloaded.",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/users", { email });
      return response.json();
    },
    onSuccess: () => {
      setShowEmailPrompt(false);
      handleCreatePostcard();
    },
  });

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setPostcardData(prev => ({ ...prev, templateId }));
      }
    }
  }, [templateId, templates]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setPostcardData(prev => ({ ...prev, templateId: template.id }));
    setLocation(`/creator/${template.id}`);
  };

  const handleCreatePostcard = () => {
    if (!selectedTemplate) {
      toast({
        title: "Select a Template",
        description: "Please choose a template to create your postcard.",
        variant: "destructive",
      });
      return;
    }

    if (!userEmail && !currentPostcard) {
      setShowEmailPrompt(true);
      return;
    }

    createPostcardMutation.mutate({
      ...postcardData as InsertPostcard,
      templateId: selectedTemplate.id,
      userId: 1, // In a real app, this would come from authentication
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
                  placeholder="Enter your email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowEmailPrompt(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-ukrainian-blue hover:bg-blue-700"
                    onClick={() => createUserMutation.mutate(userEmail)}
                    disabled={!userEmail || createUserMutation.isPending}
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
          <div className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-6">Choose Your Template</h2>
            <TemplateGallery 
              templates={templates} 
              showFilters={true}
              onTemplateSelect={handleTemplateSelect}
            />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Editor */}
            <div className="space-y-8 lg:col-span-1">
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
                      <input
                        type="color"
                        id="textColor"
                        value={postcardData.textColor || "#000000"}
                        onChange={(e) => setPostcardData(prev => ({ ...prev, textColor: e.target.value }))}
                        className="w-full h-10 border border-gray-300 rounded-md"
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
                    <Label htmlFor="isPublic" className="text-sm">
                      Share in public gallery (others can see your postcard)
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview & Actions */}
          <div className="space-y-8">
            {selectedTemplate && (
              <>
                <div>
                  <h3 className="font-playfair text-xl font-bold mb-4">Preview</h3>
                  <PostcardCanvas 
                    template={selectedTemplate}
                    postcardData={postcardData}
                  />
                </div>
                
                <div className="space-y-4">
                  {!currentPostcard ? (
                    <Button 
                      onClick={handleCreatePostcard}
                      disabled={createPostcardMutation.isPending}
                      className="w-full bg-ukrainian-blue hover:bg-blue-700 text-lg py-3"
                    >
                      {createPostcardMutation.isPending ? (
                        "Creating..."
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Create My Postcard
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          onClick={handleDownload}
                          disabled={downloadMutation.isPending}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Free
                        </Button>
                        <Button 
                          onClick={handleOrderPrint}
                          className="bg-ukrainian-blue hover:bg-blue-700"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Print ($3.99)
                        </Button>
                      </div>
                      
                      <SocialShare postcard={currentPostcard} />
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
