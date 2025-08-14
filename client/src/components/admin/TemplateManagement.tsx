import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Plus, Trash2, Image, Eye, Upload, X } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  isPremium: boolean;
  usageCount: number;
  createdAt: string;
}

interface TemplateFormData {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  isPremium: boolean;
}

const categories = [
  { value: "landmarks", label: "Landmarks" },
  { value: "coastal", label: "Coastal Views" },
  { value: "historic", label: "Historic Sites" },
  { value: "cultural", label: "Cultural" },
  { value: "seasonal", label: "Seasonal" },
];

export default function TemplateManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    id: "",
    name: "",
    description: "",
    imageUrl: "",
    category: "landmarks",
    isPremium: false,
  });

  // Fetch all templates
  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
    retry: false,
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: async (templateData: TemplateFormData) => {
      return apiRequest("POST", "/api/admin/templates", templateData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: async ({ templateId, data }: { templateId: string; data: TemplateFormData }) => {
      return apiRequest("PUT", `/api/admin/templates/${templateId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      return apiRequest("DELETE", `/api/admin/templates/${templateId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      imageUrl: "",
      category: "landmarks",
      isPremium: false,
    });
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
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

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.id.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "No Image Selected",
        description: "Please select an image file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const imageUrl = await uploadImageToServer(selectedFile);
      const templateData = { ...formData, imageUrl };
      createMutation.mutate(templateData);
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setFormData({
      id: template.id,
      name: template.name,
      description: template.description,
      imageUrl: template.imageUrl,
      category: template.category,
      isPremium: template.isPremium,
    });
    setPreviewUrl(template.imageUrl);
    setSelectedFile(null);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedTemplate) return;
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = formData.imageUrl;
      
      // If a new file was selected, upload it
      if (selectedFile) {
        imageUrl = await uploadImageToServer(selectedFile);
      }
      
      const templateData = { ...formData, imageUrl };
      updateMutation.mutate({ templateId: selectedTemplate.id, data: templateData });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (templateId: string) => {
    deleteMutation.mutate(templateId);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-blue-100 dark:bg-blue-900/20 rounded mb-4 w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-blue-50 dark:bg-blue-900/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
          Template Management
        </h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-blue-900 dark:text-blue-100">
                Create New Template
              </DialogTitle>
              <DialogDescription className="text-blue-600 dark:text-blue-400">
                Add a new postcard template to the collection
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id" className="text-right text-blue-900 dark:text-blue-100">
                  ID *
                </Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  className="col-span-3 border-blue-200 dark:border-blue-700"
                  placeholder="unique-template-id"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-blue-900 dark:text-blue-100">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="col-span-3 border-blue-200 dark:border-blue-700"
                  placeholder="Template Name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right text-blue-900 dark:text-blue-100">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="col-span-3 border-blue-200 dark:border-blue-700"
                  placeholder="Template description"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="image" className="text-right text-blue-900 dark:text-blue-100 pt-2">
                  Image *
                </Label>
                <div className="col-span-3 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, false)}
                    className="hidden"
                    id="template-image-input"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                    {selectedFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                    </p>
                  )}
                  {previewUrl && (
                    <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-2">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full h-32 object-contain rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right text-blue-900 dark:text-blue-100">
                  Category
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="col-span-3 border-blue-200 dark:border-blue-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isPremium" className="text-right text-blue-900 dark:text-blue-100">
                  Premium
                </Label>
                <div className="col-span-3">
                  <Switch
                    id="isPremium"
                    checked={formData.isPremium}
                    onCheckedChange={(checked) => setFormData({...formData, isPremium: checked})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isUploading || createMutation.isPending}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={isUploading || createMutation.isPending}
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isUploading ? "Uploading..." : createMutation.isPending ? "Creating..." : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template: Template) => (
          <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 overflow-hidden">
            <div className="relative">
              <img
                src={template.imageUrl}
                alt={template.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";
                }}
              />
              {template.isPremium && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                    PREMIUM
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 line-clamp-2">
                {template.description || "No description"}
              </p>
              <div className="flex items-center justify-between text-xs text-blue-500 dark:text-blue-400 mb-3">
                <span className="capitalize">{template.category}</span>
                <span>Used {template.usageCount} times</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(template)}
                  className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-blue-900 dark:text-blue-100">
                        Delete Template
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-blue-600 dark:text-blue-400">
                        Are you sure you want to delete "{template.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(template.id)}
                        className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-900 dark:text-blue-100">
              Edit Template
            </DialogTitle>
            <DialogDescription className="text-blue-600 dark:text-blue-400">
              Update template information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right text-blue-900 dark:text-blue-100">
                Name *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="col-span-3 border-blue-200 dark:border-blue-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right text-blue-900 dark:text-blue-100">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="col-span-3 border-blue-200 dark:border-blue-700"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-image" className="text-right text-blue-900 dark:text-blue-100 pt-2">
                Image
              </Label>
              <div className="col-span-3 space-y-3">
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, true)}
                  className="hidden"
                  id="edit-template-image-input"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editFileInputRef.current?.click()}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {selectedFile ? 'Change Image' : 'Upload New Image'}
                  </Button>
                  {(selectedFile || previewUrl) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {selectedFile && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    New file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                  </p>
                )}
                {previewUrl && (
                  <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-2">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-w-full h-32 object-contain rounded"
                    />
                  </div>
                )}
                {!selectedFile && !previewUrl && formData.imageUrl && (
                  <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-2">
                    <img 
                      src={formData.imageUrl} 
                      alt="Current template" 
                      className="max-w-full h-32 object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right text-blue-900 dark:text-blue-100">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger className="col-span-3 border-blue-200 dark:border-blue-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isPremium" className="text-right text-blue-900 dark:text-blue-100">
                Premium
              </Label>
              <div className="col-span-3">
                <Switch
                  id="edit-isPremium"
                  checked={formData.isPremium}
                  onCheckedChange={(checked) => setFormData({...formData, isPremium: checked})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUploading || updateMutation.isPending}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdate}
              disabled={isUploading || updateMutation.isPending}
              className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isUploading ? "Uploading..." : updateMutation.isPending ? "Updating..." : "Update Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}