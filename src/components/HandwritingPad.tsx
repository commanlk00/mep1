import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  Grid, 
  AlignLeft, 
  Square,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { sound } from '../utils/sound';

interface HandwritingPadProps {
  traceGuide?: string; // Optional character or word to display as faint tracing guide
  initialGuideType?: 'handwriting' | 'grid' | 'blank';
  title?: string;
  className?: string;
  isCollapsible?: boolean;
}

type GuideType = 'handwriting' | 'grid' | 'blank';
type ToolMode = 'pen' | 'highlighter' | 'eraser';

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  points: StrokePoint[];
  color: string;
  size: number;
  mode: ToolMode;
}

export const HandwritingPad: React.FC<HandwritingPadProps> = ({
  traceGuide,
  initialGuideType = 'handwriting',
  title = 'กระดานขีดเขียน & ทดเลขบนหน้าจอ (On-Screen Scratchpad)',
  className = '',
  isCollapsible = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [guideType, setGuideType] = useState<GuideType>(initialGuideType);
  const [toolMode, setToolMode] = useState<ToolMode>('pen');
  const [penColor, setPenColor] = useState<string>('#1e293b'); // dark slate
  const [penSize, setPenSize] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);

  // Sync ref
  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  const colors = [
    { label: 'ดำ/ดินสอ', value: '#1e293b', bg: 'bg-slate-800' },
    { label: 'น้ำเงิน', value: '#2563eb', bg: 'bg-blue-600' },
    { label: 'แดง', value: '#dc2626', bg: 'bg-red-600' },
    { label: 'เขียว', value: '#16a34a', bg: 'bg-emerald-600' },
    { label: 'ส้ม', value: '#ea580c', bg: 'bg-orange-600' },
  ];

  // Draw background guides & trace guides
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas completely
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (guideType === 'handwriting') {
      // 3-line ruling (Top line, dashed midline, baseline)
      const lineHeight = 55;
      const numLines = Math.floor(height / lineHeight);

      for (let i = 0; i < numLines; i++) {
        const topY = 25 + i * lineHeight;
        const midY = topY + lineHeight * 0.5;
        const botY = topY + lineHeight;

        if (botY > height - 10) break;

        // Top line
        ctx.strokeStyle = '#cbd5e1'; // light slate
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(15, topY);
        ctx.lineTo(width - 15, topY);
        ctx.stroke();

        // Dashed midline
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(15, midY);
        ctx.lineTo(width - 15, midY);
        ctx.stroke();

        // Baseline (thicker blue)
        ctx.strokeStyle = '#93c5fd'; // sky blue baseline
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(15, botY);
        ctx.lineTo(width - 15, botY);
        ctx.stroke();
      }
    } else if (guideType === 'grid') {
      // Math grid (quadrille)
      const gridSize = 28;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);

      // Vertical lines
      for (let x = gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Reset line dash
    ctx.setLineDash([]);

    // Draw optional trace guide (faint large text in middle or top line)
    if (traceGuide) {
      ctx.save();
      ctx.font = 'bold 56px "Sarabun", "Chakra Petch", sans-serif';
      ctx.fillStyle = 'rgba(203, 213, 225, 0.45)'; // faint gray
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(traceGuide, width / 2, height / 2);
      ctx.restore();
    }
  }, [guideType, traceGuide]);

  // Redraw all strokes cleanly without resizing the canvas buffer
  const redrawCanvas = useCallback((targetStrokes?: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0);

    drawBackground(ctx, width, height);

    const strokeList = targetStrokes !== undefined ? targetStrokes : strokesRef.current;

    strokeList.forEach((stroke) => {
      if (!stroke.points || stroke.points.length === 0) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.mode === 'eraser') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = stroke.size * 2.5;
      } else if (stroke.mode === 'highlighter') {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size * 3;
        ctx.globalAlpha = 0.35;
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.globalAlpha = 1.0;
      }

      ctx.beginPath();
      const p0 = stroke.points[0];
      ctx.moveTo(p0.x, p0.y);

      if (stroke.points.length === 1) {
        // Single dot tap
        ctx.lineTo(p0.x + 0.1, p0.y + 0.1);
      } else {
        for (let i = 1; i < stroke.points.length; i++) {
          const pt = stroke.points[i];
          ctx.lineTo(pt.x, pt.y);
        }
      }
      ctx.stroke();
      ctx.restore();
    });

    ctx.restore();
  }, [drawBackground]);

  // Resize canvas according to container only when size physically changes
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(280, Math.floor(rect.width));
    const height = 210; // Comfortable drawing height

    const targetPixelWidth = Math.floor(width * dpr);
    const targetPixelHeight = Math.floor(height * dpr);

    if (canvas.width !== targetPixelWidth || canvas.height !== targetPixelHeight) {
      canvas.width = targetPixelWidth;
      canvas.height = targetPixelHeight;
      canvas.style.width = '100%';
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0);
      }
    }

    redrawCanvas();
  }, [redrawCanvas]);

  // Initial and guide change resize
  useEffect(() => {
    if (isExpanded) {
      // Small timeout to allow container to calculate layout
      const timer = setTimeout(() => {
        resizeCanvas();
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, guideType, traceGuide, resizeCanvas]);

  // Resize observer to handle responsive layout without recreating on strokes
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isExpanded) return;

    const ro = new ResizeObserver(() => {
      resizeCanvas();
    });
    ro.observe(container);

    const handleWindowResize = () => {
      resizeCanvas();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [isExpanded, resizeCanvas]);

  // Prevent mobile browser touch gestures (scroll, pull-to-refresh, pinch zoom) while drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventDefaultTouch = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    canvas.addEventListener('touchstart', preventDefaultTouch, { passive: false });
    canvas.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    canvas.addEventListener('touchend', preventDefaultTouch, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', preventDefaultTouch);
      canvas.removeEventListener('touchmove', preventDefaultTouch);
      canvas.removeEventListener('touchend', preventDefaultTouch);
    };
  }, [isExpanded]);

  // Pointer event coordinate translation
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): StrokePoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Start Drawing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Safe fallback if pointer capture is not supported or already active
    }

    const pt = getCanvasPoint(e);
    if (!pt) return;

    setIsDrawing(true);
    const newStroke: Stroke = {
      points: [pt],
      color: penColor,
      size: penSize,
      mode: toolMode,
    };
    currentStrokeRef.current = newStroke;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (toolMode === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = penSize * 2.5;
    } else if (toolMode === 'highlighter') {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize * 3;
      ctx.globalAlpha = 0.35;
    } else {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.globalAlpha = 1.0;
    }

    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.lineTo(pt.x + 0.1, pt.y + 0.1);
    ctx.stroke();
    ctx.restore();
  };

  // Continue Drawing
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    if (e.cancelable) {
      e.preventDefault();
    }

    const pt = getCanvasPoint(e);
    if (!pt) return;

    currentStrokeRef.current.points.push(pt);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pts = currentStrokeRef.current.points;
    const p1 = pts[pts.length - 2];
    const p2 = pts[pts.length - 1];

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (toolMode === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = penSize * 2.5;
    } else if (toolMode === 'highlighter') {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize * 3;
      ctx.globalAlpha = 0.35;
    } else {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.globalAlpha = 1.0;
    }

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  };

  // Finish Drawing
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Safe fallback
    }

    setIsDrawing(false);
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      const completedStroke = currentStrokeRef.current;
      const updated = [...strokesRef.current, completedStroke];
      strokesRef.current = updated;
      setStrokes(updated);
    }
    currentStrokeRef.current = null;
    // Note: The stroke was already painted onto canvas context live!
    // No resizeCanvas or canvas clearing needed here.
  };

  // Undo stroke
  const handleUndo = () => {
    sound.playPop();
    const updated = strokesRef.current.slice(0, -1);
    strokesRef.current = updated;
    setStrokes(updated);
    redrawCanvas(updated);
  };

  // Clear all
  const handleClear = () => {
    sound.playPop();
    strokesRef.current = [];
    setStrokes([]);
    redrawCanvas([]);
  };

  return (
    <div className={`bg-amber-50/60 rounded-2xl border-2 border-amber-200 overflow-hidden shadow-sm transition-all ${className}`}>
      {/* Header Bar */}
      <div className="bg-white/80 backdrop-blur-sm px-3 py-2 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
            <PenTool size={16} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                รองรับนิ้ว & ปากกา Stylus
              </span>
            </h4>
            {traceGuide && (
              <span className="text-[11px] text-indigo-600 font-semibold">
                ฝึกเขียนคำว่า: &ldquo;{traceGuide}&rdquo; ตามรอยจางๆ บนกระดานได้เลย!
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Guide selection */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setGuideType('handwriting');
              }}
              title="เส้นบรรทัดคัดลายมือ 3 เส้น"
              className={`px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                guideType === 'handwriting' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <AlignLeft size={13} />
              <span className="hidden sm:inline">คัดลายมือ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setGuideType('grid');
              }}
              title="ตารางทดเลขสมุดคณิตศาสตร์"
              className={`px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                guideType === 'grid' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Grid size={13} />
              <span className="hidden sm:inline">ตารางทดเลข</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setGuideType('blank');
              }}
              title="กระดานเปล่า"
              className={`px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                guideType === 'blank' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Square size={13} />
              <span className="hidden sm:inline">กระดานเปล่า</span>
            </button>
          </div>

          {/* Collapse/Expand */}
          {isCollapsible && (
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setIsExpanded(!isExpanded);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
              title={isExpanded ? 'ย่อกระดาน' : 'ขยายกระดาน'}
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Canvas & Toolbar */}
      {isExpanded && (
        <div className="p-2 sm:p-3 space-y-2">
          {/* Tool Options Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2 rounded-xl border border-amber-200/80 text-xs">
            {/* Pens & Eraser */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setToolMode('pen');
                }}
                className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${
                  toolMode === 'pen' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <PenTool size={14} />
                <span>ดินสอ/ปากกา</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setToolMode('highlighter');
                }}
                className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${
                  toolMode === 'highlighter' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Sparkles size={14} />
                <span>เน้นคำ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setToolMode('eraser');
                }}
                className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${
                  toolMode === 'eraser' ? 'bg-rose-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eraser size={14} />
                <span>ยางลบ</span>
              </button>
            </div>

            {/* Colors */}
            {toolMode !== 'eraser' && (
              <div className="flex items-center gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setPenColor(c.value);
                    }}
                    title={c.label}
                    className={`w-6 h-6 rounded-full ${c.bg} transition-all cursor-pointer ${
                      penColor === c.value ? 'ring-3 ring-amber-400 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Stroke Size */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 font-semibold mr-1">ขนาดเส้น:</span>
              {[
                { label: 'S', size: 3 },
                { label: 'M', size: 6 },
                { label: 'L', size: 10 },
              ].map((s) => (
                <button
                  key={s.size}
                  type="button"
                  onClick={() => setPenSize(s.size)}
                  className={`w-6 h-6 rounded-md font-bold text-[11px] flex items-center justify-center cursor-pointer ${
                    penSize === s.size ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Undo & Clear */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center gap-1 cursor-pointer"
                title="ย้อนกลับ (Undo)"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">ย้อนกลับ</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center gap-1 cursor-pointer border border-rose-200"
                title="ล้างกระดาน (Clear)"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">ลบทั้งหมด</span>
              </button>
            </div>
          </div>

          {/* Touch-Friendly Canvas Wrapper */}
          <div
            ref={containerRef}
            className="w-full bg-white rounded-xl border-2 border-slate-300 shadow-inner overflow-hidden relative cursor-crosshair select-none"
            style={{ 
              touchAction: 'none', 
              userSelect: 'none', 
              WebkitUserSelect: 'none', 
              overscrollBehavior: 'contain' 
            }}
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="block w-full touch-none select-none"
              style={{
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>✏️ ใช้นิ้วหรือปากกาเขียนทดเลข สะกดคำ หรือวาดตามเส้นประได้ตามสบาย</span>
            <span>{strokes.length} ขีดเขียน</span>
          </div>
        </div>
      )}
    </div>
  );
};
