import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Upload, X, Image, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TemplateUploadProps {
  onUploadComplete?: () => void;
}

export default function TemplateUpload({ onUploadComplete }: TemplateUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    category: 'landmarks',
    tags: '',
    isPremium: false,
    imageUrl: '',
    thumbnailUrl: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: 'landmarks', label: 'Landmarks' },
    { value: 'coastal', label: 'Coastal Views' },
    { value: 'historic', label: 'Historic Sites' },
    { value: 'modern', label: 'Modern Architecture' },
    { value: 'cultural', label: 'Cultural Heritage' },
    { value: 'seasonal', label: 'Seasonal' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPEG, PNG, WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    // Convert to base64 for server upload
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const response = await apiRequest('POST', '/api/admin/upload-image', {
            fileName: file.name,
            fileData: base64,
            fileSize: file.size,
            mimeType: file.type
          });
          const data = await response.json();
          resolve(data.imageUrl);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/templates', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Created",
        description: "New template has been successfully uploaded",
      });
      
      // Reset form
      setTemplateData({
        name: '',
        description: '',
        category: 'landmarks',
        tags: '',
        isPremium: false,
        imageUrl: '',
        thumbnailUrl: ''
      });
      setSelectedFile(null);
      setPreviewUrl('');
      
      // Invalidate templates cache
      queryClient.invalidateQueries({ queryKey: ['/api/admin/templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      
      onUploadComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No Image Selected",
        description: "Please select an image file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!templateData.name.trim()) {
      toast({
        title: "Missing Template Name",
        description: "Please enter a name for the template",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload image to server
      const imageUrl = await uploadImageToServer(selectedFile);
      
      // Generate thumbnail URL (same as image for now)
      const thumbnailUrl = imageUrl;

      // Create template ID from name
      const templateId = templateData.name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);

      // Prepare template data
      const templatePayload = {
        id: templateId,
        name: templateData.name.trim(),
        description: templateData.description.trim(),
        category: templateData.category,
        tags: templateData.tags,
        isPremium: templateData.isPremium,
        imageUrl,
        thumbnailUrl,
        fileSize: selectedFile.size,
        dimensions: `${selectedFile.name}`, // You could get actual dimensions here
        isActive: true
      };

      await createTemplateMutation.mutateAsync(templatePayload);
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload template",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
          <Upload className="h-5 w-5" />
          Upload New Template
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Template Image *
            </Label>
            
            {!selectedFile ? (
              <div 
                className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <p className="text-blue-600 dark:text-blue-300 font-medium">
                  Click to select image file
                </p>
                <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">
                  JPEG, PNG, WebP up to 10MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={clearSelection}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {selectedFile.name}
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Template Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-800 dark:text-blue-200">
                Template Name *
              </Label>
              <Input
                id="name"
                value={templateData.name}
                onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Opera House Sunset"
                className="border-blue-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-blue-800 dark:text-blue-200">
                Category
              </Label>
              <Select
                value={templateData.category}
                onValueChange={(value) => setTemplateData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-blue-800 dark:text-blue-200">
              Description
            </Label>
            <Textarea
              id="description"
              value={templateData.description}
              onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this template and when to use it..."
              className="border-blue-200 focus:border-blue-500 min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-blue-800 dark:text-blue-200">
              Tags
            </Label>
            <Input
              id="tags"
              value={templateData.tags}
              onChange={(e) => setTemplateData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="ocean, sunset, romantic, evening (comma-separated)"
              className="border-blue-200 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPremium"
              checked={templateData.isPremium}
              onCheckedChange={(checked) => setTemplateData(prev => ({ ...prev, isPremium: !!checked }))}
            />
            <Label 
              htmlFor="isPremium" 
              className="text-blue-800 dark:text-blue-200 cursor-pointer"
            >
              Premium Template (requires subscription)
            </Label>
          </div>

          {/* Upload Button */}
          <Button
            type="submit"
            disabled={uploading || createTemplateMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : createTemplateMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Template...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create Template
              </>
            )}
          </Button>

          {/* Upload Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Upload Guidelines:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Use high-quality images (minimum 1200x800px recommended)</li>
                  <li>• Ensure images clearly showcase Odesa landmarks or views</li>
                  <li>• Use descriptive names and relevant tags</li>
                  <li>• Premium templates are only available to subscription users</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}