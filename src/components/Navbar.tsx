import React, { useState } from 'react';
import { Sparkles, Volume2, VolumeX, Shield, Users, BookOpen, Gift, Wifi, WifiOff } from 'lucide-react';
import { UserProfile, GameView } from '../types';
import { COMPANIONS } from '../data/learningData';
import { sound } from '../utils/sound';

interface NavbarProps {
  profile: UserProfile;
  currentView: GameView;
  onSelectView: (view: GameView) => void;
  onSelectCompanion: (companionId: string) => void;
  onOpenParentGate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  currentView,
  onSelectView,
  onSelectCompanion,
  onOpenParentGate,
}) => {
  const [soundActive, setSoundActive] = useState(true);
  const [showCompanionPicker, setShowCompanionPicker] = useState(false);
  const currentCompanion = COMPANIONS.find((c) => c.id === profile.avatarId) || COMPANIONS[0];

  const toggleSound = () => {
    const newState = !soundActive;
    setSoundActive(newState);
    sound.setSoundEnabled(newState);
    if (newState) {
      sound.playPop();
    }
  };

  const expPercentage = Math.min(100, Math.round((profile.exp / profile.maxExp) * 100));

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-amber-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Child Identity */}
          <div className="flex items-center gap-3">
            <button
              id="avatar-picker-trigger"
              type="button"
              onClick={() => setShowCompanionPicker(!showCompanionPicker)}
              className="relative group p-1 bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
              title="แตะเพื่อเปลี่ยนเพื่อนคู่ใจ"
            >
              <span className="text-2xl sm:text-3xl drop-shadow-sm">{currentCompanion.avatar}</span>
              <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-[10px] text-white font-bold px-1.5 py-0.2 rounded-full border border-white">
                Lv.{profile.level}
              </span>
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-1">
                  <span>MEP Kids</span>
                  <span className="text-xs bg-amber-400 text-amber-950 font-extrabold px-1.5 py-0.5 rounded-md">ป.1</span>
                </h1>
                {/* Offline Badge */}
                <span
                  title="แอปพร้อมใช้งาน 100% แม้ไม่มีอินเทอร์เน็ต"
                  className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full"
                >
                  <Wifi size={12} className="text-emerald-600" />
                  <span>ออฟไลน์พร้อมใช้</span>
                </span>
              </div>

              {/* EXP Progress Bar */}
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-24 sm:w-32 bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-300">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${expPercentage}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {profile.exp}/{profile.maxExp} EXP
                </span>
              </div>
            </div>
          </div>

          {/* Gamification Stats: Stars & Streaks */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stars counter */}
            <div
              id="stars-badge"
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 px-2.5 py-1 rounded-full shadow-sm text-amber-900 font-bold text-xs sm:text-sm"
            >
              <Sparkles size={16} className="text-amber-500 animate-spin-slow" />
              <span>{profile.totalStars}</span>
              <span className="text-xs font-normal text-amber-700">ดาว</span>
            </div>

            {/* Daily streak */}
            <div
              id="streak-badge"
              title={`เรียนติดต่อกัน ${profile.dailyStreak} วันแล้ว!`}
              className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full text-rose-700 font-bold text-xs sm:text-sm shadow-sm"
            >
              <span>🔥</span>
              <span>{profile.dailyStreak}</span>
              <span className="hidden xs:inline text-xs font-normal text-rose-500">วัน</span>
            </div>

            {/* Sound toggle button */}
            <button
              id="sound-toggle-btn"
              type="button"
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
              title={soundActive ? 'ปิดเสียง' : 'เปิดเสียง'}
            >
              {soundActive ? <Volume2 size={18} /> : <VolumeX size={18} className="text-rose-500" />}
            </button>

            {/* Parent lock button */}
            <button
              id="parent-gate-btn"
              type="button"
              onClick={() => {
                sound.playPop();
                onOpenParentGate();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer"
              title="สำหรับผู้ปกครอง & คุณครู"
            >
              <Shield size={15} />
              <span className="hidden sm:inline">ผู้ปกครอง</span>
            </button>
          </div>
        </div>

        {/* View Switcher Navigation Bar */}
        <nav className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mt-2.5 pt-2 border-t border-amber-100 overflow-x-auto pb-0.5">
          <button
            id="nav-learn-btn"
            type="button"
            onClick={() => {
              sound.playPop();
              onSelectView('learn');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              currentView === 'learn'
                ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-200'
                : 'bg-white hover:bg-amber-50 text-slate-600 border border-slate-200'
            }`}
          >
            <BookOpen size={16} />
            <span>หมวดการเรียนรู้ (Learn)</span>
          </button>

          <button
            id="nav-battle-btn"
            type="button"
            onClick={() => {
              sound.playPop();
              onSelectView('battle');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              currentView === 'battle'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                : 'bg-white hover:bg-rose-50 text-slate-600 border border-slate-200'
            }`}
          >
            <Users size={16} />
            <span>โหมดดวลเพื่อน (2P Battle)</span>
          </button>

          <button
            id="nav-stickers-btn"
            type="button"
            onClick={() => {
              sound.playPop();
              onSelectView('stickers');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              currentView === 'stickers'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                : 'bg-white hover:bg-purple-50 text-slate-600 border border-slate-200'
            }`}
          >
            <Gift size={16} />
            <span>สมุดรางวัล (Stickers)</span>
          </button>
        </nav>
      </div>

      {/* Companion Picker Modal */}
      {showCompanionPicker && (
        <div className="absolute top-16 left-4 z-40 bg-white rounded-2xl shadow-xl border-2 border-amber-300 p-4 w-72 sm:w-80 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-amber-100 mb-3">
            <h3 className="font-bold text-sm text-slate-800">เลือกเพื่อนคู่ใจการเรียนรู้</h3>
            <button
              type="button"
              onClick={() => setShowCompanionPicker(false)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {COMPANIONS.map((companion) => (
              <button
                key={companion.id}
                type="button"
                onClick={() => {
                  sound.playPop();
                  onSelectCompanion(companion.id);
                  setShowCompanionPicker(false);
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  profile.avatarId === companion.id
                    ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-3xl">{companion.avatar}</span>
                <span className="text-xs font-bold text-slate-800">{companion.name}</span>
                <span className="text-[10px] text-slate-500">{companion.nameEn}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
