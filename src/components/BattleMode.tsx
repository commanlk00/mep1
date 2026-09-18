import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, Swords, Zap, RefreshCw, Bot, Users } from 'lucide-react';
import { QuestionItem, UserProfile } from '../types';
import { QUESTIONS, COMPANIONS } from '../data/learningData';
import { sound } from '../utils/sound';
import { recordQuestionResult } from '../utils/storage';

interface BattleModeProps {
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onBackToLearn: () => void;
}

export const BattleMode: React.FC<BattleModeProps> = ({ profile, onUpdateProfile, onBackToLearn }) => {
  const [battleType, setBattleType] = useState<'bot' | 'pvp'>('bot');
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'round_result' | 'finished'>('lobby');
  const [round, setRound] = useState(1);
  const totalRounds = 5;

  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);

  const [currentQuestions, setCurrentQuestions] = useState<QuestionItem[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  const [p1Answered, setP1Answered] = useState<number | null>(null);
  const [p2Answered, setP2Answered] = useState<number | null>(null);
  const [roundWinner, setRoundWinner] = useState<'p1' | 'p2' | 'draw' | null>(null);

  // Initialize randomized questions for the battle
  const startBattle = (type: 'bot' | 'pvp') => {
    sound.playPop();
    setBattleType(type);
    setScoreP1(0);
    setScoreP2(0);
    setRound(1);

    // Shuffle 5 questions from the pool
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, totalRounds);
    setCurrentQuestions(shuffled);
    setCurrentQIndex(0);
    resetRound();
    setGameState('playing');
  };

  const resetRound = () => {
    setP1Answered(null);
    setP2Answered(null);
    setRoundWinner(null);
  };

  const activeQ = currentQuestions[currentQIndex];

  // Auto-speak removed per requirement: "ให้เอาระบบเสียงพูดออก"

  // Bot logic
  useEffect(() => {
    if (gameState === 'playing' && battleType === 'bot' && activeQ && p2Answered === null) {
      // Bot thinks for 1.8 to 3.2 seconds
      const botDelay = Math.floor(Math.random() * 1400) + 1800;
      const botTimer = setTimeout(() => {
        // 80% accuracy for bot
        const isBotCorrect = Math.random() < 0.8;
        const choice = isBotCorrect
          ? activeQ.correctIndex
          : (activeQ.correctIndex + 1) % activeQ.choices.length;
        setP2Answered(choice);
      }, botDelay);

      return () => clearTimeout(botTimer);
    }
  }, [gameState, battleType, activeQ, p2Answered]);

  // Determine round outcome when players have answered
  useEffect(() => {
    if (gameState !== 'playing' || !activeQ) return;

    if (p1Answered !== null && p2Answered !== null) {
      const p1Correct = p1Answered === activeQ.correctIndex;
      const p2Correct = p2Answered === activeQ.correctIndex;

      let winner: 'p1' | 'p2' | 'draw' = 'draw';
      if (p1Correct && !p2Correct) {
        winner = 'p1';
        setScoreP1((s) => s + 10);
        sound.playCorrect();
      } else if (!p1Correct && p2Correct) {
        winner = 'p2';
        setScoreP2((s) => s + 10);
        sound.playWrong();
      } else if (p1Correct && p2Correct) {
        winner = 'draw';
        setScoreP1((s) => s + 5);
        setScoreP2((s) => s + 5);
        sound.playCorrect();
      } else {
        winner = 'draw';
        sound.playWrong();
      }

      setRoundWinner(winner);
      setGameState('round_result');
    }
  }, [p1Answered, p2Answered, gameState, activeQ]);

  const handleNextRound = () => {
    sound.playPop();
    if (round < totalRounds) {
      setRound((r) => r + 1);
      setCurrentQIndex((i) => i + 1);
      resetRound();
      setGameState('playing');
    } else {
      // End game
      sound.playFanfare();
      setGameState('finished');
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      // Award bonus stars to user
      const { updatedProfile } = recordQuestionResult(profile, 'english', scoreP1 >= scoreP2, 30);
      onUpdateProfile(updatedProfile);
    }
  };

  const currentCompanion = COMPANIONS.find((c) => c.id === profile.avatarId) || COMPANIONS[0];

  return (
    <section className="space-y-4 sm:space-y-6">
      {/* Lobby View */}
      {gameState === 'lobby' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-rose-200 text-center">
          <div className="inline-flex p-4 rounded-3xl bg-rose-100 text-rose-600 mb-4 animate-bounce-short">
            <Swords size={48} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            โหมดดวลเพื่อน 2 คน (Friend Battle Arena)
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-lg mx-auto">
            ประลองความรู้ภาษาอังกฤษ MEP ภาษาไทย และคณิตศาสตร์ ตอบไว ได้คะแนน สะสมดาว!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mt-8">
            <button
              id="battle-vs-bot-btn"
              type="button"
              onClick={() => startBattle('bot')}
              className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-black text-lg shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex flex-col items-center gap-3 border-2 border-indigo-700"
            >
              <Bot size={40} className="text-indigo-200" />
              <span>ดวลกับหุ่นยนต์ Pip Bot</span>
              <span className="text-xs font-medium text-indigo-100">ฝึกซ้อมเดี่ยว แข่งกับบอทฉลาด</span>
            </button>

            <button
              id="battle-vs-player-btn"
              type="button"
              onClick={() => startBattle('pvp')}
              className="p-6 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white font-black text-lg shadow-lg shadow-rose-200 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex flex-col items-center gap-3 border-2 border-rose-700"
            >
              <Users size={40} className="text-rose-200" />
              <span>ดวลเพื่อน 2 ผู้เล่น (Split Screen)</span>
              <span className="text-xs font-medium text-rose-100">เล่นด้วยกันบนหน้าจอเดียวกัน 2 ฝั่ง</span>
            </button>
          </div>
        </div>
      )}

      {/* Playing & Round Result View */}
      {(gameState === 'playing' || gameState === 'round_result') && activeQ && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-rose-200 relative overflow-hidden">
          
          {/* Header Scoreboard */}
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
            {/* Player 1 Info */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl shadow-sm border border-blue-600">
                {currentCompanion.avatar}
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600">Player 1 (คนเก่ง)</p>
                <p className="text-xl sm:text-2xl font-black text-slate-800">{scoreP1} แต้ม</p>
              </div>
            </div>

            {/* Round info */}
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 px-3 py-1 rounded-full">
                ยกที่ {round} / {totalRounds}
              </span>
              <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center justify-center gap-1">
                <Zap size={13} className="text-amber-500" />
                <span>แข่งตอบให้เร็วและแม่นยำ</span>
              </div>
            </div>

            {/* Player 2 / Bot Info */}
            <div className="flex items-center gap-2 flex-row-reverse text-right">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl shadow-sm border border-rose-600">
                {battleType === 'bot' ? '🤖' : '🦊'}
              </div>
              <div>
                <p className="text-xs font-bold text-rose-600">
                  {battleType === 'bot' ? 'Pip Bot' : 'Player 2 (เพื่อนรัก)'}
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-800">{scoreP2} แต้ม</p>
              </div>
            </div>
          </div>

          {/* Question Card Center */}
          <div className="my-6 bg-gradient-to-b from-amber-50 to-orange-50/50 rounded-2xl p-4 sm:p-6 border border-amber-200 text-center">
            {/* School Exam Source Tag */}
            <div className="mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                <span>🏫</span>
                <span>{activeQ.schoolSource}</span>
              </span>
            </div>

            <div className="text-6xl sm:text-7xl mb-2 drop-shadow-sm animate-bounce-short">
              {activeQ.imageEmoji}
            </div>
            <h3 className="text-base sm:text-xl font-bold text-slate-800">
              {activeQ.prompt}
            </h3>
            
            {(activeQ.englishWord || activeQ.thaiWord) && (
              <div className="mt-2 text-xs font-semibold text-slate-600">
                {activeQ.englishWord && <span className="text-indigo-600 font-bold mr-2">{activeQ.englishWord}</span>}
                {activeQ.thaiWord && <span className="text-slate-500">({activeQ.thaiWord})</span>}
              </div>
            )}
          </div>

          {/* Dual Action Play Zone */}
          {battleType === 'pvp' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Player 1 Section */}
              <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-200">
                <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
                  <span>🔵 ฝั่ง Player 1:</span>
                  {p1Answered !== null && <span className="text-emerald-600">✓ เลือกแล้ว!</span>}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {activeQ.choices.map((choice, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={p1Answered !== null}
                      onClick={() => {
                        sound.playPop();
                        setP1Answered(i);
                      }}
                      className={`p-3 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
                        p1Answered === i
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-white hover:bg-blue-100 text-slate-700 border-blue-200'
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              {/* Player 2 Section */}
              <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-200">
                <p className="text-xs font-bold text-rose-700 mb-2 flex items-center gap-1">
                  <span>🔴 ฝั่ง Player 2:</span>
                  {p2Answered !== null && <span className="text-emerald-600">✓ เลือกแล้ว!</span>}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {activeQ.choices.map((choice, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={p2Answered !== null}
                      onClick={() => {
                        sound.playPop();
                        setP2Answered(i);
                      }}
                      className={`p-3 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
                        p2Answered === i
                          ? 'bg-rose-600 text-white border-rose-700'
                          : 'bg-white hover:bg-rose-100 text-slate-700 border-rose-200'
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Bot Battle: Kid plays against Bot */
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2 text-center">
                เลือกคำตอบของคุณให้เร็วและถูกต้องที่สุด!
              </p>
              <div className="grid grid-cols-2 gap-3">
                {activeQ.choices.map((choice, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={p1Answered !== null}
                    onClick={() => {
                      sound.playPop();
                      setP1Answered(i);
                    }}
                    className={`p-4 rounded-2xl font-bold text-base sm:text-lg transition-all cursor-pointer border-2 ${
                      p1Answered === i
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300'
                        : 'bg-slate-50 hover:bg-indigo-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>

              {/* Bot status indicator */}
              <div className="mt-4 text-center">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  🤖 Pip Bot:{' '}
                  {p2Answered === null ? 'กำลังคิดคำตอบอย่างรวดเร็ว...' : 'เลือกคำตอบแล้ว!'}
                </span>
              </div>
            </div>
          )}

          {/* Round Result Dialog */}
          <AnimatePresence>
            {gameState === 'round_result' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-amber-100 border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
              >
                <div>
                  <h4 className="font-extrabold text-amber-950 text-base">
                    {roundWinner === 'p1' && '🎉 Player 1 ตอบถูกต้อง ได้คะแนน!'}
                    {roundWinner === 'p2' && (battleType === 'bot' ? '🤖 Pip Bot ได้คะแนนรอบนี้!' : '🎉 Player 2 ตอบถูกต้อง ได้คะแนน!')}
                    {roundWinner === 'draw' && '🤝 ตอบเสมอ หรือผิดทั้งคู่!'}
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    คำตอบที่ถูกต้องคือ: <strong>{activeQ.choices[activeQ.correctIndex]}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNextRound}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow cursor-pointer transition-all active:scale-95"
                >
                  {round < totalRounds ? 'ยกถัดไป (Next Round)' : 'ดูผลสรุปผู้ชนะ! 🏆'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Finished Summary View */}
      {gameState === 'finished' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-300 text-center">
          <div className="inline-block p-4 rounded-3xl bg-amber-100 text-amber-500 mb-4 animate-bounce">
            <Trophy size={60} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            {scoreP1 > scoreP2
              ? '👑 Player 1 ชนะการแข่งขัน!'
              : scoreP1 < scoreP2
              ? battleType === 'bot'
                ? '🤖 Pip Bot ชนะรอบนี้!'
                : '👑 Player 2 ชนะการแข่งขัน!'
              : '🤝 ยอดเยี่ยมทั้งคู่ เสมอกัน!'}
          </h2>

          <p className="text-sm text-slate-600 mt-1">
            คะแนนสุดท้าย: Player 1 ได้ {scoreP1} คะแนน vs {battleType === 'bot' ? 'Pip Bot' : 'Player 2'} ได้ {scoreP2} คะแนน
          </p>

          <div className="my-6 inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 px-5 py-2.5 rounded-2xl text-amber-900 font-bold text-sm">
            <span>⭐ รับรางวัลพิเศษ +10 ดาว เพิ่มเข้ากระเป๋าแล้ว!</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => startBattle(battleType)}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md cursor-pointer flex items-center gap-2"
            >
              <RefreshCw size={18} />
              <span>ดวลอีกรอบ (Rematch)</span>
            </button>

            <button
              type="button"
              onClick={onBackToLearn}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
            >
              <span>กลับสู่หน้าเรียนรู้</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
