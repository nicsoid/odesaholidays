import type { Postcard, InsertPostcard } from "@shared/schema";

export interface PostcardDesign {
  title: string;
  message: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  customImageUrl?: string;
}

export const DEFAULT_POSTCARD_DESIGN: PostcardDesign = {
  title: "Greetings from Odesa!",
  message: "Having an amazing time exploring this beautiful coastal city. The architecture is breathtaking and the people are wonderful!",
  fontFamily: "Inter",
  fontSize: 16,
  textColor: "#000000",
  backgroundColor: "#FFFFFF",
  textAlign: "left",
};

export const FONT_OPTIONS = [
  { value: "Inter", label: "Inter (Modern)" },
  { value: "Playfair Display", label: "Playfair Display (Elegant)" },
  { value: "Georgia", label: "Georgia (Classic)" },
  { value: "Arial", label: "Arial (Simple)" },
  { value: "Times New Roman", label: "Times New Roman (Traditional)" },
];

export const POSTCARD_DIMENSIONS = {
  width: 600,
  height: 400,
  aspectRatio: 3 / 2,
} as const;

export function validatePostcardData(data: Partial<InsertPostcard>): string[] {
  const errors: string[] = [];
  
  if (!data.templateId || data.templateId.trim() === '') {
    errors.push('Template is required');
  }
  
  if (!data.title || data.title.trim() === '') {
    errors.push('Title is required');
  } else if (data.title.length > 100) {
    errors.push('Title must be 100 characters or less');
  }
  
  if (!data.message || data.message.trim() === '') {
    errors.push('Message is required');
  } else if (data.message.length > 500) {
    errors.push('Message must be 500 characters or less');
  }
  
  return errors;
}

export function generatePostcardPreview(design: PostcardDesign, templateImageUrl: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }
  
  canvas.width = POSTCARD_DIMENSIONS.width;
  canvas.height = POSTCARD_DIMENSIONS.height;
  
  // Background
  ctx.fillStyle = design.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Load template image (this would be async in real implementation)
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = templateImageUrl;
  
  return canvas;
}

export function downloadPostcardAsImage(canvas: HTMLCanvasElement, filename?: string): void {
  const link = document.createElement('a');
  link.download = filename || `odesa-postcard-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getPostcardShareText(postcard: Postcard): string {
  return `Check out my beautiful "${postcard.title}" from Odesa! 🇺🇦 Created with Odesa Postcards ✨`;
}

export function getPostcardShareUrl(postcard: Postcard): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/postcard/${postcard.id}`;
}

export function calculatePostcardPrice(quantity: number): number {
  const basePrice = 3.99;
  
  // Bulk discounts
  if (quantity >= 10) {
    return basePrice * 0.8; // 20% discount
  } else if (quantity >= 5) {
    return basePrice * 0.9; // 10% discount
  }
  
  return basePrice;
}

export function formatPostcardCreatedDate(date: Date | string): string {
  const postcardDate = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(postcardDate);
}

export function generatePostcardId(): string {
  return `postcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function optimizeImageForPostcard(imageUrl: string, width: number = 600): string {
  // For Unsplash images, add optimization parameters
  if (imageUrl.includes('unsplash.com')) {
    const url = new URL(imageUrl);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', '80');
    url.searchParams.set('fm', 'jpg');
    url.searchParams.set('fit', 'crop');
    return url.toString();
  }
  
  return imageUrl;
}

export function getPostcardMetadata(postcard: Postcard) {
  return {
    title: `${postcard.title} - Odesa Postcard`,
    description: postcard.message.substring(0, 160) + (postcard.message.length > 160 ? '...' : ''),
    image: optimizeImageForPostcard(postcard.customImageUrl || '', 600),
    url: getPostcardShareUrl(postcard),
  };
}

export function analyzePostcardPerformance(postcard: Postcard) {
  const downloadCount = postcard.downloadCount || 0;
  const shareCount = postcard.shareCount || 0;
  const totalEngagement = downloadCount + shareCount;
  
  let performance: 'low' | 'medium' | 'high' = 'low';
  
  if (totalEngagement >= 50) {
    performance = 'high';
  } else if (totalEngagement >= 10) {
    performance = 'medium';
  }
  
  return {
    totalEngagement,
    performance,
    engagementRate: shareCount > 0 ? (shareCount / downloadCount) * 100 : 0,
    popularityScore: Math.log(totalEngagement + 1) * 10,
  };
}

export function suggestImprovements(postcard: Postcard): string[] {
  const suggestions: string[] = [];
  const performance = analyzePostcardPerformance(postcard);
  
  if (performance.performance === 'low') {
    suggestions.push('Try sharing your postcard on social media to increase visibility');
    suggestions.push('Consider updating the message to be more engaging');
  }
  
  if (postcard.message.length < 50) {
    suggestions.push('Add more details to your message to make it more personal');
  }
  
  if (!postcard.isPublic) {
    suggestions.push('Make your postcard public to appear in the gallery and get more views');
  }
  
  return suggestions;
}
