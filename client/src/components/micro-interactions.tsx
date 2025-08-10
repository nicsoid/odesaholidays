import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { cn } from '@/lib/utils';

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  soundEffect?: 'buttonClick' | 'success' | 'error';
}

export function InteractiveButton({ 
  children, 
  className, 
  variant = 'primary',
  soundEffect = 'buttonClick',
  onClick,
  ...props 
}: InteractiveButtonProps) {
  const sounds = useSoundEffects();
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(true);
    sounds[soundEffect]();
    setTimeout(() => setIsPressed(false), 150);
    if (onClick) onClick(e);
  };

  const variants = {
    primary: 'bg-ukrainian-blue hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white'
  };

  return (
    <motion.button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all duration-150 active:scale-95',
        variants[variant],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={isPressed ? { scale: 0.95 } : { scale: 1 }}
      onClick={handleClick}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}

interface DraggableElementProps {
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  className?: string;
}

export function DraggableElement({ 
  children, 
  onDragStart, 
  onDragEnd, 
  className 
}: DraggableElementProps) {
  const sounds = useSoundEffects();

  return (
    <motion.div
      drag
      dragMomentum={false}
      whileHover={{ scale: 1.05, cursor: 'grab' }}
      whileDrag={{ 
        scale: 1.1, 
        rotate: 5,
        cursor: 'grabbing',
        zIndex: 1000
      }}
      onDragStart={() => {
        sounds.elementDrag();
        if (onDragStart) onDragStart();
      }}
      onDragEnd={() => {
        sounds.elementDrop();
        if (onDragEnd) onDragEnd();
      }}
      className={cn('inline-block', className)}
      initial={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

interface ColorPickerProps {
  colors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function InteractiveColorPicker({ 
  colors, 
  selectedColor, 
  onColorChange 
}: ColorPickerProps) {
  const sounds = useSoundEffects();

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <motion.button
          key={color}
          className={cn(
            'w-8 h-8 rounded-full border-2 border-gray-300',
            selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''
          )}
          style={{ backgroundColor: color }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            sounds.colorChange();
            onColorChange(color);
          }}
        />
      ))}
    </div>
  );
}

interface FontSelectorProps {
  fonts: Array<{ name: string; family: string }>;
  selectedFont: string;
  onFontChange: (font: string) => void;
}

export function InteractiveFontSelector({ 
  fonts, 
  selectedFont, 
  onFontChange 
}: FontSelectorProps) {
  const sounds = useSoundEffects();

  return (
    <div className="space-y-2">
      {fonts.map((font) => (
        <motion.button
          key={font.name}
          className={cn(
            'w-full text-left p-3 rounded-lg border transition-all',
            selectedFont === font.family 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          )}
          style={{ fontFamily: font.family }}
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sounds.fontChange();
            onFontChange(font.family);
          }}
        >
          {font.name}
        </motion.button>
      ))}
    </div>
  );
}

interface FloatingNotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export function FloatingNotification({ 
  message, 
  type, 
  isVisible, 
  onClose 
}: FloatingNotificationProps) {
  const sounds = useSoundEffects();

  useEffect(() => {
    if (isVisible) {
      if (type === 'success') sounds.success();
      else if (type === 'error') sounds.error();
      else sounds.notification();
    }
  }, [isVisible, type, sounds]);

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className={cn(
            'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50',
            typeStyles[type]
          )}
        >
          <div className="flex items-center justify-between">
            <span>{message}</span>
            <button
              onClick={onClose}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface LoadingSpinnerProps {
  message?: string;
  showAIThinking?: boolean;
}

export function InteractiveLoadingSpinner({ 
  message = "Loading...", 
  showAIThinking = false 
}: LoadingSpinnerProps) {
  const sounds = useSoundEffects();

  useEffect(() => {
    if (showAIThinking) {
      const interval = setInterval(() => {
        sounds.aiThinking();
      }, 1500);
      
      return () => clearInterval(interval);
    }
  }, [showAIThinking, sounds]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center p-8"
    >
      <motion.div
        className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-gray-600"
      >
        {message}
      </motion.p>
      {showAIThinking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-2 text-sm text-blue-600"
        >
          🤖 AI is thinking...
        </motion.div>
      )}
    </motion.div>
  );
}