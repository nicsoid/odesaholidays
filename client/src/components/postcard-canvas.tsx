import { useEffect, useRef } from "react";
import type { Template } from "@shared/schema";

interface PostcardCanvasProps {
  template: Template;
  postcardData: {
    title?: string;
    message?: string;
    fontFamily?: string;
    backgroundColor?: string;
    textColor?: string;
    customImageUrl?: string;
  };
  className?: string;
}

export default function PostcardCanvas({ template, postcardData, className = "" }: PostcardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    // Draw background
    ctx.fillStyle = postcardData.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw template image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw template image in top half
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height * 0.65);

      // Draw text content
      const textAreaY = canvas.height * 0.7;
      const padding = 20;
      const textColor = postcardData.textColor || '#000000';
      
      // Title
      ctx.fillStyle = textColor;
      ctx.font = `bold 24px ${postcardData.fontFamily || 'Inter'}, sans-serif`;
      ctx.textAlign = 'left';
      
      const title = postcardData.title || 'Greetings from Odesa!';
      ctx.fillText(title, padding, textAreaY);

      // Message
      ctx.font = `16px ${postcardData.fontFamily || 'Inter'}, sans-serif`;
      const message = postcardData.message || 'Having an amazing time!';
      
      // Word wrap message
      const words = message.split(' ');
      let line = '';
      let y = textAreaY + 30;
      const maxWidth = canvas.width - (padding * 2);
      const lineHeight = 20;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, padding, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, padding, y);

      // Brand watermark
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#9CA3AF';
      ctx.textAlign = 'center';
      ctx.fillText('Created with Odesa Postcards', canvas.width / 2, canvas.height - 15);
    };
    
    img.onerror = () => {
      // Fallback: draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#004C9F'); // Ukrainian blue
      gradient.addColorStop(1, '#0077BE'); // Ocean blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.65);
      
      // Template name fallback
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px Playfair Display, serif';
      ctx.textAlign = 'center';
      ctx.fillText(template.name, canvas.width / 2, canvas.height * 0.4);
    };
    
    img.src = template.imageUrl;
  }, [template, postcardData]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full max-w-lg mx-auto rounded-xl shadow-lg border border-gray-200"
        style={{ aspectRatio: '3/2' }}
      />
      <div className="absolute inset-0 pointer-events-none rounded-xl shadow-inner"></div>
    </div>
  );
}
