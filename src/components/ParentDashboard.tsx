import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  Award, 
  Clock, 
  CheckCircle, 
  Brain, 
  Printer, 
  RotateCcw, 
  X, 
  Sparkles,
  Wifi
} from 'lucide-react';
import { UserProfile } from '../types';
import { sound } from '../utils/sound';
import { INITIAL_USER_PROFILE } from '../data/learningData';

interface ParentDashboardProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (newProfile: UserProfile) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  profile,
  isOpen,
  onClose,
  onUpdateProfile,
}) => {
  // Parental Lock Gate: Simple random math problem
  const [gatePassed, setGatePassed] = useState(false);
  const [numA] = useState(() => Math.floor(Math.random() * 8) + 3);
  const [numB] = useState(() => Math.floor(Math.random() * 7) + 2);
  const [parentAnswer, setParentAnswer] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);

  if (!isOpen) return null;

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(parentAnswer, 10) === numA + numB) {
      sound.playCorrect();
      setGatePassed(true);
    } else {
      sound.playWrong();
      alert('คำตอบไม่ถูกต้องสำหรับผู้ปกครอง กรุณาลองใหม่อีกครั้ง');
      setParentAnswer('');
    }
  };

  const getSubjectAccuracy = (answered: number, correct: number) => {
    if (answered === 0) return 0;
    return Math.round((correct / answered) * 100);
  };

  const englishAcc = getSubjectAccuracy(profile.stats.english.answered, profile.stats.english.correct);
  const thaiAcc = getSubjectAccuracy(profile.stats.thai.answered, profile.stats.thai.correct);
  const mathAcc = getSubjectAccuracy(profile.stats.math.answered, profile.stats.math.correct);

  const totalAnswered = profile.stats.english.answered + profile.stats.thai.answered + profile.stats.math.answered;
  const totalCorrect = profile.stats.english.correct + profile.stats.thai.correct + profile.stats.math.correct;
  const overallAcc = getSubjectAccuracy(totalAnswered, totalCorrect);
  const totalMinutes = Math.round(
    (profile.stats.english.timeSpentSeconds + profile.stats.thai.timeSpentSeconds + profile.stats.math.timeSpentSeconds) / 60
  );

  const handleResetData = () => {
    if (confirm('ยืนยันการรีเซ็ตข้อมูลความก้าวหน้าทั้งหมดของน้องหรือไม่?')) {
      onUpdateProfile(INITIAL_USER_PROFILE);
      sound.playPop();
      alert('รีเซ็ตข้อมูลการเรียนรู้เรียบร้อยแล้ว');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-2 border-indigo-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-700/60 border border-indigo-500/40">
              <ShieldCheck size={24} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                แดชบอร์ดสรุปพัฒนาการสำหรับผู้ปกครอง (Parent Portal)
              </h2>
              <p className="text-xs text-indigo-200">
                ติดตามผลการเรียนรู้แบบเรียลไทม์ ป.1 หลักสูตร MEP, ภาษาไทย, และคณิตศาสตร์
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Gate Check if not unlocked yet */}
        {!gatePassed ? (
          <div className="p-6 sm:p-8 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl mb-3 shadow-inner">
              🔒
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              ระบบตรวจสอบความปลอดภัยสำหรับผู้ใหญ่
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-4">
              เพื่อป้องกันไม่ให้เด็กกดแก้ไขข้อมูลโดยไม่ได้ตั้งใจ โปรดตอบคำถามคณิตศาสตร์:
            </p>

            <form onSubmit={handleGateSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xl font-mono font-black text-indigo-900">
                {numA} + {numB} = ?
              </div>
              <input
                type="number"
                value={parentAnswer}
                onChange={(e) => setParentAnswer(e.target.value)}
                placeholder="กรอกคำตอบที่ถูกต้อง..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-center text-lg font-bold text-slate-800 outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md cursor-pointer"
                >
                  ปลดล็อกแดชบอร์ด
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Dashboard Content */
          <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Top Stat Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-bold mb-1">
                  <BarChart3 size={15} />
                  <span>ความถูกต้องเฉลี่ย</span>
                </div>
                <p className="text-2xl font-black text-indigo-950">{overallAcc}%</p>
                <p className="text-[11px] text-slate-500">ตอบถูก {totalCorrect}/{totalAnswered} ข้อ</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold mb-1">
                  <Sparkles size={15} />
                  <span>ดาวสะสมทั้งหมด</span>
                </div>
                <p className="text-2xl font-black text-amber-950">{profile.totalStars} ⭐</p>
                <p className="text-[11px] text-slate-500">เลเวลปัจจุบัน: Lv.{profile.level}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-1">
                  <Clock size={15} />
                  <span>เวลาฝึกฝนรวม</span>
                </div>
                <p className="text-2xl font-black text-emerald-950">{totalMinutes} นาที</p>
                <p className="text-[11px] text-slate-500">สมองเรียนรู้ต่อเนื่อง</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100">
                <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold mb-1">
                  <span>🔥</span>
                  <span>ความสม่ำเสมอ</span>
                </div>
                <p className="text-2xl font-black text-rose-950">{profile.dailyStreak} วัน</p>
                <p className="text-[11px] text-slate-500">สถิติเรียนรู้รายวัน</p>
              </div>
            </div>

            {/* Subject Mastery Progress Bars */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 mb-3 flex items-center justify-between">
                <span>ความก้าวหน้าแยกตาม 3 กลุ่มสาระการเรียนรู้</span>
                <span className="text-xs font-normal text-slate-500">อัปเดตเรียลไทม์</span>
              </h3>

              <div className="space-y-4">
                {/* English MEP */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-indigo-900">
                      <span>🇬🇧</span>
                      <span>English MEP (คำศัพท์, เสียงโฟนิกส์, การฟัง)</span>
                    </span>
                    <span className="font-mono text-indigo-700">{englishAcc}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${englishAcc}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>ตอบแล้ว {profile.stats.english.answered} ข้อ (ถูก {profile.stats.english.correct} ข้อ)</span>
                    <span>ระดับความพร้อม: {englishAcc >= 80 ? 'ดีเยี่ยม (Advanced)' : 'กำลังพัฒนา (Developing)'}</span>
                  </div>
                </div>

                {/* Thai */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-sky-900">
                      <span>🇹🇭</span>
                      <span>ภาษาไทย ป.1 (พยัญชนะ ก-ฮ, สระประสม, คำศัพท์รอบตัว)</span>
                    </span>
                    <span className="font-mono text-sky-700">{thaiAcc}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${thaiAcc}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>ตอบแล้ว {profile.stats.thai.answered} ข้อ (ถูก {profile.stats.thai.correct} ข้อ)</span>
                    <span>ระดับความพร้อม: {thaiAcc >= 80 ? 'ดีเยี่ยม (Advanced)' : 'กำลังพัฒนา (Developing)'}</span>
                  </div>
                </div>

                {/* Math */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-amber-900">
                      <span>🔢</span>
                      <span>คณิตศาสตร์พื้นฐาน (นับจำนวน, บวกลบไม่เกิน 10 และ 20)</span>
                    </span>
                    <span className="font-mono text-amber-700">{mathAcc}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${mathAcc}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>ตอบแล้ว {profile.stats.math.answered} ข้อ (ถูก {profile.stats.math.correct} ข้อ)</span>
                    <span>ระดับความพร้อม: {mathAcc >= 80 ? 'ดีเยี่ยม (Advanced)' : 'กำลังพัฒนา (Developing)'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personalized Recommendations for MEP Parents */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm mb-2">
                <Brain size={18} className="text-emerald-700" />
                <span>คำแนะนำเชิงพัฒนาการสำหรับผู้ปกครองห้อง MEP</span>
              </div>
              <ul className="text-xs text-emerald-950 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>การออกเสียง (Phonics):</strong> น้องมีความคุ้นเคยกับคำศัพท์หมวดสัตว์และผลไม้เป็นอย่างดี แนะนำให้เปิดเสียงฟังซ้ำและชวนน้องออกเสียงตามจังหวะเสียงสระสั้น เช่น /æ/ ใน Cat และ /ʌ/ ใน Sun
                </li>
                <li>
                  <strong>ภาษาไทย:</strong> ฝึกประสมเสียงสระเสียงยาว (สระอา, สระอี, สระอู) ควบคู่กับการเขียนลากเส้นตามรอย เพื่อเสริมสร้างกล้ามเนื้อมือ
                </li>
                <li>
                  <strong>คณิตศาสตร์:</strong> การใช้รูปภาพผลไม้และบล็อกสีช่วยให้น้องจินตนาการจำนวนคู่สิบ (Ten frame) ได้แม่นยำขึ้นมาก
                </li>
              </ul>
            </div>

            {/* Offline Safety Assurance */}
            <div className="bg-slate-100 rounded-2xl p-3 text-xs text-slate-600 flex items-center gap-2 border border-slate-200">
              <Wifi size={16} className="text-emerald-600 shrink-0" />
              <span>
                <strong>ระบบออฟไลน์สมบูรณ์แบบ:</strong> ข้อมูลทั้งหมดถูกจัดเก็บบนอุปกรณ์เครื่องนี้โดยตรง ไม่ส่งข้อมูลส่วนบุคคลออกภายนอก สามารถใช้งานบนเครื่องบิน รถยนต์ หรือสถานที่ไร้สัญญาณอินเทอร์เน็ตได้ 100%
              </span>
            </div>

            {/* Action Buttons: Certificate & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCertificate(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow cursor-pointer transition-colors"
              >
                <Award size={16} />
                <span>ดูใบประกาศนียบัตรยอดนักเรียน ป.1</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-600 border border-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw size={14} />
                  <span>รีเซ็ตสถิติ</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm cursor-pointer transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>

            {/* Printable Certificate Modal */}
            {showCertificate && (
              <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
                <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-8 border-amber-300 shadow-2xl text-center relative">
                  <button
                    type="button"
                    onClick={() => setShowCertificate(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
                  >
                    ✕
                  </button>

                  <div className="text-5xl mb-2">🏆</div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                    Certificate of Excellence
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    เกียรติบัตรยอดนักเรียนคนเก่ง ป.1
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    หลักสูตร Mini English Program (MEP) การเรียนรู้รายวัน
                  </p>

                  <div className="my-5 p-4 rounded-2xl bg-white border-2 border-dashed border-amber-300">
                    <p className="text-xs text-slate-500">ขอมอบประกาศนียบัตรนี้แก่</p>
                    <p className="text-xl font-black text-indigo-700 my-1">{profile.name}</p>
                    <p className="text-xs text-slate-600">
                      ผู้สำเร็จการฝึกฝนภาษาอังกฤษ ภาษาไทย และคณิตศาสตร์ ด้วยผลคะแนนรวม {profile.totalStars} ดาว ⭐ (ระดับเลเวล {profile.level})
                    </p>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    วันที่ออกเกียรติบัตร: {new Date().toLocaleDateString('th-TH')} • MEP Kids Learning App
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <Printer size={15} />
                      <span>พิมพ์หรือบันทึกภาพ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCertificate(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
                    >
                      ปิด
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
