import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import type { Template } from "@shared/schema";

interface TemplateGalleryProps {
  templates: Template[];
  showFilters?: boolean;
  onTemplateSelect?: (template: Template) => void;
}

export default function TemplateGallery({ templates, showFilters = true, onTemplateSelect }: TemplateGalleryProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const sounds = useSoundEffects();

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "landmarks", label: "Landmarks" },
    { id: "coastal", label: "Coastal Views" },
    { id: "historic", label: "Historic Sites" },
    { id: "vintage", label: "Vintage" },
  ];

  const filteredTemplates = activeFilter === "all" 
    ? templates 
    : templates.filter(template => template.category === activeFilter);

  const handleTemplateClick = (template: Template) => {
    sounds.templateSelect();
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeFilter === category.id ? "default" : "outline"}
              onClick={() => setActiveFilter(category.id)}
              className={activeFilter === category.id 
                ? "bg-ukrainian-blue text-white hover:bg-blue-700" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
            >
              {category.label}
            </Button>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="group cursor-pointer transform hover:scale-105 transition-all duration-300 overflow-hidden"
            onMouseEnter={() => sounds.templateHover()}
            onClick={() => handleTemplateClick(template)}
          >
            <div className="relative">
              <img 
                src={template.imageUrl} 
                alt={template.name}
                className="w-full h-48 object-cover"
              />
              {template.isPremium && (
                <Badge className="absolute top-2 right-2 bg-sunset-orange text-white">
                  Premium
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${template.isPremium ? 'text-sunset-orange' : 'text-gray-500'}`}>
                  {template.isPremium ? 'Premium' : 'Free Template'}
                </span>
                <Button 
                  size="sm" 
                  className={template.isPremium 
                    ? "bg-sunset-orange hover:bg-orange-600 text-white" 
                    : "bg-ukrainian-blue hover:bg-blue-700 text-white"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateClick(template);
                  }}
                >
                  Use Template
                </Button>
              </div>
              {template.usageCount !== undefined && (
                <div className="text-xs text-gray-400 mt-2">
                  Used {template.usageCount} times
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No templates found for this category.</p>
        </div>
      )}
    </div>
  );
}
