import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { Share2, Instagram, Facebook, Twitter, Mail, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Postcard } from "@shared/schema";

interface SocialShareProps {
  postcard: Postcard;
}

export default function SocialShare({ postcard }: SocialShareProps) {
  const { toast } = useToast();
  const [copiedUrl, setCopiedUrl] = useState(false);

  const shareMutation = useMutation({
    mutationFn: async ({ platform }: { platform: string }) => {
      await apiRequest("POST", `/api/postcards/${postcard.id}/share`, {
        platform,
        userId: postcard.userId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Shared Successfully!",
        description: "Your postcard share has been tracked.",
      });
    },
  });

  const postcardUrl = `${window.location.origin}/postcard/${postcard.id}`;
  const shareText = `Check out my beautiful ${postcard.title} from Odesa! 🇺🇦 Created with Odesa Postcards ✨`;

  const handleShare = (platform: string, url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    shareMutation.mutate({ platform });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postcardUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      toast({
        title: "Link Copied!",
        description: "Postcard link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const shareOptions = [
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-pink-500 hover:bg-pink-600",
      platform: "instagram",
      url: `https://www.instagram.com/`, // Instagram doesn't support direct URL sharing
      action: () => {
        shareMutation.mutate({ platform: "instagram" });
        toast({
          title: "Instagram Sharing",
          description: "Download your postcard and share it on Instagram!",
        });
      }
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      platform: "facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postcardUrl)}&quote=${encodeURIComponent(shareText)}`,
      action: (url: string) => handleShare("facebook", url)
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-blue-400 hover:bg-blue-500",
      platform: "twitter",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postcardUrl)}`,
      action: (url: string) => handleShare("twitter", url)
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
      platform: "email",
      url: `mailto:?subject=${encodeURIComponent(`Beautiful Postcard: ${postcard.title}`)}&body=${encodeURIComponent(`${shareText}\n\nView the postcard: ${postcardUrl}`)}`,
      action: (url: string) => {
        window.location.href = url;
        shareMutation.mutate({ platform: "email" });
      }
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Share Your Postcard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {shareOptions.map((option) => (
            <Button
              key={option.platform}
              onClick={() => option.action(option.url)}
              disabled={shareMutation.isPending}
              className={`${option.color} text-white flex items-center justify-center py-3`}
            >
              <option.icon className="h-4 w-4 mr-2" />
              {option.name}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Share Link</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={postcardUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="px-3 py-2"
            >
              {copiedUrl ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center text-sm text-blue-800">
            <Share2 className="h-4 w-4 mr-2" />
            <span className="font-medium">Pro Tip:</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Share your postcard to get more visibility in our public gallery and help others discover beautiful Odesa!
          </p>
        </div>

        <div className="text-center text-xs text-gray-500">
          <span>Shares: {postcard.shareCount || 0}</span>
          <span className="mx-2">•</span>
          <span>Downloads: {postcard.downloadCount || 0}</span>
        </div>
      </CardContent>
    </Card>
  );
}
