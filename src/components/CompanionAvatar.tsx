import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COMPANIONS } from '../data/learningData';
import { sound } from '../utils/sound';

interface CompanionAvatarProps {
  companionId: string;
  mood?: 'idle' | 'happy' | 'thinking' | 'celebrating' | 'wrong';
  customMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  onTap?: () => void;
}

export const CompanionAvatar: React.FC<CompanionAvatarProps> = ({
  companionId,
  mood = 'idle',
  customMessage,
  size = 'md',
  onTap,
}) => {
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const companion = COMPANIONS.find((c) => c.id === companionId) || COMPANIONS[0];

  const getMoodEmoji = () => {
    switch (mood) {
      case 'celebrating':
        return '🎉';
      case 'happy':
        return '✨';
      case 'thinking':
        return '🤔';
      case 'wrong':
        return '💪';
      default:
        return '🌟';
    }
  };

  const getDisplayMessage = () => {
    if (customMessage) return customMessage;
    if (mood === 'celebrating' || mood === 'happy') {
      return `${companion.cheerPhraseEn} (${companion.cheerPhraseTh})`;
    }
    if (mood === 'wrong') {
      return 'Try again! You can do it! (ลองอีกครั้งนะ คนเก่งทำได้!)';
    }
    return `${companion.greeting}`;
  };

  const handleCompanionClick = () => {
    sound.playPop();
    sound.speak(companion.nameEn, 'en-US');
    setBubbleOpen(true);
    if (onTap) onTap();
  };

  const sizeStyles = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
  };

  return (
    <div id="companion-container" className="relative flex items-center gap-3">
      {/* Speech bubble */}
      <AnimatePresence>
        {bubbleOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="hidden sm:flex max-w-xs bg-white/95 backdrop-blur border-2 border-amber-300 shadow-md rounded-2xl px-3.5 py-2 text-xs md:text-sm text-slate-700 items-center gap-2 relative before:content-[''] before:absolute before:right-[-8px] before:top-1/2 before:-translate-y-1/2 before:border-y-8 before:border-y-transparent before:border-l-8 before:border-l-amber-300"
          >
            <span>{getDisplayMessage()}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Avatar button */}
      <motion.button
        id={`companion-btn-${companion.id}`}
        type="button"
        onClick={handleCompanionClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        animate={
          mood === 'celebrating'
            ? { y: [0, -14, 0], rotate: [0, -8, 8, 0] }
            : mood === 'wrong'
            ? { x: [0, -6, 6, -4, 4, 0] }
            : { y: [0, -4, 0] }
        }
        transition={{
          repeat: mood === 'celebrating' ? Infinity : 0,
          duration: 0.8,
        }}
        className={`relative ${sizeStyles[size]} rounded-full flex items-center justify-center bg-gradient-to-br ${companion.color} shadow-lg shadow-amber-200/50 border-3 border-white cursor-pointer select-none transition-transform`}
        title={`${companion.name} - แตะเพื่อทักทาย`}
      >
        <span className="drop-shadow-sm">{companion.avatar}</span>

        {/* Mood badge indicator */}
        <span className="absolute -top-1 -right-1 bg-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow border border-amber-200">
          {getMoodEmoji()}
        </span>
      </motion.button>
    </div>
  );
};
