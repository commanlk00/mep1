import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Lock, Check, Gift, Undo2 } from 'lucide-react';
import { UserProfile, StickerReward } from '../types';
import { STICKERS } from '../data/learningData';
import { sound } from '../utils/sound';
import { unlockSticker } from '../utils/storage';

interface RewardStickerBookProps {
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
}

interface PlacedSticker {
  id: string;
  emoji: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
}

export const RewardStickerBook: React.FC<RewardStickerBookProps> = ({ profile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'canvas'>('shop');
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([
    { id: '1', emoji: '👑', name: 'Crown', x: 25, y: 30, rotation: -6 },
    { id: '2', emoji: '⭐', name: 'Star', x: 70, y: 25, rotation: 8 },
  ]);
  const [selectedStickerForCanvas, setSelectedStickerForCanvas] = useState<string | null>(null);

  const handleUnlock = (sticker: StickerReward) => {
    if (profile.unlockedStickerIds.includes(sticker.id)) return;

    if (profile.totalStars < sticker.cost) {
      sound.playWrong();
      alert(`สะสมดาวไม่พอ ต้องการอีก ${sticker.cost - profile.totalStars} ดาวนะคนเก่ง!`);
      return;
    }

    sound.playStar();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const updated = unlockSticker(profile, sticker.id, sticker.cost);
    if (updated) {
      onUpdateProfile(updated);
    }
  };

  const handlePlaceSticker = (sticker: StickerReward) => {
    sound.playPop();
    const newPlaced: PlacedSticker = {
      id: Date.now().toString(),
      emoji: sticker.emoji,
      name: sticker.name,
      x: Math.floor(Math.random() * 60) + 15,
      y: Math.floor(Math.random() * 55) + 15,
      rotation: Math.floor(Math.random() * 30) - 15,
    };
    setPlacedStickers((prev) => [...prev, newPlaced]);
    setActiveTab('canvas');
  };

  const clearCanvas = () => {
    sound.playPop();
    setPlacedStickers([]);
  };

  return (
    <section className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-4xl shadow-inner shrink-0">
            🎁
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <span>สมุดสะสมรางวัล & สติกเกอร์ ป.1</span>
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 mt-0.5">
              ใช้ดาวทอง ⭐ ที่ได้จากการตอบคำถามมาปลดล็อกสติกเกอร์และตกแต่งสมุดบันทึก!
            </p>
          </div>
        </div>

        {/* Available Stars Pill */}
        <div className="bg-white/90 text-purple-950 px-4 py-2 rounded-2xl font-extrabold flex items-center gap-2 shadow-md">
          <Sparkles className="text-amber-500" size={20} />
          <span>ดาวที่มี:</span>
          <span className="text-2xl text-amber-600 font-black">{profile.totalStars}</span>
          <span className="text-xs text-purple-800">⭐</span>
        </div>
      </div>

      {/* Tabs: Shop vs Canvas */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            sound.playPop();
            setActiveTab('shop');
          }}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'shop'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          <Gift size={16} />
          <span>ร้านค้าสติกเกอร์ (Sticker Shop)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playPop();
            setActiveTab('canvas');
          }}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'canvas'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          <span>🎨 สมุดแปะสติกเกอร์ของฉัน ({placedStickers.length})</span>
        </button>
      </div>

      {/* Sticker Shop Grid */}
      {activeTab === 'shop' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {STICKERS.map((st) => {
            const isUnlocked = profile.unlockedStickerIds.includes(st.id);
            const canAfford = profile.totalStars >= st.cost;

            const rarityBadge = {
              common: 'bg-slate-100 text-slate-700',
              rare: 'bg-blue-100 text-blue-700 font-bold',
              legendary: 'bg-amber-100 text-amber-800 font-black',
            }[st.rarity];

            return (
              <div
                key={st.id}
                className={`bg-white rounded-3xl p-4 border-2 shadow-sm flex flex-col items-center text-center transition-all ${
                  isUnlocked
                    ? 'border-purple-200 hover:border-purple-400'
                    : 'border-slate-200 opacity-90'
                }`}
              >
                {/* Rarity & Cost tag */}
                <div className="w-full flex items-center justify-between text-[10px] mb-2">
                  <span className={`px-2 py-0.5 rounded-full ${rarityBadge}`}>
                    {st.rarity.toUpperCase()}
                  </span>
                  <span className="font-bold text-slate-400">{st.category}</span>
                </div>

                {/* Big Emoji Sticker */}
                <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl sm:text-5xl my-2 select-none shadow-inner border border-slate-100">
                  {st.emoji}
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-slate-800 leading-tight">
                  {st.name}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{st.nameEn}</p>

                <div className="mt-3 w-full">
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => handlePlaceSticker(st)}
                      className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Check size={14} />
                      <span>แปะในสมุด</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUnlock(st)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <Lock size={13} />
                      <span>{st.cost} ⭐ ปลดล็อก</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Sticker Canvas */}
      {activeTab === 'canvas' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-purple-200 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                สมุดสติกเกอร์ความคิดสร้างสรรค์ (My Sticker Album)
              </h3>
              <p className="text-xs text-slate-500">
                แตะสติกเกอร์ที่ปลดล็อกแล้วด้านล่างเพื่อติดลงในสมุด!
              </p>
            </div>

            <button
              type="button"
              onClick={clearCanvas}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Undo2 size={14} />
              <span>ล้างสมุด</span>
            </button>
          </div>

          {/* The Board Canvas */}
          <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-br from-amber-50 via-pink-50/40 to-indigo-50/50 border-2 border-dashed border-purple-300 overflow-hidden shadow-inner flex items-center justify-center">
            {placedStickers.length === 0 && (
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                สมุดยังว่างอยู่! เลือกลายสติกเกอร์ที่ปลดล็อกแล้วด้านล่างเพื่อแปะได้เลย
              </p>
            )}

            {placedStickers.map((item) => (
              <motion.div
                key={item.id}
                drag
                dragConstraints={{ left: 0, right: 300, top: 0, bottom: 250 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sound.playPop()}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: `rotate(${item.rotation}deg)`,
                }}
                className="absolute text-5xl sm:text-6xl cursor-grab active:cursor-grabbing select-none drop-shadow-md hover:drop-shadow-xl"
                title={`${item.name} - แตะเพื่อเล่นหรือลากย้ายตำแหน่งได้!`}
              >
                {item.emoji}
              </motion.div>
            ))}
          </div>

          {/* Unlocked sticker quick-tray */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-600 mb-2">
              แตะเพื่อเพิ่มสติกเกอร์ลงในสมุด:
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {STICKERS.filter((s) => profile.unlockedStickerIds.includes(s.id)).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handlePlaceSticker(s)}
                  className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center gap-1.5 text-xs font-bold text-purple-900 cursor-pointer shrink-0 active:scale-95"
                >
                  <span className="text-xl">{s.emoji}</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
