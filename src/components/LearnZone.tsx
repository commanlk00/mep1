import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  PenTool, 
  GraduationCap, 
  Eye, 
  EyeOff,
  Filter
} from 'lucide-react';
import { SubjectId, QuestionItem, UserProfile } from '../types';
import { QUESTIONS, CATEGORY_INFO } from '../data/learningData';
import { CompanionAvatar } from './CompanionAvatar';
import { HandwritingPad } from './HandwritingPad';
import { sound } from '../utils/sound';
import { recordQuestionResult } from '../utils/storage';

interface LearnZoneProps {
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
}

const FAMOUS_SCHOOLS = [
  'ทุกโรงเรียนดัง (All Exams)',
  'สาธิตจุฬาฯ',
  'สาธิตเกษตรฯ',
  'อัสสัมชัญ / กรุงเทพคริสเตียน',
  'เซนต์คาเบรียล',
  'สารสาสน์วิเทศ',
];

export const LearnZone: React.FC<LearnZoneProps> = ({ profile, onUpdateProfile }) => {
  const [activeSubject, setActiveSubject] = useState<SubjectId>('english');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('ทุกโรงเรียนดัง (All Exams)');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [companionMood, setCompanionMood] = useState<'idle' | 'happy' | 'celebrating' | 'wrong'>('idle');
  const [comboStreak, setComboStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [levelUpNotice, setLevelUpNotice] = useState<number | null>(null);
  const [showScratchpad, setShowScratchpad] = useState(true);

  // Filter questions according to subject, category, and school exam source
  const filteredQuestions = QUESTIONS.filter((q) => {
    if (q.subject !== activeSubject) return false;
    if (activeCategory !== 'all' && q.category !== activeCategory) return false;
    if (selectedSchool !== 'ทุกโรงเรียนดัง (All Exams)') {
      if (!q.schoolSource.includes(selectedSchool)) return false;
    }
    return true;
  });

  const currentQ: QuestionItem | undefined = filteredQuestions[currentQuestionIndex] || filteredQuestions[0];

  // Subject categories list
  const availableCategories = Object.entries(CATEGORY_INFO)
    .filter(([_, info]) => info.subject === activeSubject)
    .map(([key, info]) => ({ id: key, ...info }));

  // When subject changes, reset index and category
  const handleSubjectChange = (subj: SubjectId) => {
    sound.playPop();
    setActiveSubject(subj);
    setActiveCategory('all');
    setSelectedSchool('ทุกโรงเรียนดัง (All Exams)');
    setCurrentQuestionIndex(0);
    resetQuestionState();
  };

  const resetQuestionState = () => {
    setSelectedChoice(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setCompanionMood('idle');
  };

  const handleChoiceSelect = (choiceIndex: number) => {
    if (isAnswered || !currentQ) return;

    setSelectedChoice(choiceIndex);
    setIsAnswered(true);

    const correct = choiceIndex === currentQ.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      sound.playCorrect();
      setComboStreak((prev) => prev + 1);
      setCompanionMood('celebrating');

      // Trigger colorful confetti celebration
      try {
        confetti({
          particleCount: 55,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
        });
      } catch {
        // ignore
      }

      // Record in profile
      const { updatedProfile, didLevelUp } = recordQuestionResult(profile, currentQ.subject, true);
      onUpdateProfile(updatedProfile);

      if (didLevelUp) {
        sound.playFanfare();
        setLevelUpNotice(updatedProfile.level);
      }
    } else {
      sound.playWrong();
      setComboStreak(0);
      setCompanionMood('wrong');

      const { updatedProfile } = recordQuestionResult(profile, currentQ.subject, false);
      onUpdateProfile(updatedProfile);
    }
  };

  const handleNextQuestion = () => {
    sound.playPop();
    resetQuestionState();
    if (currentQuestionIndex + 1 < filteredQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      sound.playFanfare();
      setCurrentQuestionIndex(0);
    }
  };

  return (
    <section className="space-y-4 sm:space-y-6">
      {/* Subject Tabs */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-sm border border-amber-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span>คลังแนวข้อสอบ ป.1 MEP จากโรงเรียนดัง</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
                ข้อสอบจริง 90 ข้อ
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              สาธิตจุฬาฯ • สาธิตเกษตรฯ • อัสสัมชัญ / กรุงเทพคริสเตียน • เซนต์คาเบรียล • สารสาสน์ MEP พร้อมระบบเขียนบนหน้าจอ
            </p>
          </div>

          {/* Combo streak badge */}
          {comboStreak > 1 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs sm:text-sm font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 animate-pulse"
            >
              <span>🔥 COMBO x{comboStreak}!</span>
              <span>⭐ +{comboStreak * 2}</span>
            </motion.div>
          )}
        </div>

        {/* Big Touch-Friendly Subject Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* English MEP */}
          <button
            id="subject-btn-english"
            type="button"
            onClick={() => handleSubjectChange('english')}
            className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border-2 ${
              activeSubject === 'english'
                ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-200 scale-[1.02]'
                : 'bg-indigo-50/50 hover:bg-indigo-100/50 text-indigo-950 border-indigo-100'
            }`}
          >
            <span className="text-2xl sm:text-3xl mb-1">🇬🇧 👨‍⚕️</span>
            <span className="font-extrabold text-xs sm:text-base">English MEP</span>
            <span className="text-[10px] sm:text-xs opacity-85">หมวดอาชีพ & Missing Letter</span>
          </button>

          {/* Thai */}
          <button
            id="subject-btn-thai"
            type="button"
            onClick={() => handleSubjectChange('thai')}
            className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border-2 ${
              activeSubject === 'thai'
                ? 'bg-gradient-to-b from-sky-500 to-sky-600 text-white border-sky-700 shadow-md shadow-sky-200 scale-[1.02]'
                : 'bg-sky-50/50 hover:bg-sky-100/50 text-sky-950 border-sky-100'
            }`}
          >
            <span className="text-2xl sm:text-3xl mb-1">🇹🇭 ✍️</span>
            <span className="font-extrabold text-xs sm:text-base">ภาษาไทย ป.1</span>
            <span className="text-[10px] sm:text-xs opacity-85">ฝึกเขียนคัดลายมือ & เติมคำ</span>
          </button>

          {/* Math */}
          <button
            id="subject-btn-math"
            type="button"
            onClick={() => handleSubjectChange('math')}
            className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border-2 ${
              activeSubject === 'math'
                ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white border-amber-700 shadow-md shadow-amber-200 scale-[1.02]'
                : 'bg-amber-50/50 hover:bg-amber-100/50 text-amber-950 border-amber-100'
            }`}
          >
            <span className="text-2xl sm:text-3xl mb-1">🔢 💯</span>
            <span className="font-extrabold text-xs sm:text-base">คณิตศาสตร์</span>
            <span className="text-[10px] sm:text-xs opacity-85">บวก-ลบเลขหลักสิบ & ทดเลข</span>
          </button>
        </div>

        {/* Sub-Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-slate-100 pb-1">
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setActiveCategory('all');
              setCurrentQuestionIndex(0);
              resetQuestionState();
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🌟 ทุกหมวดหมู่ (All)
          </button>

          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sound.playPop();
                setActiveCategory(cat.id);
                setCurrentQuestionIndex(0);
                resetQuestionState();
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-amber-950 shadow-sm ring-2 ring-amber-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.labelTh}</span>
            </button>
          ))}
        </div>

        {/* Filter by Famous School Source */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 mt-1 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400 font-bold whitespace-nowrap mr-1">
            <Filter size={12} />
            <span>คัดเฉพาะโรงเรียน:</span>
          </span>
          {FAMOUS_SCHOOLS.map((school) => (
            <button
              key={school}
              type="button"
              onClick={() => {
                sound.playPop();
                setSelectedSchool(school);
                setCurrentQuestionIndex(0);
                resetQuestionState();
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSchool === school
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {school}
            </button>
          ))}
        </div>
      </div>

      {/* Game Arena Card */}
      {currentQ ? (
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-amber-200 relative overflow-hidden">
          
          {/* Header info in question card: School Exam Source + Question counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {/* Prestigious School Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white shadow-sm tracking-wide">
                <GraduationCap size={15} />
                <span>{currentQ.schoolSource}</span>
              </span>

              <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                ข้อที่ {currentQuestionIndex + 1} / {filteredQuestions.length}
              </span>

              {currentQ.isWritingExercise && (
                <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <PenTool size={13} />
                  <span>มีกระดานเขียน & คัดลายมือ</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Scratchpad toggle */}
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setShowScratchpad(!showScratchpad);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-300 cursor-pointer"
                title="เปิด/ซ่อน กระดานเขียนบนหน้าจอ"
              >
                {showScratchpad ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showScratchpad ? 'ซ่อนกระดานเขียน' : 'เปิดกระดานเขียน'}</span>
              </button>

              {/* Companion cheering on top right */}
              <CompanionAvatar
                companionId={profile.avatarId}
                mood={companionMood}
                size="md"
              />
            </div>
          </div>

          {/* Central Question Display: Image/Emoji + Formatted Problem */}
          <div className="bg-gradient-to-b from-amber-50/70 to-orange-50/40 rounded-2xl p-4 sm:p-6 border border-amber-200 flex flex-col items-center text-center relative mb-6">
            
            {/* Object Image or Math objects */}
            <motion.div
              key={currentQ.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative my-2"
            >
              {currentQ.mathObjects ? (
                <div className="flex flex-wrap items-center justify-center gap-2 text-3xl sm:text-4xl py-2 max-w-md">
                  {currentQ.mathObjects.map((obj, i) => (
                    <span
                      key={i}
                      className="inline-block drop-shadow-sm animate-bounce-short"
                    >
                      {obj}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-6xl sm:text-8xl drop-shadow-md select-none transform transition-transform hover:scale-110">
                  {currentQ.imageEmoji}
                </div>
              )}
            </motion.div>

            {/* Prompt Instruction */}
            <h3 className="text-base sm:text-xl font-bold text-slate-800 mt-2 max-w-2xl leading-relaxed">
              {currentQ.prompt}
            </h3>

            {/* Special Display: Missing Letter interactive card */}
            {currentQ.missingLetterData && (
              <div className="mt-4 p-3 sm:p-4 bg-white rounded-2xl border-2 border-indigo-300 shadow-sm flex flex-col items-center">
                <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">
                  เติมตัวอักษรที่ขาดหายไป (Missing Letter)
                </span>
                <div className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-slate-800 py-1 flex items-center justify-center gap-2">
                  {currentQ.missingLetterData.displayWord.split(' ').map((char, idx) => (
                    <span
                      key={idx}
                      className={`inline-block px-2 py-0.5 rounded-lg ${
                        char === '_' 
                          ? 'bg-amber-100 border-2 border-dashed border-amber-500 text-amber-600 animate-pulse min-w-10 text-center' 
                          : 'bg-slate-100'
                      }`}
                    >
                      {char === '_' && isAnswered && isCorrect ? currentQ.missingLetterData?.missingLetter : char}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Special Display: Vertical 2-Digit Math Column Block */}
            {currentQ.verticalCalculation && (
              <div className="mt-4 p-4 bg-white rounded-2xl border-2 border-amber-300 shadow-sm inline-block">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 border-b border-slate-200 pb-1 mb-2 px-3 gap-6">
                  <span>หลักสิบ (Tens)</span>
                  <span>หลักหน่วย (Ones)</span>
                </div>
                <div className="font-mono text-3xl sm:text-4xl font-black text-slate-800 text-right px-4 space-y-1">
                  <div>{currentQ.verticalCalculation.num1}</div>
                  <div className="flex items-center justify-between gap-4 border-b-2 border-slate-800 pb-1">
                    <span className="text-2xl text-amber-600 font-black">{currentQ.verticalCalculation.operator}</span>
                    <span>{currentQ.verticalCalculation.num2}</span>
                  </div>
                  <div className="text-indigo-600 pt-1 tracking-widest">
                    {isAnswered && isCorrect 
                      ? (currentQ.verticalCalculation.operator === '+' 
                          ? currentQ.verticalCalculation.num1 + currentQ.verticalCalculation.num2 
                          : currentQ.verticalCalculation.num1 - currentQ.verticalCalculation.num2)
                      : '? ?'}
                  </div>
                </div>
              </div>
            )}

            {/* Hint and Helper Actions */}
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setShowHint(!showHint);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="ดูคำใบ้"
              >
                <HelpCircle size={16} />
                <span>{showHint ? 'ซ่อนคำใบ้' : 'ดูคำใบ้ (Hint)'}</span>
              </button>

              {currentQ.traceGuide && (
                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-xl font-bold">
                  ✍️ คำที่ฝึกเขียน: {currentQ.traceGuide}
                </span>
              )}
            </div>

            {/* Hint Box */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 text-xs sm:text-sm bg-yellow-100/90 text-yellow-900 border border-yellow-300 rounded-xl px-4 py-2 max-w-md"
                >
                  💡 <strong>คำใบ้:</strong> {currentQ.hint}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* On-Screen Writing & Scratchpad Canvas (Integrated) */}
          {showScratchpad && (
            <div className="mb-6">
              <HandwritingPad
                traceGuide={currentQ.traceGuide}
                initialGuideType={currentQ.verticalCalculation ? 'grid' : 'handwriting'}
                title={
                  currentQ.subject === 'math'
                    ? 'ตารางสมุดทดเลข & วิธีทำแนวตั้ง (Math Scratchpad)'
                    : 'กระดานฝึกเขียนคัดลายมือ & เติมคำ (Handwriting Pad)'
                }
              />
            </div>
          )}

          {/* Multiple Choices Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {currentQ.choices.map((choice, index) => {
              const isSelected = selectedChoice === index;
              const isTargetCorrect = index === currentQ.correctIndex;

              let buttonStyle = 'bg-slate-50 hover:bg-amber-50 text-slate-800 border-slate-200';
              if (isAnswered) {
                if (isTargetCorrect) {
                  buttonStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-4 ring-emerald-200';
                } else if (isSelected && !isTargetCorrect) {
                  buttonStyle = 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-200';
                } else {
                  buttonStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
                }
              }

              return (
                <motion.button
                  key={index}
                  id={`choice-btn-${index}`}
                  type="button"
                  onClick={() => handleChoiceSelect(index)}
                  disabled={isAnswered}
                  whileHover={!isAnswered ? { scale: 1.02 } : {}}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  className={`p-4 sm:p-5 rounded-2xl border-2 font-bold text-base sm:text-lg flex items-center justify-between transition-all cursor-pointer shadow-sm ${buttonStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-xs font-black">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{choice}</span>
                  </div>

                  {isAnswered && (
                    <span>
                      {isTargetCorrect && <CheckCircle2 size={24} className="text-white" />}
                      {isSelected && !isTargetCorrect && <AlertCircle size={24} className="text-white" />}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Answer Feedback & Next Question Button */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border ${
                  isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl sm:text-4xl">{isCorrect ? '🎉' : '💡'}</div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base">
                      {isCorrect ? 'ถูกต้องแล้ว เก่งมากๆ! (Excellent!)' : 'เกือบถูกแล้วนะ ลองจำคำตอบไว้นะคนเก่ง!'}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                      {isCorrect
                        ? `คุณได้รับ +3 ดาว ⭐ และ +25 EXP! (${currentQ.schoolSource})`
                        : `คำตอบที่ถูกต้องคือ "${currentQ.choices[currentQ.correctIndex]}" (${currentQ.englishWord || currentQ.thaiWord || ''})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    id="next-question-btn"
                    type="button"
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-amber-200 transition-all cursor-pointer active:scale-95"
                  >
                    <span>ข้อถัดไป (Next Question)</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-600 border border-amber-200">
          <p>ไม่มีคำถามในหมวดหมู่หรือโรงเรียนที่เลือก</p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('all');
              setSelectedSchool('ทุกโรงเรียนดัง (All Exams)');
            }}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            แสดงคำถามทั้งหมด
          </button>
        </div>
      )}

      {/* Daily Quests Mini-Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-3xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400" size={20} />
            <h3 className="font-extrabold text-sm sm:text-base">ภารกิจพิชิตข้อสอบประจำวัน (Daily Exam Missions)</h3>
          </div>
          <span className="text-xs bg-indigo-700 text-indigo-200 font-semibold px-2.5 py-0.5 rounded-full">
            รีเซ็ตทุกวัน
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {profile.dailyQuests.map((quest) => (
            <div
              key={quest.id}
              className={`p-3 rounded-2xl border transition-all ${
                quest.completed
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-indigo-950/40 border-indigo-700/50 text-indigo-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold leading-snug">{quest.titleTh}</p>
                {quest.completed ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-xs text-amber-400 font-bold shrink-0">+{quest.starReward}⭐</span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
                <div className="w-full bg-slate-700/70 h-1.5 rounded-full overflow-hidden mr-2">
                  <div
                    className={`h-full rounded-full ${quest.completed ? 'bg-emerald-400' : 'bg-amber-400'}`}
                    style={{ width: `${Math.min(100, (quest.currentCount / quest.targetCount) * 100)}%` }}
                  />
                </div>
                <span className="font-mono">
                  {quest.currentCount}/{quest.targetCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level Up Celebration Modal */}
      <AnimatePresence>
        {levelUpNotice && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center border-4 border-amber-400 shadow-2xl relative"
            >
              <div className="text-6xl mb-2 animate-bounce">👑</div>
              <h3 className="text-2xl font-black text-amber-600 tracking-tight">
                LEVEL UP! เลเวลอัป!
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                ยินดีด้วยนะคนเก่ง! หนูขึ้นสู่
              </p>
              <div className="my-4 inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-white text-3xl font-black px-6 py-2 rounded-2xl shadow-md">
                LEVEL {levelUpNotice}
              </div>
              <p className="text-xs text-slate-500 mb-5">
                รับโบนัสพิเศษ +15 ดาวทอง ⭐ ไปปลดล็อกสติกเกอร์ในสมุดรางวัลได้เลย!
              </p>
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setLevelUpNotice(null);
                }}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-md cursor-pointer transition-all active:scale-95"
              >
                รับรางวัล & ลุยต่อเลย!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
