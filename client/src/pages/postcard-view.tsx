import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, Heart, Eye } from "lucide-react";
import PostcardCanvas from "@/components/postcard-canvas";
import SocialShare from "@/components/social-share";
import { apiRequest } from "@/lib/queryClient";
import type { Template, Postcard } from "@shared/schema";

export default function PostcardView() {
  const { postcardId } = useParams();

  const { data: postcard, isLoading: postcardLoading } = useQuery<Postcard>({
    queryKey: ["/api/postcards", postcardId],
    enabled: !!postcardId,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/postcards/${postcardId}`);
      if (!response.ok) {
        throw new Error("Postcard not found");
      }
      return response.json();
    },
  });

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const template = templates.find(t => t.id === postcard?.templateId);

  if (postcardLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading postcard...</p>
        </div>
      </div>
    );
  }

  if (!postcard || !template) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Postcard Not Found</h1>
            <p className="text-gray-600 mb-8">
              The postcard you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="font-playfair text-3xl font-bold text-gray-900">{postcard.title}</h1>
              <p className="text-gray-600">A beautiful postcard from Odesa</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{postcard.shareCount || 0} views</span>
            </div>
            <div className="flex items-center">
              <Download className="h-4 w-4 mr-1" />
              <span>{postcard.downloadCount || 0} downloads</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Postcard Display */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <PostcardCanvas 
                  template={template}
                  postcardData={{
                    title: postcard.title,
                    message: postcard.message,
                    fontFamily: postcard.fontFamily || undefined,
                    backgroundColor: postcard.backgroundColor || undefined,
                    textColor: postcard.textColor || undefined,
                    customImageUrl: postcard.customImageUrl || undefined,
                  }}
                  className="w-full max-w-md mx-auto"
                />
              </CardContent>
            </Card>

            {/* Message Display */}
            {postcard.message && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3">Message</h3>
                  <p className="text-gray-700 leading-relaxed">{postcard.message}</p>
                </CardContent>
              </Card>
            )}

            {/* Call to Action */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg text-blue-900 mb-2">
                  Love this postcard?
                </h3>
                <p className="text-blue-700 mb-4">
                  Create your own beautiful postcard from Odesa with our easy-to-use creator!
                </p>
                <Link href="/creator">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Create Your Own Postcard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Sharing and Actions */}
          <div className="space-y-6">
            <SocialShare postcard={postcard} />

            {/* Template Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Template Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Template:</span>
                    <span className="font-medium">{template.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{template.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {postcard.createdAt ? new Date(postcard.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link href={`/creator/${template.id}`}>
                    <Button variant="outline" className="w-full">
                      Use This Template
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* About Odesa Holiday */}
            <Card className="bg-gradient-to-br from-blue-50 to-yellow-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 text-blue-900">
                  About Odesa Holiday Postcards
                </h3>
                <p className="text-blue-700 text-sm leading-relaxed mb-4">
                  Discover the beauty of Odesa through our digital postcard platform. 
                  Share memories, send love, and explore Ukraine's pearl by the Black Sea.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-900">12k+</div>
                    <div className="text-xs text-blue-600">Postcards Created</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-900">65+</div>
                    <div className="text-xs text-blue-600">Countries Reached</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}