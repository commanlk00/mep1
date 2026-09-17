import React, { useState, useEffect } from 'react';
import { GameView, UserProfile } from './types';
import { loadUserProfile, saveUserProfile } from './utils/storage';
import { Navbar } from './components/Navbar';
import { LearnZone } from './components/LearnZone';
import { BattleMode } from './components/BattleMode';
import { RewardStickerBook } from './components/RewardStickerBook';
import { ParentDashboard } from './components/ParentDashboard';
import { OfflineBanner } from './components/OfflineBanner';
import { COMPANIONS } from './data/learningData';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile);
  const [currentView, setCurrentView] = useState<GameView>('learn');
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);

  // Sync profile changes to localStorage
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
  };

  const handleSelectCompanion = (companionId: string) => {
    const updated = { ...profile, avatarId: companionId };
    handleUpdateProfile(updated);
  };

  const activeCompanion = COMPANIONS.find((c) => c.id === profile.avatarId) || COMPANIONS[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-orange-50/20 to-sky-50/30 text-slate-800 flex flex-col font-sans">
      {/* Offline Status & Assurance Banner */}
      <OfflineBanner />

      {/* Main Playful Header Navigation */}
      <Navbar
        profile={profile}
        currentView={currentView}
        onSelectView={(view) => setCurrentView(view)}
        onSelectCompanion={handleSelectCompanion}
        onOpenParentGate={() => setIsParentModalOpen(true)}
      />

      {/* Main Application Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {currentView === 'learn' && (
          <LearnZone
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {currentView === 'battle' && (
          <BattleMode
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBackToLearn={() => setCurrentView('learn')}
          />
        )}

        {currentView === 'stickers' && (
          <RewardStickerBook
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* Parent & Teacher Analytical Dashboard Modal */}
      <ParentDashboard
        profile={profile}
        isOpen={isParentModalOpen}
        onClose={() => setIsParentModalOpen(false)}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Playful Footer */}
      <footer className="mt-8 border-t border-amber-200/60 bg-white/70 backdrop-blur-sm py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1">
            <span>✨ MEP Kids Adventure: ป.1 เรียนสนุก</span>
            <span className="text-slate-400">| ภาษาอังกฤษ • ภาษาไทย • คณิตศาสตร์</span>
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>เพื่อนคู่ใจปัจจุบัน: {activeCompanion.name}</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsParentModalOpen(true)}
              className="text-indigo-600 hover:underline font-semibold cursor-pointer"
            >
              แดชบอร์ดผู้ปกครอง
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
