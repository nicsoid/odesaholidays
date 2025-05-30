import type { Template } from "@shared/schema";

export const TEMPLATE_CATEGORIES = {
  landmarks: "Landmarks",
  coastal: "Coastal Views", 
  historic: "Historic Sites",
  vintage: "Vintage",
  modern: "Modern",
} as const;

export type TemplateCategory = keyof typeof TEMPLATE_CATEGORIES;

export const DEFAULT_TEMPLATES: Omit<Template, 'createdAt'>[] = [
  {
    id: "opera-house-classic",
    name: "Opera House Classic",
    description: "Elegant architectural beauty of Odesa's Opera House",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    category: "landmarks",
    isPremium: false,
    usageCount: 0,
  },
  {
    id: "potemkin-steps",
    name: "Potemkin Steps",
    description: "Historic landmark views of the famous steps",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    category: "landmarks",
    isPremium: false,
    usageCount: 0,
  },
  {
    id: "black-sea-sunset",
    name: "Black Sea Sunset",
    description: "Coastal paradise views at golden hour",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    category: "coastal",
    isPremium: false,
    usageCount: 0,
  },
  {
    id: "maritime-harbor",
    name: "Maritime Harbor",
    description: "Port city essence with boats and sea",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    category: "coastal",
    isPremium: false,
    usageCount: 0,
  },
  {
    id: "golden-domes",
    name: "Golden Domes",
    description: "Spiritual architecture of Orthodox churches",
    imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    category: "historic",
    isPremium: false,
    usageCount: 0,
  },
  {
    id: "old-town-charm",
    name: "Old Town Charm",
    description: "Historic streetscapes and architecture",
    imageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    category: "historic",
    isPremium: false,
    usageCount: 0,
  },
  {
    id: "seaside-promenade",
    name: "Seaside Promenade",
    description: "Coastal walkways and beach views",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    category: "coastal",
    isPremium: false,
    usageCount: 0,
  },
  {
    id: "vintage-ukraine",
    name: "Vintage Ukraine",
    description: "Traditional aesthetic with vintage charm",
    imageUrl: "https://images.unsplash.com/photo-1517654443271-21d3b904eeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    category: "vintage",
    isPremium: true,
    usageCount: 0,
  },
];

export function getTemplatesByCategory(templates: Template[], category: TemplateCategory | "all"): Template[] {
  if (category === "all") {
    return templates;
  }
  return templates.filter(template => template.category === category);
}

export function getFeaturedTemplates(templates: Template[], count: number = 4): Template[] {
  return templates
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, count);
}

export function getPopularTemplates(templates: Template[], count: number = 10): Template[] {
  return templates
    .filter(template => !template.isPremium)
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, count);
}

export function getPremiumTemplates(templates: Template[]): Template[] {
  return templates.filter(template => template.isPremium);
}

export function searchTemplates(templates: Template[], query: string): Template[] {
  const lowercaseQuery = query.toLowerCase();
  return templates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.category.toLowerCase().includes(lowercaseQuery)
  );
}

export function getTemplateUrl(templateId: string): string {
  return `/creator/${templateId}`;
}

export function validateTemplate(template: Partial<Template>): string[] {
  const errors: string[] = [];
  
  if (!template.id || template.id.trim() === '') {
    errors.push('Template ID is required');
  }
  
  if (!template.name || template.name.trim() === '') {
    errors.push('Template name is required');
  }
  
  if (!template.imageUrl || template.imageUrl.trim() === '') {
    errors.push('Template image URL is required');
  }
  
  if (!template.category || !(template.category in TEMPLATE_CATEGORIES)) {
    errors.push('Valid template category is required');
  }
  
  return errors;
}

export function getTemplateShareUrl(template: Template): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/creator/${template.id}`;
}

export function getTemplatePreviewUrl(template: Template): string {
  return template.imageUrl;
}
