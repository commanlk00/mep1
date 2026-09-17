import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { sound } from '../utils/sound';

interface SoundButtonProps {
  textToSpeak: string;
  lang?: 'en-US' | 'th-TH';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  autoPlay?: boolean;
}

export const SoundButton: React.FC<SoundButtonProps> = ({
  textToSpeak,
  lang = 'en-US',
  size = 'md',
  label,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    setIsPlaying(true);
    sound.playPop();
    const targetLang: 'en-US' | 'th-TH' = lang === 'th-TH' ? 'th-TH' : 'en-US';
    await sound.speak(textToSpeak, targetLang);
    setIsPlaying(false);
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2.5 text-sm',
    lg: 'p-3.5 text-base',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 26,
  };

  return (
    <button
      id={`sound-btn-${textToSpeak.replace(/\s+/g, '-').toLowerCase()}`}
      type="button"
      onClick={handleClick}
      title={`ฟังเสียงอ่าน: ${textToSpeak}`}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-all shadow-sm active:scale-95 cursor-pointer select-none bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 ${
        isPlaying ? 'ring-4 ring-amber-300/60 scale-105 animate-pulse' : ''
      } ${sizeClasses[size]} ${className}`}
    >
      <Volume2
        size={iconSizes[size]}
        className={`text-amber-800 ${isPlaying ? 'animate-bounce' : ''}`}
      />
      {label && <span className="font-semibold">{label}</span>}
    </button>
  );
};
