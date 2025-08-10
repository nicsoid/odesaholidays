import { useCallback } from 'react';

interface SoundEffectsOptions {
  volume?: number;
  enabled?: boolean;
}

export function useSoundEffects(options: SoundEffectsOptions = {}) {
  const { volume = 0.3, enabled = true } = options;

  const playSound = useCallback((frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') => {
    if (!enabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Sound effect failed:', error);
    }
  }, [volume, enabled]);

  const sounds = {
    // Postcard interactions
    elementSelect: () => playSound(800, 0.1, 'sine'),
    elementDrag: () => playSound(400, 0.05, 'triangle'),
    elementDrop: () => playSound(600, 0.15, 'sine'),
    textEdit: () => playSound(1000, 0.05, 'triangle'),
    colorChange: () => playSound(650, 0.12, 'sine'),
    fontChange: () => playSound(750, 0.1, 'square'),
    
    // UI interactions
    buttonClick: () => playSound(800, 0.08, 'sine'),
    success: () => {
      // Happy chord progression
      setTimeout(() => playSound(523, 0.1), 0);   // C5
      setTimeout(() => playSound(659, 0.1), 50);  // E5
      setTimeout(() => playSound(784, 0.15), 100); // G5
    },
    error: () => playSound(200, 0.3, 'square'),
    notification: () => playSound(880, 0.2, 'sine'),
    
    // Template interactions
    templateHover: () => playSound(600, 0.05, 'sine'),
    templateSelect: () => playSound(880, 0.12, 'triangle'),
    
    // AI interactions
    aiThinking: () => {
      // Gentle bubbling sound
      playSound(400, 0.1, 'sine');
      setTimeout(() => playSound(500, 0.1), 100);
      setTimeout(() => playSound(600, 0.1), 200);
    },
    aiComplete: () => {
      // Magical completion sound
      setTimeout(() => playSound(659, 0.08), 0);
      setTimeout(() => playSound(784, 0.08), 80);
      setTimeout(() => playSound(988, 0.12), 160);
    }
  };

  return sounds;
}