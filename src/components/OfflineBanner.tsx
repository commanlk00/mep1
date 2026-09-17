import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CheckCircle, Info } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs px-3 py-1.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <span className="flex items-center gap-1 font-bold bg-white/20 px-2 py-0.5 rounded-md">
          {isOnline ? (
            <>
              <Wifi size={13} className="text-emerald-200" />
              <span>โหมดพร้อมใช้ออฟไลน์ 100%</span>
            </>
          ) : (
            <>
              <WifiOff size={13} className="text-amber-300" />
              <span>กำลังใช้งานโหมดออฟไลน์ (Offline Mode)</span>
            </>
          )}
        </span>

        <span className="hidden sm:inline text-emerald-100">
          คำศัพท์ เสียงอ่านภาษาอังกฤษ-ไทย โจทย์เลข และรางวัล ทำงานในเครื่องได้โดยไม่ต้องต่อเน็ต
        </span>

        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="ml-auto text-emerald-100 hover:text-white underline text-[11px] cursor-pointer"
        >
          {showInfo ? 'ซ่อน' : 'วิธีใช้'}
        </button>
      </div>

      {showInfo && (
        <div className="fixed bottom-4 right-4 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-xl max-w-xs text-xs border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold flex items-center gap-1.5">
              <CheckCircle size={15} className="text-emerald-400" />
              <span>การใช้งานแบบออฟไลน์</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            แอปนี้สร้างด้วยระบบ Web Audio และข้อมูลบทเรียนในตัวเครื่อง (Local Cache) เด็กๆ จึงสามารถนำไปฝึกอ่านคำศัพท์ MEP และบวกเลขบนรถ รถไฟ หรือสถานที่ท่องเที่ยวที่ไม่มีอินเทอร์เน็ตได้ตลอดเวลา
          </p>
        </div>
      )}
    </div>
  );
};
