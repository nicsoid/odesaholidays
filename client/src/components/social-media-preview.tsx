import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Copy, Instagram, Twitter, Facebook, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SocialMediaPreviewProps {
  postcardId: string;
  templateName: string;
  message: string;
  landmark: string;
  imageUrl: string;
}

interface SocialMediaCaptions {
  instagram: string;
  twitter: string;
  facebook: string;
  hashtags: string[];
}

export default function SocialMediaPreview({
  postcardId,
  templateName,
  message,
  landmark,
  imageUrl
}: SocialMediaPreviewProps) {
  const { toast } = useToast();
  const [captions, setCaptions] = useState<SocialMediaCaptions | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate captions mutation
  const generateCaptionsMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await apiRequest("POST", "/api/social-media/generate", {
        postcardId,
        templateName,
        message,
        landmark,
        mood: "excited" // Could be dynamic based on message analysis
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCaptions(data);
      setIsGenerating(false);
      toast({
        title: "✨ Captions Generated!",
        description: "AI-powered social media captions are ready to use.",
      });
    },
    onError: (error: any) => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate captions",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${platform} caption copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string, caption: string) => {
    const hashtags = captions?.hashtags.join(' ') || '';
    const fullText = `${caption} ${hashtags}`.trim();
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(fullText)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL, so we copy to clipboard
        copyToClipboard(fullText, 'Instagram');
        toast({
          title: "Ready for Instagram!",
          description: "Caption copied. Open Instagram app to post your postcard.",
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Social Media Preview
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Postcard Preview */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-200 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📮</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">{templateName}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{landmark}</p>
            <p className="text-xs text-gray-500 truncate">{message}</p>
          </div>
        </div>

        {/* Generate Button */}
        {!captions && (
          <Button
            onClick={() => generateCaptionsMutation.mutate()}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Generating AI Captions...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Smart Captions
              </>
            )}
          </Button>
        )}

        {/* Captions Tabs */}
        {captions && (
          <Tabs defaultValue="instagram" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="instagram" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </TabsTrigger>
              <TabsTrigger value="twitter" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter
              </TabsTrigger>
              <TabsTrigger value="facebook" className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                Facebook
              </TabsTrigger>
            </TabsList>

            <TabsContent value="instagram" className="space-y-3">
              <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                <p className="text-sm mb-3">{captions.instagram}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {captions.hashtags.slice(0, 8).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`${captions.instagram} ${captions.hashtags.map(t => `#${t}`).join(' ')}`, 'Instagram')}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => shareToSocial('instagram', captions.instagram)}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    <Instagram className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="twitter" className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm mb-3">{captions.twitter}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {captions.hashtags.slice(0, 5).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`${captions.twitter} ${captions.hashtags.slice(0, 5).map(t => `#${t}`).join(' ')}`, 'Twitter')}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => shareToSocial('twitter', captions.twitter)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Twitter className="h-3 w-3 mr-1" />
                    Tweet
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="facebook" className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm mb-3">{captions.facebook}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {captions.hashtags.slice(0, 6).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`${captions.facebook} ${captions.hashtags.slice(0, 6).map(t => `#${t}`).join(' ')}`, 'Facebook')}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => shareToSocial('facebook', captions.facebook)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Facebook className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {captions && (
          <Button
            variant="outline"
            onClick={() => generateCaptionsMutation.mutate()}
            disabled={isGenerating}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate New Captions
          </Button>
        )}
      </CardContent>
    </Card>
  );
}